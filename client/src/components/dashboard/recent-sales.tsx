import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { DashboardMetrics, type SalesRecord } from "@shared/schema";
import SalesForm from "@/components/forms/sales-form";

export default function RecentSales() {
  const [, setLocation] = useLocation();
  const [selectedSale, setSelectedSale] = useState<SalesRecord | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const recentSales = metrics?.recentSales || [];

  const handleSaleClick = (sale: any) => {
    // Convert the sale data to match SalesRecord interface
    const saleRecord: SalesRecord = {
      id: sale.id,
      userId: sale.userId,
      inventoryItemId: sale.inventoryItemId,
      itemTitle: sale.itemTitle,
      purchasePrice: sale.purchasePrice,
      salePrice: sale.salePrice,
      platformFee: sale.platformFee || "0.00",
      shippingCost: sale.shippingCost || "0.00",
      otherFees: sale.otherFees || "0.00",
      profit: sale.profit,
      saleDate: new Date(sale.saleDate),
      platform: sale.platform,
      buyerInfo: sale.buyerInfo,
      notes: sale.notes,
      tags: sale.tags || [],
      createdAt: new Date(sale.createdAt),
      updatedAt: new Date(sale.updatedAt),
    };
    setSelectedSale(saleRecord);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedSale(null);
  };

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
              <div 
                key={sale.id} 
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
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

      {/* Edit Sale Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Sale</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <SalesForm 
              salesRecord={selectedSale} 
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
