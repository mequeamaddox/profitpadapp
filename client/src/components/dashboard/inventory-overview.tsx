import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { DashboardMetrics, InventoryItem } from "@shared/schema";

export default function InventoryOverview() {
  const [, setLocation] = useLocation();
  
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: recentInventory = [], isLoading: inventoryLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory", { limit: 3 }],
  });

  const inventoryStats = metrics?.inventoryStats || {};

  const handleInventoryClick = (item: any) => {
    // Navigate to inventory page with the specific item ID for editing
    setLocation(`/inventory?edit=${item.id}`);
  };

  const getConditionColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case "new":
        return "bg-emerald-100 text-emerald-800";
      case "like new":
        return "bg-blue-100 text-blue-800";
      case "good":
        return "bg-amber-100 text-amber-800";
      case "fair":
        return "bg-orange-100 text-orange-800";
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Inventory Overview</CardTitle>
          <Button variant="link" onClick={() => setLocation("/inventory")}>
            Manage Inventory
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Inventory Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">
              {isLoading ? "..." : (inventoryStats as any)?.totalItems || 0}
            </p>
            <p className="text-sm text-slate-600">Total Items</p>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600">
              {isLoading ? "..." : (inventoryStats as any)?.activeListings || 0}
            </p>
            <p className="text-sm text-slate-600">Active Listings</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">
              {isLoading ? "..." : (inventoryStats as any)?.lowStock || 0}
            </p>
            <p className="text-sm text-slate-600">Low Stock</p>
          </div>
        </div>

        {/* Recent Inventory Items */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900">Recently Added</h4>
          
          {inventoryLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-200 rounded"></div>
                    <div>
                      <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-slate-200 rounded w-16 mb-2"></div>
                    <div className="h-6 bg-slate-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentInventory.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No inventory items yet. Add your first item to get started.
            </div>
          ) : (
            recentInventory.slice(0, 3).map((item: any) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => handleInventoryClick(item)}
              >
                <div className="flex items-center space-x-3">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                      <span className="text-slate-400 text-xs">No image</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">${item.listedPrice}</p>
                  <Badge className={getConditionColor(item.condition)}>
                    {item.condition || "Unknown"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
