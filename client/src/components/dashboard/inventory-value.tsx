import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, DollarSign, Target } from "lucide-react";
import { DashboardMetrics } from "@shared/schema";

export default function InventoryValue() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const inventoryValue = metrics?.inventoryValue;

  if (isLoading) {
    return (
      <Card className="card-premium animate-fadeInUp" style={{ animationDelay: '1200ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="text-foreground">Inventory Resell Value</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!inventoryValue) {
    return (
      <Card className="card-premium animate-fadeInUp" style={{ animationDelay: '1200ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="text-foreground">Inventory Resell Value</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No inventory data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const potentialProfit = parseFloat(inventoryValue.potentialProfit);
  const totalInvestment = parseFloat(inventoryValue.totalInvestment);
  const potentialRevenue = parseFloat(inventoryValue.potentialRevenue);
  const profitMargin = totalInvestment > 0 ? (potentialProfit / totalInvestment) * 100 : 0;

  return (
    <Card className="card-premium animate-fadeInUp" style={{ animationDelay: '1200ms' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300 text-primary" />
          <span className="text-foreground">Inventory Resell Value</span>
          {totalInvestment > 0 && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Potential profit from current inventory at listed prices
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-300 hover:scale-[1.02] animate-fadeInUp" style={{ animationDelay: '1300ms' }}>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600 transition-transform duration-300 hover:scale-110" />
              <span className="text-sm font-medium text-blue-900">Total Investment</span>
            </div>
            <span className="font-semibold text-blue-900">
              ${inventoryValue.totalInvestment}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-300 hover:scale-[1.02] animate-fadeInUp" style={{ animationDelay: '1400ms' }}>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600 transition-transform duration-300 hover:scale-110" />
              <span className="text-sm font-medium text-green-900">Potential Revenue</span>
            </div>
            <span className="font-semibold text-green-900">
              ${inventoryValue.potentialRevenue}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all duration-300 hover:scale-[1.02] animate-fadeInUp" style={{ animationDelay: '1500ms' }}>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600 transition-transform duration-300 hover:scale-110" />
              <span className="text-sm font-medium text-emerald-900">Potential Profit</span>
            </div>
            <span className="font-semibold text-emerald-900">
              ${inventoryValue.potentialProfit}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Items in Stock</span>
            </div>
            <span className="font-semibold text-slate-700">
              {inventoryValue.itemCount}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Profit Margin:</span>
            <span className={`font-semibold ${profitMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profitMargin.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}