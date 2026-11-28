// Typical seller fees by marketplace, used to pre-fill a sale's platform fee.
// These are estimates (rates vary by category, store level and promotions),
// so the fee is always editable.
export interface FeeRule {
  percent: number; // share of the sale price
  fixed: number; // flat amount per order, in USD
  note: string;
}

const RULES: Record<string, FeeRule> = {
  ebay: { percent: 0.1325, fixed: 0.4, note: "13.25% + $0.40" },
  amazon: { percent: 0.15, fixed: 0, note: "15% referral fee" },
  mercari: { percent: 0.1, fixed: 0, note: "10%" },
  poshmark: { percent: 0.2, fixed: 0, note: "20% (flat $2.95 under $15)" },
  depop: { percent: 0.033, fixed: 0.45, note: "3.3% + $0.45 payment fee" },
  "facebook marketplace": { percent: 0.1, fixed: 0, note: "10% for shipped orders" },
  etsy: { percent: 0.095, fixed: 0.45, note: "6.5% + 3% + $0.25 processing + $0.20 listing" },
  stockx: { percent: 0.12, fixed: 0, note: "9% + 3% processing" },
  goat: { percent: 0.124, fixed: 5, note: "9.5% + 2.9% + $5 seller fee" },
  reverb: { percent: 0.0819, fixed: 0.49, note: "5% + 3.19% + $0.49" },
  chrono24: { percent: 0.065, fixed: 0, note: "6.5%" },
  shopify: { percent: 0.029, fixed: 0.3, note: "2.9% + $0.30 card processing" },
  vinted: { percent: 0, fixed: 0, note: "no seller fee" },
  "direct sale": { percent: 0, fixed: 0, note: "no fee" },
};

export function feeRule(platform: string | null | undefined): FeeRule | null {
  if (!platform) return null;
  return RULES[platform.trim().toLowerCase()] ?? null;
}

/** Estimated platform fee for a sale, or null when there's no rule for the platform. */
export function estimateFee(platform: string | null | undefined, salePrice: number): number | null {
  const rule = feeRule(platform);
  if (!rule || !(salePrice > 0)) return null;
  // Poshmark charges a flat $2.95 on sales under $15
  if (platform!.trim().toLowerCase() === "poshmark" && salePrice < 15) return 2.95;
  return Math.round((salePrice * rule.percent + rule.fixed) * 100) / 100;
}
