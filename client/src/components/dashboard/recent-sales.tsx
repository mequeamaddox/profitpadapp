import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { DashboardMetrics } from "@shared/schema";

export default function RecentSales() {
  const [, setLocation] = useLocation();
  
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const recentSales = metrics?.recentSales || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Sales</CardTitle>
          <Button variant="link" onClick={() => setLocation("/sales")}>
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-slate-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentSales.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No recent sales. Record your first sale to see it here.
          </div>
        ) : (
          <div className="space-y-4">
            {recentSales.map((sale: any) => (
              <div key={sale.id} className="flex items-center space-x-3">
                {sale.itemImages && sale.itemImages.length > 0 ? (
                  <img
                    src={sale.itemImages[0]}
                    alt={sale.itemTitle || "Product"}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                    <span className="text-slate-400 text-xs">No image</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {sale.itemTitle || "Manual Sale Entry"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {sale.itemSku || new Date(sale.dateSold).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    ${parseFloat(sale.salePrice).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">{sale.platform || "Direct"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
