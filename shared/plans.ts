// Paid plan prices in USD. The server charges these amounts; the client
// only sends the plan id, never a price.
export const PAID_PLAN_PRICES = {
  starter: "9.99",
  professional: "19.99",
  enterprise: "49.99",
} as const;

export type PaidPlanId = keyof typeof PAID_PLAN_PRICES;

export function isPaidPlanId(value: unknown): value is PaidPlanId {
  return typeof value === "string" && value in PAID_PLAN_PRICES;
}
