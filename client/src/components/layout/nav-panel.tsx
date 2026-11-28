import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Home,
  Package,
  DollarSign,
  Bell,
  Settings,
  HelpCircle,
  FileText,
  Receipt,
  Calculator,
  LogOut,
  Search,
  CreditCard,
  ArrowUpRight,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { User, Reminder } from "@shared/schema";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  match?: (location: string) => boolean;
  /** Only show for users this returns true for */
  show?: (user: NavUser | undefined) => boolean;
}

type NavUser = User & { teamRole?: "owner" | "member" | null; teamOwnerName?: string | null };

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: Home, match: (l) => l === "/" },
      { name: "Inventory", href: "/inventory", icon: Package, match: (l) => l.startsWith("/inventory") },
      { name: "Sales", href: "/sales", icon: DollarSign },
      { name: "Expenses", href: "/expenses", icon: Receipt },
      { name: "Reminders", href: "/reminders", icon: Bell },
    ],
  },
  {
    label: "Insights",
    items: [
      { name: "Reports", href: "/reports", icon: FileText },
      { name: "Research", href: "/research", icon: Search },
      { name: "Profit Estimator", href: "/profit-estimator", icon: Calculator },
    ],
  },
  {
    label: "Account",
    items: [
      {
        name: "Team",
        href: "/team",
        icon: Users,
        show: (u) => !!u?.teamRole || u?.subscriptionTier === "enterprise",
      },
      { name: "Billing", href: "/billing", icon: CreditCard },
      { name: "Settings", href: "/settings", icon: Settings, match: (l) => l.startsWith("/settings") },
      { name: "Help Center", href: "/help", icon: HelpCircle },
    ],
  },
];

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
  trial: "No plan yet",
};

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 shadow-lg shadow-emerald-900/30">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 17l5-5 4 4 7-8" />
          <path d="M15 8h5v5" />
        </svg>
      </div>
      <span className="text-lg font-extrabold tracking-tight">ProfitPad</span>
    </div>
  );
}

/**
 * The dark navigation panel shared by the desktop sidebar and the mobile sheet.
 */
export default function NavPanel({ onNavigate }: { onNavigate?: () => void }) {
  const [location, setLocation] = useLocation();

  const { data: user } = useQuery<NavUser>({ queryKey: ["/api/auth/user"] });
  const { data: overdueReminders = [] } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders?overdue=true"],
  });

  const go = (href: string) => {
    setLocation(href);
    onNavigate?.();
  };

  const tier = user?.subscriptionTier || "trial";
  const planLabel = user?.isAdmin
    ? "Admin"
    : user?.teamRole === "member"
      ? `Team · ${user.teamOwnerName ?? "Enterprise"}`
      : PLAN_LABELS[tier] ?? "No plan yet";
  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 pb-4 pt-6 text-white">
        <BrandMark />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/50">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.filter((item) => !item.show || item.show(user)).map((item) => {
                const active = item.match ? item.match(location) : location === item.href;
                const badge = item.href === "/reminders" && overdueReminders.length > 0 ? overdueReminders.length : null;
                return (
                  <button
                    key={item.href}
                    onClick={() => go(item.href)}
                    className={cn(
                      "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-white"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white",
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
                    )}
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        active ? "text-sidebar-primary" : "text-sidebar-foreground/70 group-hover:text-white",
                      )}
                    />
                    <span className="truncate">{item.name}</span>
                    {badge && (
                      <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-3 border-t border-sidebar-border p-3">
        {!user?.isAdmin && user?.teamRole !== "member" && tier !== "enterprise" && (
          <button
            onClick={() => go("/billing")}
            className="group w-full rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 p-3 text-left ring-1 ring-inset ring-emerald-400/20 transition hover:ring-emerald-400/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                {planLabel} plan
              </span>
              <ArrowUpRight className="h-4 w-4 text-emerald-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <p className="mt-1 text-sm font-medium text-white">
              {tier === "professional"
                ? "Bring your team with Enterprise"
                : tier === "starter"
                  ? "Go unlimited with Professional"
                  : "Pick a plan to keep growing"}
            </p>
          </button>
        )}

        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.email || "Account"}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">{planLabel}</p>
          </div>
          <button
            onClick={() => {
              window.location.href = "/logout";
            }}
            className="rounded-md p-2 text-sidebar-foreground/60 transition hover:bg-sidebar-accent hover:text-white"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
