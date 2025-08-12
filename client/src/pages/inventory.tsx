import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import InventoryForm from "@/components/forms/inventory-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Plus, Edit, Archive, Trash2, Boxes, Package, DollarSign, TrendingUp, Calculator, Calendar, User } from "lucide-react";
import type { InventoryItem, Pallet } from "@shared/schema";

// Pallet form schema
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
      return await apiRequest(method, endpoint, data);
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
                  <Input placeholder="Enter pallet name" {...field} />
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
                  <Input placeholder="Enter supplier name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                  <Input placeholder="0.00" {...field} />
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
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="workingItems"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Working Items (optional)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
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
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter pallet description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : pallet ? "Update Pallet" : "Create Pallet"}
        </Button>
      </form>
    </Form>
  );
}

export default function Inventory() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isPalletFormOpen, setIsPalletFormOpen] = useState(false);
  const [editingPallet, setEditingPallet] = useState<Pallet | null>(null);

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

  const { data: inventory = [], isLoading: inventoryLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory", { archived: showArchived, search: searchQuery }],
    enabled: isAuthenticated,
  });

  const { data: pallets = [], isLoading: palletsLoading } = useQuery<Pallet[]>({
    queryKey: ["/api/pallets"],
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Success",
        description: "Item deleted successfully",
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
        description: "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      await apiRequest("PUT", `/api/inventory/${id}`, { archived });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Success",
        description: "Item updated successfully",
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
        description: "Failed to update item",
        variant: "destructive",
      });
    },
  });

  const deletePalletMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/pallets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pallets"] });
      toast({
        title: "Success",
        description: "Pallet deleted successfully",
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
        description: "Failed to delete pallet",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handlePalletEdit = (pallet: Pallet) => {
    setEditingPallet(pallet);
    setIsPalletFormOpen(true);
  };

  const handlePalletFormClose = () => {
    setIsPalletFormOpen(false);
    setEditingPallet(null);
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
        <Header title="Inventory" subtitle="Manage your products and track their performance." />
        
        <div className="flex-1 overflow-y-auto p-6" style={{ paddingBottom: '150px' }}>
          <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inventory">
                <Package className="h-4 w-4 mr-2" />
                Inventory Items
              </TabsTrigger>
              <TabsTrigger value="pallets">
                <Boxes className="h-4 w-4 mr-2" />
                Liquidation Pallets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="space-y-6">
              {/* Inventory Actions Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search inventory..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                  <Button
                    variant={showArchived ? "default" : "outline"}
                    onClick={() => setShowArchived(!showArchived)}
                  >
                    {showArchived ? "Show Archived" : "Show Active"}
                  </Button>
                </div>
                
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingItem(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingItem ? "Edit Item" : "Add New Item"}
                  </DialogTitle>
                </DialogHeader>
                <InventoryForm
                  item={editingItem}
                  onSuccess={handleFormClose}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>
                {inventory.length} items found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inventoryLoading ? (
                <div className="text-center py-8">Loading inventory...</div>
              ) : inventory.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {searchQuery ? "No items match your search." : "No inventory items found. Add your first item to get started."}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Purchase Price</TableHead>
                      <TableHead>Listed Price</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item: InventoryItem) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-slate-500">
                              Added {new Date(item.dateAcquired).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                        <TableCell>{item.platform || "-"}</TableCell>
                        <TableCell>${item.purchasePrice}</TableCell>
                        <TableCell>${item.listedPrice}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.condition || "Not specified"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.archived ? "secondary" : "default"}>
                            {item.archived ? "Archived" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => 
                                archiveMutation.mutate({ 
                                  id: item.id, 
                                  archived: !item.archived 
                                })
                              }
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMutation.mutate(item.id)}
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
        </TabsContent>

        <TabsContent value="pallets" className="space-y-6">
          {/* Pallets Actions Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Liquidation Pallets</h3>
              <p className="text-sm text-slate-500">Track bulk purchases and cost allocation for resale items</p>
            </div>
            
            <Dialog open={isPalletFormOpen} onOpenChange={setIsPalletFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingPallet(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pallet
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPallet ? "Edit Pallet" : "Add New Pallet"}
                  </DialogTitle>
                </DialogHeader>
                <PalletForm
                  pallet={editingPallet}
                  onSuccess={handlePalletFormClose}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Pallets Grid */}
          {palletsLoading ? (
            <div className="text-center py-8">Loading pallets...</div>
          ) : pallets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No pallets found</h3>
                <p className="text-slate-500 mb-4">Get started by adding your first liquidation pallet purchase.</p>
                <Dialog open={isPalletFormOpen} onOpenChange={setIsPalletFormOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingPallet(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Pallet
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Pallet</DialogTitle>
                    </DialogHeader>
                    <PalletForm
                      pallet={editingPallet}
                      onSuccess={handlePalletFormClose}
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pallets.map((pallet: Pallet) => {
                const costPerItem = pallet.totalItems > 0 ? parseFloat(pallet.totalCost) / pallet.totalItems : 0;
                const workingItems = pallet.workingItems || pallet.totalItems;
                const workingRate = pallet.totalItems > 0 ? (workingItems / pallet.totalItems * 100) : 100;
                
                return (
                  <Card key={pallet.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{pallet.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {pallet.supplier && `Supplier: ${pallet.supplier}`}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePalletEdit(pallet)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePalletMutation.mutate(pallet.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-sm text-slate-500">Total Cost</p>
                              <p className="text-lg font-semibold">${pallet.totalCost}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-sm text-slate-500">Total Items</p>
                              <p className="text-lg font-semibold">{pallet.totalItems}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">Cost per Item</span>
                            <span className="font-medium">${costPerItem.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">Working Items</span>
                            <span className="font-medium">{workingItems} ({workingRate.toFixed(1)}%)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">Purchase Date</span>
                            <span className="font-medium">
                              {new Date(pallet.purchaseDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        {pallet.description && (
                          <div>
                            <p className="text-sm text-slate-500 mb-1">Description</p>
                            <p className="text-sm">{pallet.description}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
      </main>
    </div>
  );
}
