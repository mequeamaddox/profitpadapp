import { useState } from "react";
import { useLocation } from "wouter";
import { useAuthContext } from "@/context/auth-context";
import AuthLayout from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { nextPath } from "@/lib/utils";

export default function Login() {
  const { login } = useAuthContext();
  const [, setLocation] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      const next = nextPath();
      // Server routes (like finishing a PayPal checkout) need a full page load
      if (next.startsWith("/paypal/")) window.location.href = next;
      else setLocation(next);
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to see how your business is doing."
      footer={
        <>
          New to ProfitPad?{" "}
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={() => setLocation(`/register${window.location.search}`)}
          >
            Create an account
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-11"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className="h-11"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="h-11 w-full text-base" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
