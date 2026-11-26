import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { DashboardMetrics } from "@shared/schema";

const PLATFORM_COLORS: Record<string, string> = {
  ebay: "bg-sky-50 text-sky-700",
  poshmark: "bg-rose-50 text-rose-700",
  mercari: "bg-violet-50 text-violet-700",
  "facebook marketplace": "bg-blue-50 text-blue-700",
};

function initials(title: string) {
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function RecentSales() {
  const [, setLocation] = useLocation();

  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const recentSales = metrics?.recentSales || [];

  return (
    <Card className="animate-fadeInUp h-full" style={{ animationDelay: "180ms" }}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle>Recent sales</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/sales")}
          className="-mr-2 h-8 gap-1 text-primary hover:bg-accent hover:text-primary"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="px-3">
        {isLoading ? (
          <div className="space-y-2 px-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-3 py-2">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/3 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : recentSales.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
              <ShoppingBag className="h-5 w-5 text-accent-foreground" />
            </div>
            <p className="font-semibold">No sales yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Record your first sale to see it here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/70">
            {recentSales.map((sale: any) => {
              const title = sale.itemTitle || "Sale";
              const profit = parseFloat(sale.profit ?? "NaN");
              const platformClass =
                PLATFORM_COLORS[(sale.platform || "").toLowerCase()] || "bg-muted text-muted-foreground";
              return (
                <li key={sale.id}>
                  <button
                    onClick={() => setLocation(`/sales?edit=${sale.id}`)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
                  >
                    {sale.itemImages && sale.itemImages.length > 0 ? (
                      <img src={sale.itemImages[0]} alt={title} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-bold text-slate-600">
                        {initials(title)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{title}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={`max-w-[9rem] truncate whitespace-nowrap rounded px-1.5 py-px font-medium ${platformClass}`}>
                          {sale.platform || "Direct"}
                        </span>
                        <span className="whitespace-nowrap">{new Date(sale.saleDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="tabular text-sm font-bold text-foreground">
                        ${parseFloat(sale.salePrice).toFixed(2)}
                      </p>
                      {!Number.isNaN(profit) && (
                        <p className={`tabular text-xs font-semibold ${profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {profit >= 0 ? "+" : "−"}${Math.abs(profit).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
