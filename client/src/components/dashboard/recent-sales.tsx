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

  const handleSaleClick = (sale: any) => {
    // Navigate to sales page with the specific sale ID for editing
    setLocation(`/sales?edit=${sale.id}`);
  };

  return (
    <Card className="card-retail animate-fadeInUp" style={{ animationDelay: '400ms' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span className="text-foreground">Recent Sales</span>
            {!isLoading && recentSales.length > 0 && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
            )}
          </CardTitle>
          <Button variant="link" onClick={() => setLocation("/sales")} className="text-primary hover:text-primary/80 transition-colors font-medium">
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-4 rounded-xl border border-border/30 relative overflow-hidden bg-card/50">
                {/* Animated shimmer overlay */}
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent"></div>
                
                <div className="w-12 h-12 gradient-primary rounded-xl animate-pulse shadow-lg relative z-10"></div>
                <div className="flex-1 relative z-10">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                  <div className="h-3 bg-muted/60 rounded w-1/2 animate-pulse" style={{ animationDelay: `${i * 150}ms` }}></div>
                </div>
                <div className="text-right relative z-10">
                  <div className="h-4 bg-emerald-200 dark:bg-emerald-800 rounded w-16 mb-2 animate-pulse" style={{ animationDelay: `${i * 200}ms` }}></div>
                  <div className="h-3 bg-muted/60 rounded w-12 animate-pulse" style={{ animationDelay: `${i * 250}ms` }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentSales.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent sales. Record your first sale to see it here.
          </div>
        ) : (
          <div className="space-y-4">
            {recentSales.map((sale: any, index: number) => (
              <div 
                key={sale.id} 
                className="flex items-center space-x-3 p-4 rounded-xl hover:bg-accent/50 cursor-pointer transition-all duration-300 hover-lift hover:shadow-lg border border-border/30 hover:border-primary/30 animate-fadeInUp bg-card/30 backdrop-blur-sm"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleSaleClick(sale)}
              >
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
