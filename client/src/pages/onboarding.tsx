import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuthContext } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeCheck, CheckCircle2, Loader2, LogOut, ShieldCheck } from "lucide-react";
import PayPalButton from "@/components/PayPalButton";
import { BrandMark } from "@/components/layout/nav-panel";
import { PLANS, PeriodToggle, PlanCard } from "@/components/billing/plans";
import { MONEY_BACK_DAYS, SUPPORT_EMAIL, planPrice, type BillingPeriod, type PaidPlanId } from "@shared/plans";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Onboarding() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, refreshUser } = useAuthContext();

  const [selectedPlan, setSelectedPlan] = useState<PaidPlanId>("professional");
  const [showPayPalDialog, setShowPayPalDialog] = useState(false);
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handlePaymentSuccess = async () => {
    await refreshUser();
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    setPaymentCompleted(true);
    toast({
      title: "Payment received",
      description: "Your plan is active.",
    });
    setTimeout(() => {
      setLocation("/");
    }, 2000);
  };

  const handlePaymentDialogClose = (open: boolean) => {
    if (!open && !paymentCompleted) {
      setShowPayPalDialog(false);
    }
  };

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

  if (paymentCompleted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="max-w-md">
          <CardContent className="pt-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-9 w-9 text-emerald-600" />
            </div>
            <h2 className="mb-2 text-2xl font-extrabold">You're all set!</h2>
            <p className="text-muted-foreground">Taking you to your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedPlanData = PLANS.find((p) => p.id === selectedPlan);

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
                setShowPayPalDialog(true);
              }}
              actionLabel={`Get ${plan.name}`}
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
            <ShieldCheck className="h-4 w-4" /> Secure payments by PayPal
          </p>
        </div>
      </main>

      <Dialog open={showPayPalDialog} onOpenChange={handlePaymentDialogClose}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Get {selectedPlanData?.name}</DialogTitle>
            <DialogDescription>Complete your payment with PayPal.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-full rounded-xl bg-muted/60 p-4 text-center">
              <p className="tabular text-3xl font-extrabold">${planPrice(selectedPlan, period)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                charged today for {period === "monthly" ? "30 days" : "1 year"}
              </p>
            </div>
            <div className="w-full" data-testid="paypal-button-container">
              <PayPalButton
                plan={selectedPlan}
                period={period}
                onSuccess={handlePaymentSuccess}
                onFailure={(message) =>
                  toast({
                    title: "Payment not completed",
                    description: message,
                    variant: "destructive",
                  })
                }
              />
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BadgeCheck className="h-4 w-4 text-emerald-600" /> {MONEY_BACK_DAYS}-day money-back guarantee
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
