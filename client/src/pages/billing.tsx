import { useState } from "react";
import { useAuthContext } from "@/context/auth-context";
import { useCheckout } from "@/hooks/use-checkout";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, ShieldCheck, Sparkles, LifeBuoy } from "lucide-react";
import { PLANS, PLAN_NAMES, PeriodToggle, PlanCard } from "@/components/billing/plans";
import { MONEY_BACK_DAYS, type BillingPeriod } from "@shared/plans";

export default function Billing() {
  const { user, isLoading } = useAuthContext();
  const { checkout, pendingPlan } = useCheckout("billing");
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tier = user.subscriptionTier || "trial";
  const isAdmin = user.isAdmin;
  // "trial" means no plan yet (there's no free trial)
  const noPlan = tier === "trial";
  const planEnd = user.planExpiresAt ? new Date(user.planExpiresAt) : null;
  const planExpired = !noPlan && !!planEnd && planEnd.getTime() < Date.now();
  const isTeammate = user.teamRole === "member";
  const fmtDate = (d: Date) => d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Header title="Billing" subtitle="Your plan and payments" />

        <div className="flex-1 overflow-y-auto px-4 pb-32 pt-5 md:px-8 md:pt-6">
          <div className="mx-auto max-w-6xl space-y-10">
            {/* Current plan */}
            <Card className="overflow-hidden">
              <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current plan</p>
                    <p className="mt-0.5 text-xl font-bold">{isAdmin ? "Admin · full access" : PLAN_NAMES[tier] ?? tier}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {isTeammate
                        ? `You're on ${user.teamOwnerName ?? "your owner"}'s team. They manage the plan and billing.`
                        : isAdmin
                        ? "Admin accounts have every feature with no limits."
                        : noPlan
                          ? "Pick a plan below to start adding items and sales."
                          : planExpired
                                ? `Your plan ended ${fmtDate(planEnd!)}. Renew to keep adding items and sales.`
                                : planEnd
                                  ? `Paid through ${fmtDate(planEnd)}. Renew any time to add more time.`
                                  : "Thanks for being a ProfitPad subscriber."}
                    </p>
                  </div>
                </div>
                {planExpired && !isAdmin && (
                  <div className="flex items-center gap-2 self-start rounded-full bg-rose-50 px-3.5 py-2 text-sm font-semibold text-rose-700 md:self-auto">
                    <CalendarClock className="h-4 w-4" />
                    Plan expired
                  </div>
                )}
              </div>
            </Card>

            {/* Plans (the account owner pays; teammates don't) */}
            {!isTeammate && (
            <section>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">Pick the plan that fits</h2>
                <p className="mt-2 text-muted-foreground">
                  Simple pricing, paid securely with PayPal. {MONEY_BACK_DAYS}-day money-back guarantee.
                </p>
                <div className="mt-5">
                  <PeriodToggle value={period} onChange={setPeriod} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-stretch">
                {PLANS.map((plan) => {
                  const isCurrent = !isAdmin && tier === plan.id;
                  return (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      period={period}
                      current={isCurrent}
                      onSelect={() => checkout(plan.id, period)}
                      disabled={pendingPlan !== null}
                      actionLabel={
                        pendingPlan === plan.id
                          ? "Taking you to checkout…"
                          : isCurrent
                          ? `Renew ${plan.name} · add ${period === "monthly" ? "a month" : "a year"}`
                          : `Choose ${plan.name}`
                      }
                    />
                  );
                })}
              </div>
            </section>
            )}

            {/* Payment info */}
            {!isTeammate && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card className="flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Secure checkout with PayPal</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pay with your PayPal balance, a credit or debit card, or your bank. ProfitPad never sees your card details.
                  </p>
                </div>
              </Card>
              <Card className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                  <LifeBuoy className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Questions about billing?</p>
                  <p className="mt-1 text-sm text-muted-foreground">We're happy to help you pick the right plan.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => (window.location.href = "/help")}>
                  Get help
                </Button>
              </Card>
            </div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
