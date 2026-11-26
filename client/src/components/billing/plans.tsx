import { Check, Star, Crown, Building2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAID_PLAN_PRICES, type PaidPlanId } from "@shared/plans";

export interface Plan {
  id: PaidPlanId;
  name: string;
  tagline: string;
  icon: LucideIcon;
  popular?: boolean;
  features: string[];
}

// Features mirror the limits enforced in server/subscriptionLimits.ts
export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For side hustles getting off the ground",
    icon: Star,
    features: [
      "Up to 100 inventory items",
      "Up to 100 sales records",
      "50 reminders",
      "Profit & fee tracking",
      "Barcode scanning",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "For full-time resellers",
    icon: Crown,
    popular: true,
    features: [
      "Up to 500 inventory items",
      "Up to 500 sales records",
      "200 reminders",
      "CSV import & custom reports",
      "Advanced analytics",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For teams and high-volume stores",
    icon: Building2,
    features: [
      "Unlimited inventory & sales",
      "Unlimited reminders",
      "Team access",
      "Everything in Professional",
    ],
  },
];

export const planPrice = (id: PaidPlanId) => PAID_PLAN_PRICES[id];

export function PlanCard({
  plan,
  selected,
  current,
  onSelect,
  actionLabel,
  disabled,
}: {
  plan: Plan;
  selected?: boolean;
  current?: boolean;
  onSelect: () => void;
  actionLabel: string;
  disabled?: boolean;
}) {
  const featured = plan.popular;
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-6 transition-all",
        featured
          ? "border-transparent bg-sidebar text-white shadow-xl shadow-emerald-950/20"
          : "border-border bg-card shadow-card hover:shadow-lift",
        selected && !featured && "border-primary ring-4 ring-primary/10",
        selected && featured && "ring-4 ring-emerald-400/40",
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            featured ? "bg-emerald-400/15 text-emerald-300" : "bg-accent text-accent-foreground",
          )}
        >
          <plan.icon className="h-5 w-5" />
        </div>
        <div className="flex gap-1.5">
          {current && (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                featured ? "bg-white/10 text-white" : "bg-muted text-foreground",
              )}
            >
              Current
            </span>
          )}
          {featured && (
            <span className="rounded-full bg-gradient-to-r from-emerald-400 to-lime-300 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-950">
              Most popular
            </span>
          )}
        </div>
      </div>

      <h3 className="mt-5 text-lg font-bold">{plan.name}</h3>
      <p className={cn("mt-1 text-sm", featured ? "text-sidebar-foreground" : "text-muted-foreground")}>
        {plan.tagline}
      </p>

      <p className="mt-5 flex items-baseline gap-1">
        <span className="tabular text-4xl font-extrabold tracking-tight">${planPrice(plan.id)}</span>
        <span className={cn("text-sm", featured ? "text-sidebar-foreground" : "text-muted-foreground")}>/month</span>
      </p>

      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <span
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                featured ? "bg-emerald-400/20 text-emerald-300" : "bg-emerald-50 text-emerald-700",
              )}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className={featured ? "text-white/90" : "text-foreground/90"}>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        disabled={disabled}
        className={cn(
          "mt-8 h-11 w-full rounded-lg text-sm font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
          featured
            ? "bg-gradient-to-r from-emerald-400 to-lime-300 text-emerald-950 hover:brightness-105"
            : selected
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "border border-border bg-card text-foreground hover:bg-muted",
        )}
      >
        {actionLabel}
      </button>
    </div>
  );
}
