import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/auth-context";
import type { BillingPeriod, PaidPlanId } from "@shared/plans";

/**
 * Sends the buyer to PayPal's checkout page for a plan. PayPal brings them
 * back with ?checkout=success|cancelled|failed, which shows a toast here.
 */
export function useCheckout(from: "billing" | "onboarding") {
  const { toast } = useToast();
  const { refreshUser } = useAuthContext();
  const [pendingPlan, setPendingPlan] = useState<PaidPlanId | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const outcome = params.get("checkout");
    if (!outcome) return;
    params.delete("checkout");
    const rest = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (rest ? `?${rest}` : ""));

    if (outcome === "success") {
      refreshUser();
      toast({ title: "Payment received", description: "Your plan is active. Thanks for choosing ProfitPad!" });
    } else if (outcome === "cancelled") {
      toast({ title: "Checkout cancelled", description: "No payment was made." });
    } else if (outcome === "failed") {
      toast({
        title: "Payment not completed",
        description: "PayPal didn't confirm the payment, so you weren't charged. Please try again.",
        variant: "destructive",
      });
    }
  }, []);

  // Coming back with the browser's Back button from PayPal restores this
  // page as it was; let them pick a plan again.
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => e.persisted && setPendingPlan(null);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  async function checkout(plan: PaidPlanId, period: BillingPeriod) {
    setPendingPlan(plan);
    try {
      const res = await apiRequest("POST", "/paypal/checkout", { plan, period, from });
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setPendingPlan(null);
      toast({
        title: "Couldn't start checkout",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    }
  }

  return { checkout, pendingPlan };
}
