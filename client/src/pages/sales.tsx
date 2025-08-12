import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import SalesForm from "@/components/forms/sales-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Download } from "lucide-react";
import type { SalesRecord } from "@shared/schema";

export default function Sales() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<SalesRecord | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: sales = [], isLoading: salesLoading } = useQuery<SalesRecord[]>({
    queryKey: ["/api/sales"],
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/sales/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Sale deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete sale",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (sale: SalesRecord) => {
    setEditingSale(sale);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSale(null);
  };

  const calculateProfit = (sale: SalesRecord) => {
    const salePrice = parseFloat(sale.salePrice || "0");
    const platformFee = parseFloat(sale.platformFee || "0");
    const shippingCost = parseFloat(sale.shippingCost || "0");
    
    // Note: We'd need to join with inventory to get purchase price for accurate profit
    const netRevenue = salePrice - platformFee - shippingCost;
    return netRevenue;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Sales" subtitle="Track and manage your sales transactions." />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6" style={{ paddingBottom: '150px' }}>
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Export CSV</span>
              </Button>
            </div>
            
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingSale(null)} className="shrink-0">
                  <Plus className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Record Sale</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 md:mx-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingSale ? "Edit Sale" : "Record New Sale"}
                  </DialogTitle>
                </DialogHeader>
                <SalesForm
                  sale={editingSale}
                  onSuccess={handleFormClose}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Sales Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${sales.reduce((sum: number, sale: SalesRecord) => sum + parseFloat(sale.salePrice || "0"), 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">Net Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${sales.reduce((sum: number, sale: SalesRecord) => sum + calculateProfit(sale), 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">Items Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sales.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Table */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Records</CardTitle>
              <CardDescription>
                {sales.length} sales found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <div className="text-center py-8">Loading sales...</div>
              ) : sales.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No sales records found. Record your first sale to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date Sold</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Sale Price</TableHead>
                      <TableHead>Fees</TableHead>
                      <TableHead>Shipping</TableHead>
                      <TableHead>Net Revenue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale: SalesRecord) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {new Date(sale.dateSold).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {sale.inventoryItemId ? "Linked Item" : "Manual Entry"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{sale.platform || "-"}</Badge>
                        </TableCell>
                        <TableCell>${sale.salePrice}</TableCell>
                        <TableCell>${sale.platformFee || "0.00"}</TableCell>
                        <TableCell>${sale.shippingCost || "0.00"}</TableCell>
                        <TableCell className="font-semibold">
                          ${calculateProfit(sale).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(sale)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMutation.mutate(sale.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
