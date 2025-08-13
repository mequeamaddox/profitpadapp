import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, Package, Target } from "lucide-react";
import { DashboardMetrics } from "@shared/schema";

export default function MetricsGrid() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const getChangeType = (change?: string) => {
    if (!change) return "neutral";
    return change.startsWith("+") ? "positive" : "negative";
  };

  const metricCards = [
    {
      title: "Total Sales",
      value: `$${parseFloat(metrics?.totalSales || "0").toLocaleString()}`,
      change: metrics?.salesChange || "",
      changeType: getChangeType(metrics?.salesChange),
      icon: DollarSign,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Total Profit",
      value: `$${parseFloat(metrics?.totalProfit || "0").toLocaleString()}`,
      change: metrics?.profitChange || "",
      changeType: getChangeType(metrics?.profitChange),
      icon: TrendingUp,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Items Sold",
      value: metrics?.itemsSold?.toLocaleString() || "0",
      change: metrics?.itemsSoldChange || "",
      changeType: getChangeType(metrics?.itemsSoldChange),
      icon: Package,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Monthly Goal",
      value: `${metrics?.monthlyGoalProgress || 0}%`,
      change: `$${parseFloat(metrics?.totalProfit || "0").toLocaleString()} progress`,
      changeType: "neutral",
      icon: Target,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      progress: metrics?.monthlyGoalProgress || 0,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{metric.title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{metric.value}</p>
                {metric.change && (
                  <p className={`text-sm mt-1 ${
                    metric.changeType === "positive" 
                      ? "text-emerald-600" 
                      : metric.changeType === "negative"
                      ? "text-red-600"
                      : "text-slate-600"
                  }`}>
                    {metric.changeType === "positive" && (
                      <TrendingUp className="inline w-4 h-4 mr-1" />
                    )}
                    {metric.change}
                  </p>
                )}
              </div>
              <div className={`w-12 h-12 ${metric.iconBg} rounded-lg flex items-center justify-center`}>
                <metric.icon className={`${metric.iconColor} text-lg`} size={20} />
              </div>
            </div>
            {metric.progress !== undefined && (
              <div className="mt-4">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(metric.progress, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
