import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardMetrics } from "@shared/schema";

const money = (v: string | number) =>
  `$${parseFloat(String(v)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function InventoryValue() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const inventoryValue = metrics?.inventoryValue;

  const header = (
    <CardHeader className="pb-3">
      <CardTitle>Resell value</CardTitle>
      <p className="text-sm text-muted-foreground">What your current stock is worth at listed prices</p>
    </CardHeader>
  );

  if (isLoading) {
    return (
      <Card>
        {header}
        <CardContent>
          <div className="h-40 animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (!inventoryValue) {
    return (
      <Card>
        {header}
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">No inventory data yet</p>
        </CardContent>
      </Card>
    );
  }

  const potentialProfit = parseFloat(inventoryValue.potentialProfit);
  const totalInvestment = parseFloat(inventoryValue.totalInvestment);
  const potentialRevenue = parseFloat(inventoryValue.potentialRevenue);
  const margin = totalInvestment > 0 ? (potentialProfit / totalInvestment) * 100 : 0;
  // Share of potential revenue that is cost vs profit
  const costShare = potentialRevenue > 0 ? Math.min(100, (totalInvestment / potentialRevenue) * 100) : 0;

  return (
    <Card className="animate-fadeInUp h-full" style={{ animationDelay: "360ms" }}>
      {header}
      <CardContent className="space-y-5">
        <div>
          <div className="flex items-baseline justify-between">
            <p className="tabular text-3xl font-extrabold tracking-tight text-emerald-700">{money(potentialProfit)}</p>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              {margin.toFixed(0)}% ROI
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">potential profit across {inventoryValue.itemCount} items</p>
        </div>

        <div>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-slate-400" style={{ width: `${costShare}%` }} />
            <div className="h-full flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
              <span className="text-muted-foreground">Invested</span>
              <span className="tabular font-semibold">{money(totalInvestment)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              <span className="text-muted-foreground">If all sell</span>
              <span className="tabular font-semibold">{money(potentialRevenue)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
