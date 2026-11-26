// Paid plan prices in USD. The server charges these amounts; the client
// only sends the plan id and billing period, never a price.
export const PAID_PLAN_PRICES = {
  starter: { monthly: "9.99", yearly: "99.00" },
  professional: { monthly: "19.99", yearly: "199.00" },
  enterprise: { monthly: "49.99", yearly: "499.00" },
} as const;

export type PaidPlanId = keyof typeof PAID_PLAN_PRICES;
export type BillingPeriod = "monthly" | "yearly";

// How long one payment keeps a plan active.
export const PERIOD_DAYS: Record<BillingPeriod, number> = {
  monthly: 30,
  yearly: 365,
};

export function isPaidPlanId(value: unknown): value is PaidPlanId {
  return typeof value === "string" && value in PAID_PLAN_PRICES;
}

export function isBillingPeriod(value: unknown): value is BillingPeriod {
  return value === "monthly" || value === "yearly";
}

export function planPrice(plan: PaidPlanId, period: BillingPeriod): string {
  return PAID_PLAN_PRICES[plan][period];
}

/** When a payment made now ends, extending any time left on the same plan. */
export function extendPlan(
  currentTier: string | null | undefined,
  currentExpiry: Date | string | null | undefined,
  plan: PaidPlanId,
  period: BillingPeriod,
  now: Date = new Date(),
): Date {
  const expiry = currentExpiry ? new Date(currentExpiry) : null;
  const start = currentTier === plan && expiry && expiry > now ? expiry : now;
  return new Date(start.getTime() + PERIOD_DAYS[period] * 86_400_000);
}

// Teammates an Enterprise owner can add (not counting the owner)
export const ENTERPRISE_TEAM_SEATS = 5;
