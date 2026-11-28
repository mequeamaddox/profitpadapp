import { useState } from "react";
import { useLocation } from "wouter";
import { useAuthContext } from "@/context/auth-context";
import { useCheckout } from "@/hooks/use-checkout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/layout/nav-panel";
import { PLANS, PeriodToggle, PlanCard } from "@/components/billing/plans";
import { MONEY_BACK_DAYS, SUPPORT_EMAIL, isBillingPeriod, isPaidPlanId, planPrice, type BillingPeriod, type PaidPlanId } from "@shared/plans";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuthContext();
  const { checkout, pendingPlan } = useCheckout("onboarding");

  // A plan picked before signing up arrives as ?plan=&period=
  const [picked] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    const period = params.get("period");
    return {
      plan: isPaidPlanId(plan) ? plan : null,
      period: isBillingPeriod(period) ? period : "monthly",
    } as { plan: PaidPlanId | null; period: BillingPeriod };
  });
  const [selectedPlan, setSelectedPlan] = useState<PaidPlanId>(picked.plan ?? "professional");
  const [period, setPeriod] = useState<BillingPeriod>(picked.period);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="mb-2 text-xl font-bold">Please log in</h2>
            <p className="mb-4 text-muted-foreground">You need to be logged in to choose a plan.</p>
            <Button onClick={() => setLocation("/login")}>Go to login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70 bg-background/80 px-5 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <BrandMark />
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="hidden sm:inline">Signed in as {user.email}</span>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/logout")}>
              <LogOut /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
            Last step
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">Choose your plan</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Pick the plan that fits your business. Every plan comes with a {MONEY_BACK_DAYS}-day money-back
            guarantee.
          </p>
          {picked.plan ? (
            <div className="mx-auto mt-7 max-w-md rounded-2xl border border-primary/30 bg-card p-5 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">You picked</p>
              <p className="mt-1 text-xl font-bold">
                {PLANS.find((p) => p.id === selectedPlan)?.name} · ${planPrice(selectedPlan, period)}/
                {period === "monthly" ? "month" : "year"}
              </p>
              <Button
                className="mt-4 h-11 w-full text-base"
                disabled={pendingPlan !== null}
                onClick={() => checkout(selectedPlan, period)}
              >
                {pendingPlan ? <Loader2 className="animate-spin" /> : null}
                {pendingPlan ? "Taking you to checkout…" : "Continue to secure checkout"}
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">Pay with PayPal or a debit/credit card. Or choose a different plan below.</p>
            </div>
          ) : null}
          <div className="mt-6">
            <PeriodToggle value={period} onChange={setPeriod} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-stretch">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              period={period}
              selected={selectedPlan === plan.id}
              onSelect={() => {
                setSelectedPlan(plan.id);
                checkout(plan.id, period);
              }}
              disabled={pendingPlan !== null}
              actionLabel={pendingPlan === plan.id ? "Taking you to checkout…" : `Get ${plan.name}`}
            />
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-3 rounded-2xl border border-border/80 bg-card p-6 text-center shadow-card">
          <BadgeCheck className="h-8 w-8 text-emerald-600" />
          <p className="text-lg font-bold">{MONEY_BACK_DAYS}-day money-back guarantee</p>
          <p className="text-sm text-muted-foreground">
            If ProfitPad isn't right for you, email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-primary hover:underline">
              {SUPPORT_EMAIL}
            </a>{" "}
            within {MONEY_BACK_DAYS} days of your first payment for a full refund.
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" /> Secure checkout with PayPal · card or PayPal account
          </p>
        </div>
      </main>

    </div>
  );
}
