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
      value: `${(metrics?.monthlyGoalProgress || 0).toFixed(1)}%`,
      change: `Goal: $${parseFloat(metrics?.monthlyGoal || "0").toLocaleString()}`,
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
          <Card key={i} className="relative overflow-hidden bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              {/* Animated shimmer overlay */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
              
              {/* Icon placeholder with pulse */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg animate-pulse"></div>
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              
              {/* Title placeholder */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse"></div>
              </div>
              
              {/* Progress bar for monthly goal card */}
              {i === 3 && (
                <div className="mt-4">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-200 to-amber-300 rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((metric, index) => (
        <Card 
          key={index}
          className="group relative overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-gray-300 animate-fadeInUp"
          style={{ animationDelay: `${index * 150}ms` }}
        >
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
              <div className={`w-12 h-12 ${metric.iconBg} rounded-lg flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:shadow-lg`}>
                <metric.icon className={`${metric.iconColor} text-lg transition-all duration-300`} size={20} />
              </div>
            </div>
            {metric.progress !== undefined && (
              <div className="mt-4">
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${Math.min(metric.progress, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
