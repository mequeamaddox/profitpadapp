import { useState } from "react";
import { Link } from "wouter";
import AuthLayout from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function ResetPassword() {
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Couldn't reset your password.");
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={done ? "Password updated" : "Choose a new password"}
      subtitle={done ? "You can now sign in with your new password." : "Use at least 8 characters."}
      footer={
        <Link href="/forgot-password" className="font-semibold text-primary hover:underline">
          Need a new reset link?
        </Link>
      }
    >
      {done ? (
        <div className="space-y-5">
          <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p>For your security, you've been signed out on all your devices.</p>
          </div>
          <Button className="h-11 w-full text-base" onClick={() => (window.location.href = "/login")}>
            Sign in
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {(error || !token) && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              {error || "This reset link is incomplete. Open the link from your email again."}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" autoComplete="new-password" className="h-11" minLength={8}
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input id="confirm" type="password" autoComplete="new-password" className="h-11" minLength={8}
              value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <Button type="submit" className="h-11 w-full text-base" disabled={loading || !token}>
            {loading && <Loader2 className="animate-spin" />}
            Save new password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
