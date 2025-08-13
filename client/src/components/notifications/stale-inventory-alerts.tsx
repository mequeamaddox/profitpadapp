import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Package, TrendingDown, AlertTriangle, DollarSign } from "lucide-react";
import type { InventoryItem } from "@shared/schema";

interface StaleInventoryItem extends InventoryItem {
  daysListed: number;
  staleness: "Warning" | "Stale" | "Critical";
  suggestedAction: string;
  potentialLoss: number;
}

export default function StaleInventoryAlerts() {
  const { data: staleItems, isLoading } = useQuery<StaleInventoryItem[]>({
    queryKey: ["/api/inventory/stale-analysis"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Stale Inventory Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!staleItems || staleItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Stale Inventory Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-900 mb-2">Great Inventory Health!</h3>
            <p className="text-green-700">
              No stale inventory detected. Your items are moving well.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStalenessColor = (staleness: string) => {
    switch (staleness) {
      case "Warning": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Stale": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Critical": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStalenessIcon = (staleness: string) => {
    switch (staleness) {
      case "Warning": return <Clock className="h-4 w-4" />;
      case "Stale": return <TrendingDown className="h-4 w-4" />;
      case "Critical": return <AlertTriangle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const totalPotentialLoss = staleItems.reduce((sum, item) => sum + item.potentialLoss, 0);
  const criticalItems = staleItems.filter(item => item.staleness === "Critical");
  const staleItemsCount = staleItems.filter(item => item.staleness === "Stale");
  const warningItems = staleItems.filter(item => item.staleness === "Warning");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Stale Inventory Alerts
        </CardTitle>
        <p className="text-sm text-slate-600">
          Items that haven't sold and may need attention
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-sm font-medium text-red-900">Critical Items</div>
            <div className="text-2xl font-bold text-red-900">{criticalItems.length}</div>
            <div className="text-xs text-red-700">90+ days listed</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-sm font-medium text-orange-900">Stale Items</div>
            <div className="text-2xl font-bold text-orange-900">{staleItemsCount.length}</div>
            <div className="text-xs text-orange-700">60-89 days listed</div>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="text-sm font-medium text-yellow-900">Warning Items</div>
            <div className="text-2xl font-bold text-yellow-900">{warningItems.length}</div>
            <div className="text-xs text-yellow-700">30-59 days listed</div>
          </div>
        </div>

        {/* Potential Loss Alert */}
        {totalPotentialLoss > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <DollarSign className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Potential Capital Loss:</strong> ${totalPotentialLoss.toFixed(2)} tied up in slow-moving inventory.
              Consider price adjustments or alternative selling strategies.
            </AlertDescription>
          </Alert>
        )}

        {/* Stale Items List */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900">Items Requiring Attention</h4>
          {staleItems.slice(0, 10).map((item) => (
            <div
              key={item.id}
              className={`p-4 border rounded-lg ${getStalenessColor(item.staleness)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStalenessIcon(item.staleness)}
                    <h5 className="font-medium">{item.title}</h5>
                    <Badge variant="outline" className="ml-auto">
                      {item.daysListed} days
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-slate-600">Listed Price:</span>
                      <div className="font-semibold">${item.listedPrice}</div>
                    </div>
                    <div>
                      <span className="text-slate-600">Purchase Price:</span>
                      <div className="font-semibold">${item.purchasePrice}</div>
                    </div>
                    <div>
                      <span className="text-slate-600">Platform:</span>
                      <div className="font-semibold">{item.platform || "Not specified"}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <strong>Suggested Action:</strong> {item.suggestedAction}
                    </div>
                    {item.potentialLoss > 0 && (
                      <div className="text-sm text-red-700">
                        Tied up: ${item.potentialLoss.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            Bulk Price Reduction
          </Button>
          <Button variant="outline" size="sm">
            Move to Auction
          </Button>
          <Button variant="outline" size="sm">
            Bundle Items
          </Button>
          <Button variant="outline" size="sm">
            Mark for Donation
          </Button>
        </div>

        {staleItems.length > 10 && (
          <div className="text-center pt-4">
            <Button variant="outline">
              View All {staleItems.length} Stale Items
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}