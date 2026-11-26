import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Package, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardMetrics } from "@shared/schema";

const money = (value: string | number | undefined) =>
  `$${parseFloat(String(value ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

function ChangePill({ change }: { change?: string }) {
  if (!change) {
    return <span className="text-xs text-muted-foreground">No change data yet</span>;
  }
  const up = change.startsWith("+");
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold",
          up ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
        )}
      >
        <Icon className="h-3 w-3" />
        {change}
      </span>
      <span className="hidden whitespace-nowrap xl:inline">this month vs last</span>
    </span>
  );
}

export default function MetricsGrid() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="mb-6 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-[132px] animate-pulse p-5">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="mt-4 h-7 w-28 rounded bg-muted" />
            <div className="mt-4 h-3 w-32 rounded bg-muted" />
          </Card>
        ))}
      </div>
    );
  }

  const goal = parseFloat(metrics?.monthlyGoal || "0");
  const progress = Math.min(metrics?.monthlyGoalProgress || 0, 100);

  const stats = [
    {
      label: "Total sales",
      value: money(metrics?.totalSales),
      change: metrics?.salesChange,
      icon: DollarSign,
      tint: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    },
    {
      label: "Total profit",
      value: money(metrics?.totalProfit),
      change: metrics?.profitChange,
      icon: TrendingUp,
      tint: "bg-sky-50 text-sky-700 ring-sky-600/10",
    },
    {
      label: "Items sold",
      value: (metrics?.itemsSold ?? 0).toLocaleString(),
      change: metrics?.itemsSoldChange,
      icon: Package,
      tint: "bg-violet-50 text-violet-700 ring-violet-600/10",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card
          key={stat.label}
          className="animate-fadeInUp p-4 transition-shadow hover:shadow-lift md:p-5"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset", stat.tint)}>
              <stat.icon className="h-4 w-4" />
            </div>
          </div>
          <p className="tabular mt-2 text-2xl font-extrabold tracking-tight text-foreground md:text-[28px]">{stat.value}</p>
          <div className="mt-2">
            <ChangePill change={stat.change} />
          </div>
        </Card>
      ))}

      {/* Monthly goal gets the brand treatment */}
      <Card
        className="animate-fadeInUp relative overflow-hidden border-transparent bg-gradient-to-br from-emerald-700 to-emerald-900 p-4 text-white md:p-5"
        style={{ animationDelay: "180ms" }}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100/80">Monthly goal</p>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-inset ring-white/20">
            <Target className="h-4 w-4" />
          </div>
        </div>
        <p className="tabular mt-2 text-2xl font-extrabold tracking-tight md:text-[28px]">{progress.toFixed(0)}%</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-lime-300 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-emerald-100/80">
          {goal > 0 ? `of ${money(goal)} profit this month` : "Set a goal in Settings"}
        </p>
      </Card>
    </div>
  );
}
