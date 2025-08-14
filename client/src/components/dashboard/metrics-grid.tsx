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
      gradient: "from-emerald-500 to-emerald-600",
      bgPattern: "bg-emerald-50 dark:bg-emerald-950/20",
    },
    {
      title: "Total Profit",
      value: `$${parseFloat(metrics?.totalProfit || "0").toLocaleString()}`,
      change: metrics?.profitChange || "",
      changeType: getChangeType(metrics?.profitChange),
      icon: TrendingUp,
      gradient: "from-blue-500 to-blue-600",
      bgPattern: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "Items Sold",
      value: metrics?.itemsSold?.toLocaleString() || "0",
      change: metrics?.itemsSoldChange || "",
      changeType: getChangeType(metrics?.itemsSoldChange),
      icon: Package,
      gradient: "from-purple-500 to-purple-600",
      bgPattern: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      title: "Monthly Goal",
      value: `${(metrics?.monthlyGoalProgress || 0).toFixed(1)}%`,
      change: `Goal: $${parseFloat(metrics?.monthlyGoal || "0").toLocaleString()}`,
      changeType: "neutral",
      icon: Target,
      gradient: "from-amber-500 to-amber-600",
      bgPattern: "bg-amber-50 dark:bg-amber-950/20",
      progress: metrics?.monthlyGoalProgress || 0,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="card-premium relative overflow-hidden animate-fadeInUp" style={{ animationDelay: `${i * 100}ms` }}>
            <CardContent className="p-6">
              {/* Animated shimmer overlay */}
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent"></div>
              
              {/* Icon placeholder with pulse */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 gradient-primary rounded-xl animate-pulse shadow-lg"></div>
                <div className="w-4 h-4 bg-muted rounded animate-pulse"></div>
              </div>
              
              {/* Title placeholder */}
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-8 bg-gradient-to-r from-muted to-muted/60 rounded animate-pulse"></div>
                <div className="h-3 bg-muted/60 rounded w-2/3 animate-pulse"></div>
              </div>
              
              {/* Progress bar for monthly goal card */}
              {i === 3 && (
                <div className="mt-4">
                  <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full animate-pulse shadow-sm"></div>
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
          className="card-premium group relative overflow-hidden animate-fadeInUp"
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <CardContent className="p-6">
            <div className={`absolute top-0 right-0 w-24 h-24 ${metric.bgPattern} opacity-50 rounded-full -mr-12 -mt-12`}></div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">{metric.title}</p>
                <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                {metric.change && (
                  <p className={`text-sm mt-2 flex items-center ${
                    metric.changeType === "positive" 
                      ? "text-emerald-600" 
                      : metric.changeType === "negative"
                      ? "text-red-600"
                      : "text-muted-foreground"
                  }`}>
                    {metric.changeType === "positive" && (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    )}
                    {metric.change}
                  </p>
                )}
              </div>
              <div className={`w-14 h-14 bg-gradient-to-br ${metric.gradient} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-float`}>
                <metric.icon className="text-white" size={24} />
              </div>
            </div>
            
            {metric.progress !== undefined && (
              <div className="mt-4">
                <div className="w-full bg-muted/20 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`bg-gradient-to-r ${metric.gradient} h-3 rounded-full transition-all duration-1000 ease-out relative shadow-sm`}
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
