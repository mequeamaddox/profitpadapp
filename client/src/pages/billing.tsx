import { useState } from "react";
import { useAuthContext } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, ShieldCheck, Sparkles, LifeBuoy } from "lucide-react";
import PayPalButton from "@/components/PayPalButton";
import { PLANS, PlanCard, planPrice } from "@/components/billing/plans";
import type { PaidPlanId } from "@shared/plans";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TIER_NAMES: Record<string, string> = {
  trial: "Free trial",
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
};

export default function Billing() {
  const { toast } = useToast();
  const { user, isLoading, refreshUser } = useAuthContext();
  const [selectedPlan, setSelectedPlan] = useState<PaidPlanId | null>(null);
  const [showPayPalDialog, setShowPayPalDialog] = useState(false);

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
  const trialEnd = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
  const daysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86_400_000)) : null;
  const onTrial = tier === "trial";
  const trialExpired = onTrial && daysLeft === 0;

  const handlePlanSelect = (planId: PaidPlanId) => {
    setSelectedPlan(planId);
    setShowPayPalDialog(true);
  };

  const selected = PLANS.find((p) => p.id === selectedPlan);

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
                    <p className="mt-0.5 text-xl font-bold">{isAdmin ? "Admin · full access" : TIER_NAMES[tier] ?? tier}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {isAdmin
                        ? "Admin accounts have every feature with no limits."
                        : trialExpired
                          ? "Your trial has ended. Pick a plan to keep going."
                          : onTrial && trialEnd
                            ? `Trial ends ${trialEnd.toLocaleDateString(undefined, { month: "long", day: "numeric" })}`
                            : onTrial
                              ? "Choose a plan whenever you're ready."
                              : "Thanks for being a ProfitPad subscriber."}
                    </p>
                  </div>
                </div>
                {onTrial && daysLeft !== null && !isAdmin && (
                  <div
                    className={`flex items-center gap-2 self-start rounded-full px-3.5 py-2 text-sm font-semibold md:self-auto ${
                      trialExpired ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    <CalendarClock className="h-4 w-4" />
                    {trialExpired ? "Trial expired" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
                  </div>
                )}
              </div>
              {onTrial && daysLeft !== null && !trialExpired && !isAdmin && (
                <div className="h-1 bg-muted">
                  <div className="h-full bg-amber-400" style={{ width: `${(daysLeft / 3) * 100}%` }} />
                </div>
              )}
            </Card>

            {/* Plans */}
            <section>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">Pick the plan that fits</h2>
                <p className="mt-2 text-muted-foreground">Simple pricing. Pay securely with PayPal.</p>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-stretch">
                {PLANS.map((plan) => {
                  const isCurrent = !isAdmin && tier === plan.id;
                  return (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      current={isCurrent}
                      disabled={isCurrent}
                      onSelect={() => handlePlanSelect(plan.id)}
                      actionLabel={isCurrent ? "Your current plan" : `Choose ${plan.name}`}
                    />
                  );
                })}
              </div>
            </section>

            {/* Payment info */}
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
          </div>
        </div>
      </main>

      <Dialog open={showPayPalDialog} onOpenChange={setShowPayPalDialog}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade to {selected?.name}</DialogTitle>
            <DialogDescription>Complete your payment with PayPal.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-full rounded-xl bg-muted/60 p-4 text-center">
              <p className="tabular text-3xl font-extrabold">${selectedPlan ? planPrice(selectedPlan) : ""}</p>
              <p className="mt-1 text-sm text-muted-foreground">charged today</p>
            </div>
            {selectedPlan && (
              <PayPalButton
                plan={selectedPlan}
                onSuccess={async () => {
                  await refreshUser();
                  setShowPayPalDialog(false);
                  toast({
                    title: "Payment received",
                    description: "Your plan has been upgraded.",
                  });
                }}
                onFailure={(message) =>
                  toast({
                    title: "Payment not completed",
                    description: message,
                    variant: "destructive",
                  })
                }
              />
            )}
            <p className="text-center text-xs text-muted-foreground">Payments are processed securely by PayPal.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
