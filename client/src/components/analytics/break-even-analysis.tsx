import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp, AlertTriangle, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { DashboardMetrics } from "@shared/schema";

interface BreakEvenData {
  totalInvestment: number;
  currentProfit: number;
  remainingToBreakEven: number;
  breakEvenPercentage: number;
  projectedBreakEvenDays: number;
  averageDailyProfit: number;
}

export default function BreakEvenAnalysis() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Break-Even Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-8 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Break-Even Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">
            No data available for analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalInvestment = parseFloat(metrics.inventoryValue?.totalInvestment || "0");
  const currentProfit = parseFloat(metrics.totalProfit || "0");
  const remainingToBreakEven = Math.max(0, totalInvestment - currentProfit);
  const breakEvenPercentage = totalInvestment > 0 ? (currentProfit / totalInvestment) * 100 : 0;
  
  // Estimate break-even timeline based on recent sales trend
  const recentSales = metrics.recentSales || [];
  const last30DaysProfit = recentSales
    .filter(sale => {
      const saleDate = new Date(sale.saleDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return saleDate >= thirtyDaysAgo;
    })
    .reduce((sum, sale) => sum + parseFloat(sale.profit || "0"), 0);
  
  const averageDailyProfit = last30DaysProfit / 30;
  const projectedBreakEvenDays = averageDailyProfit > 0 ? Math.ceil(remainingToBreakEven / averageDailyProfit) : 0;

  const breakEvenData: BreakEvenData = {
    totalInvestment,
    currentProfit,
    remainingToBreakEven,
    breakEvenPercentage: Math.min(100, breakEvenPercentage),
    projectedBreakEvenDays,
    averageDailyProfit,
  };

  const isBreakEvenReached = currentProfit >= totalInvestment;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Break-Even Analysis
        </CardTitle>
        <p className="text-sm text-slate-600">
          Track progress toward recovering your inventory investment
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Break-Even Progress</span>
            <span className={`font-semibold ${isBreakEvenReached ? 'text-green-600' : 'text-blue-600'}`}>
              {breakEvenData.breakEvenPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={breakEvenData.breakEvenPercentage} 
            className="h-3"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>$0</span>
            <span>${totalInvestment.toFixed(2)} (Break-Even)</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Investment</span>
            </div>
            <div className="text-lg font-semibold text-blue-900">
              ${totalInvestment.toFixed(2)}
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Current Profit</span>
            </div>
            <div className="text-lg font-semibold text-green-900">
              ${currentProfit.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Break-Even Status */}
        {isBreakEvenReached ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-semibold text-green-900">Break-Even Achieved!</span>
            </div>
            <p className="text-sm text-green-700">
              You've recovered your inventory investment. All future profits are pure gain!
            </p>
            <div className="mt-2 text-sm text-green-600">
              Excess profit: <span className="font-semibold">${(currentProfit - totalInvestment).toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-semibold text-orange-900">Remaining to Break-Even</span>
              </div>
              <div className="text-2xl font-bold text-orange-900 mb-1">
                ${remainingToBreakEven.toFixed(2)}
              </div>
              <p className="text-sm text-orange-700">
                You need ${remainingToBreakEven.toFixed(2)} more in profit to recover your investment
              </p>
            </div>

            {/* Projection */}
            {averageDailyProfit > 0 && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-600 mb-1">Estimated Break-Even Timeline</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {projectedBreakEvenDays} days
                    </div>
                    <div className="text-xs text-slate-500">
                      Based on ${averageDailyProfit.toFixed(2)}/day avg profit
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600">Target Date</div>
                    <div className="font-medium text-slate-900">
                      {new Date(Date.now() + projectedBreakEvenDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}