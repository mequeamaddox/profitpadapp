import { useState } from "react";
import { Link } from "wouter";
import AuthLayout from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2 } from "lucide-react";
import { SUPPORT_EMAIL } from "@shared/plans";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Something went wrong. Please try again.");
      }
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={sent ? "Check your email" : "Reset your password"}
      subtitle={
        sent
          ? `If ${email} has a ProfitPad account, we've sent it a link to choose a new password. It works for 1 hour.`
          : "Enter the email you signed up with and we'll send you a reset link."
      }
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="space-y-4">
          <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p>Didn't get it? Check your spam folder, or wait a couple of minutes and try again.</p>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Still stuck? Email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-primary hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</div>
          )}
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
          <Button type="submit" className="h-11 w-full text-base" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
