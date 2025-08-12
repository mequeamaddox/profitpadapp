import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Package, DollarSign, TrendingUp, Calculator, Trash2, Edit, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import type { Pallet } from "@shared/schema";

const palletFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  supplier: z.string().optional(),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  totalCost: z.string().min(1, "Total cost is required"),
  totalItems: z.coerce.number().min(1, "Must have at least 1 item"),
  workingItems: z.coerce.number().optional(),
  damagedItems: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type PalletFormData = z.infer<typeof palletFormSchema>;

function PalletForm({ pallet, onSuccess }: { pallet?: Pallet; onSuccess?: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PalletFormData>({
    resolver: zodResolver(palletFormSchema),
    defaultValues: {
      name: pallet?.name || "",
      description: pallet?.description || "",
      supplier: pallet?.supplier || "",
      purchaseDate: pallet?.purchaseDate ? new Date(pallet.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      totalCost: pallet?.totalCost || "",
      totalItems: pallet?.totalItems || 1,
      workingItems: pallet?.workingItems || undefined,
      damagedItems: pallet?.damagedItems || undefined,
      notes: pallet?.notes || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: PalletFormData) => {
      const endpoint = pallet ? `/api/pallets/${pallet.id}` : "/api/pallets";
      const method = pallet ? "PUT" : "POST";
      return await apiRequest(endpoint, { method, body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pallets"] });
      toast({
        title: pallet ? "Pallet Updated" : "Pallet Created",
        description: pallet ? "Your pallet has been updated successfully." : "Your pallet has been created successfully.",
      });
      onSuccess?.();
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
        description: pallet ? "Failed to update pallet." : "Failed to create pallet.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PalletFormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pallet Name</FormLabel>
                <FormControl>
                  <Input placeholder="Electronics Liquidation Pallet #1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <FormControl>
                  <Input placeholder="Amazon Returns, B-Stock, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Mixed electronics pallet containing phones, tablets, headphones..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Cost</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="1500.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalItems"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Items</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="workingItems"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Working Items (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="45" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="damagedItems"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Damaged Items (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes about the pallet..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : pallet ? "Update Pallet" : "Create Pallet"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function PalletCard({ pallet }: { pallet: Pallet }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/pallets/${pallet.id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pallets"] });
      toast({
        title: "Pallet Deleted",
        description: "The pallet has been deleted successfully.",
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
        description: "Failed to delete pallet.",
        variant: "destructive",
      });
    },
  });

  const costPerItem = parseFloat(pallet.totalCost) / pallet.totalItems;
  const workingRate = pallet.workingItems ? (pallet.workingItems / pallet.totalItems) * 100 : null;
  const damagedRate = pallet.damagedItems ? (pallet.damagedItems / pallet.totalItems) * 100 : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "depleted":
        return "bg-gray-100 text-gray-800";
      case "archived":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{pallet.name}</CardTitle>
            <CardDescription className="mt-1">
              {pallet.description || "No description provided"}
            </CardDescription>
            {pallet.supplier && (
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                {pallet.supplier}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(pallet.status)}>
              {pallet.status}
            </Badge>
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Pallet</DialogTitle>
                  <DialogDescription>
                    Update the details of your liquidation pallet.
                  </DialogDescription>
                </DialogHeader>
                <PalletForm pallet={pallet} onSuccess={() => setIsEditOpen(false)} />
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">${pallet.totalCost}</div>
            <div className="text-sm text-gray-600">Total Cost</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{pallet.totalItems}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">${costPerItem.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Cost/Item</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(pallet.purchaseDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {(pallet.workingItems !== null || pallet.damagedItems !== null) && (
          <>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4">
              {pallet.workingItems !== null && (
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {pallet.workingItems} ({workingRate?.toFixed(1)}%)
                  </div>
                  <div className="text-sm text-gray-600">Working Items</div>
                </div>
              )}
              {pallet.damagedItems !== null && (
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">
                    {pallet.damagedItems} ({damagedRate?.toFixed(1)}%)
                  </div>
                  <div className="text-sm text-gray-600">Damaged Items</div>
                </div>
              )}
            </div>
          </>
        )}

        {pallet.notes && (
          <>
            <Separator className="my-4" />
            <div className="text-sm text-gray-700">
              <strong>Notes:</strong> {pallet.notes}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function PalletsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  const { data: pallets = [], isLoading: isPalletsLoading } = useQuery({
    queryKey: ["/api/pallets"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const activePallets = pallets.filter((p: Pallet) => p.status === "active");
  const depletedPallets = pallets.filter((p: Pallet) => p.status === "depleted");
  const archivedPallets = pallets.filter((p: Pallet) => p.status === "archived");

  const totalCost = pallets.reduce((sum: number, p: Pallet) => sum + parseFloat(p.totalCost), 0);
  const totalItems = pallets.reduce((sum: number, p: Pallet) => sum + p.totalItems, 0);
  const avgCostPerItem = totalItems > 0 ? totalCost / totalItems : 0;

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Liquidation Pallets" subtitle="Track and manage your bulk purchase pallets for reselling." />
        <div className="flex-1 overflow-y-auto p-8" style={{ paddingBottom: '150px' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Liquidation Pallets</h1>
                <p className="text-gray-600 mt-2">
                  Track bulk purchases and allocate costs across individual items for accurate COGS tracking.
                </p>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pallet
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Pallet</DialogTitle>
                    <DialogDescription>
                      Track a new liquidation pallet purchase for COGS allocation.
                    </DialogDescription>
                  </DialogHeader>
                  <PalletForm onSuccess={() => setIsCreateOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold">{pallets.length}</p>
                      <p className="text-gray-600">Total Pallets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
                      <p className="text-gray-600">Total Investment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold">{totalItems}</p>
                      <p className="text-gray-600">Total Items</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calculator className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold">${avgCostPerItem.toFixed(2)}</p>
                      <p className="text-gray-600">Avg Cost/Item</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pallets List */}
            {isPalletsLoading ? (
              <div className="flex justify-center py-12">
                <div className="text-gray-500">Loading pallets...</div>
              </div>
            ) : pallets.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No pallets yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start tracking your liquidation pallets to manage COGS effectively.
                  </p>
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Pallet
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="active">Active ({activePallets.length})</TabsTrigger>
                  <TabsTrigger value="depleted">Depleted ({depletedPallets.length})</TabsTrigger>
                  <TabsTrigger value="archived">Archived ({archivedPallets.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="active" className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activePallets.map((pallet: Pallet) => (
                      <PalletCard key={pallet.id} pallet={pallet} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="depleted" className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {depletedPallets.map((pallet: Pallet) => (
                      <PalletCard key={pallet.id} pallet={pallet} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="archived" className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {archivedPallets.map((pallet: Pallet) => (
                      <PalletCard key={pallet.id} pallet={pallet} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}