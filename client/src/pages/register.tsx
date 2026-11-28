import { useState } from "react";
import { useLocation } from "wouter";
import { useAuthContext } from "@/context/auth-context";
import AuthLayout from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { nextPath } from "@/lib/utils";
import { PLANS } from "@/components/billing/plans";
import { MONEY_BACK_DAYS, isBillingPeriod, isPaidPlanId, planPrice } from "@shared/plans";

export default function Register() {
  const { register } = useAuthContext();
  const [, setLocation] = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  // A plan picked on the pricing section carries through to checkout.
  const params = new URLSearchParams(window.location.search);
  const planParam = params.get("plan");
  const periodParam = params.get("period");
  const chosenPlan = isPaidPlanId(planParam) ? PLANS.find((p) => p.id === planParam) : undefined;
  const chosenPeriod = isBillingPeriod(periodParam) ? periodParam : "monthly";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(form);
      const next = chosenPlan
        ? `/onboarding?plan=${chosenPlan.id}&period=${chosenPeriod}`
        : nextPath();
      // Server routes (like finishing a PayPal checkout) need a full page load
      if (next.startsWith("/paypal/") || chosenPlan) window.location.href = next;
      else setLocation(next);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking your profit in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={() => setLocation(`/login${window.location.search}`)}
          >
            Sign in
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {chosenPlan && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-accent/60 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your plan</p>
              <p className="font-bold">
                {chosenPlan.name} · ${planPrice(chosenPlan.id, chosenPeriod)}/{chosenPeriod === "monthly" ? "month" : "year"}
              </p>
            </div>
            <p className="max-w-[9rem] text-right text-xs text-muted-foreground">You'll pay by PayPal or card on the next step</p>
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              autoComplete="given-name"
              className="h-11"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              autoComplete="family-name"
              className="h-11"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-11"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            className="h-11"
            placeholder="At least 8 characters"
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <Button type="submit" className="h-11 w-full text-base" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          {loading ? "Creating account..." : chosenPlan ? "Create account & continue" : "Create account"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Covered by our {MONEY_BACK_DAYS}-day money-back guarantee. By creating an account you agree to our{" "}
          <a href="/terms" className="underline hover:text-foreground">Terms</a> and{" "}
          <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>.
        </p>
      </form>
    </AuthLayout>
  );
}
