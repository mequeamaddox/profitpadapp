import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertInventoryItemSchema, type InventoryItem, type InsertInventoryItem, type User, type Pallet } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarIcon, Scan, Wrench } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import BarcodeScanner from "@/components/barcode-scanner";

interface InventoryFormProps {
  item?: InventoryItem | null;
  onSuccess?: () => void;
}

const platforms = [
  "eBay", "Amazon", "Mercari", "Poshmark", "Depop", "Facebook Marketplace", 
  "StockX", "GOAT", "Chrono24", "Reverb", "Etsy", "Shopify", "Direct Sale", "Other"
];

const categories = [
  "Electronics", "Clothing & Accessories", "Collectibles", "Sports & Outdoors",
  "Home & Garden", "Automotive", "Books & Media", "Toys & Games", "Health & Beauty",
  "Art & Crafts", "Musical Instruments", "Jewelry & Watches", "Other"
];

// Category code mapping for SKUs
const categoryCodeMap: Record<string, string> = {
  "Electronics": "ELE",
  "Clothing & Accessories": "CLO",
  "Collectibles": "COL",
  "Sports & Outdoors": "SPO",
  "Home & Garden": "HOM",
  "Automotive": "AUT",
  "Books & Media": "BOK",
  "Toys & Games": "TOY",
  "Health & Beauty": "HEA",
  "Art & Crafts": "ART",
  "Musical Instruments": "MUS",
  "Jewelry & Watches": "JEW",
  "Other": "OTH"
};

const conditions = [
  "New", "Like New", "Good", "Fair", "Poor"
];

const statuses = [
  "unlisted", "listed", "sold", "returned"
];

// SKU Builder Options
const toolTypes = [
  { code: "TRIM", label: "Trimmer Attachment (Expand-It)" },
  { code: "COMBO", label: "Trimmer + Blower Combo Kit" },
  { code: "BLOW", label: "Jet Fan Blower (Attachment)" },
  { code: "SAW", label: "Chainsaw" },
  { code: "POLE", label: "Pole Saw" },
];

const brands = [
  { code: "RYO", label: "Ryobi" },
];

const powerOptions = [
  { code: "18V", label: "18 Volt Battery Powered" },
  { code: "40V", label: "40 Volt Battery Powered" },
  { code: "18V-BLS", label: "18 Volt Brushless Motor" },
  { code: "ATT", label: "Universal Attachment" },
];

const skuConditions = [
  { code: "NEW", label: "New Condition" },
  { code: "USED", label: "Used Condition" },
  { code: "DMG", label: "Damaged" },
  { code: "UNT", label: "Untested" },
];

// Serial prefixes based on tool type
const serialPrefixes: Record<string, string> = {
  "TRIM": "T",
  "COMBO": "C",
  "BLOW": "B",
  "SAW": "S",
  "POLE": "P",
};

export default function InventoryForm({ item, onSuccess }: InventoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showSkuBuilder, setShowSkuBuilder] = useState(false);
  const [skuToolType, setSkuToolType] = useState("");
  const [skuBrand, setSkuBrand] = useState("RYO");
  const [skuPower, setSkuPower] = useState("");
  const [skuCondition, setSkuCondition] = useState("");

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data: pallets = [] } = useQuery<Pallet[]>({
    queryKey: ["/api/pallets"],
  });

  const form = useForm<InsertInventoryItem>({
    resolver: zodResolver(insertInventoryItemSchema),
    defaultValues: {
      title: item?.title || "",
      sku: item?.sku || "",
      upc: item?.upc || "",
      quantity: item?.quantity || 1,
      status: item?.status || "unlisted",
      platform: item?.platform || "",
      category: item?.category || "",
      purchasePrice: item?.purchasePrice || "",
      listedPrice: item?.listedPrice || "",
      soldPrice: item?.soldPrice || "",
      dateAcquired: item?.dateAcquired ? new Date(item.dateAcquired) : new Date(),
      dateListed: item?.dateListed ? new Date(item.dateListed) : undefined,
      dateSold: item?.dateSold ? new Date(item.dateSold) : undefined,
      condition: item?.condition || "",
      notes: item?.notes || "",
      tags: item?.tags || [],
      images: item?.images || [],
      barcode: item?.barcode || "",
      palletId: item?.palletId || "",
      archived: item?.archived || false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertInventoryItem) => {
      return await apiRequest("POST", "/api/inventory", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Inventory item created successfully",
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
        description: "Failed to create inventory item",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertInventoryItem>) => {
      return await apiRequest("PUT", `/api/inventory/${item!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
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
        description: "Failed to update inventory item",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertInventoryItem) => {
    const formattedData = {
      ...data,
      // Convert empty strings to null for optional fields
      upc: data.upc?.trim() || null,
      barcode: data.barcode?.trim() || null,
      notes: data.notes?.trim() || null,
      palletId: (data.palletId === "none" || !data.palletId) ? null : data.palletId,
      sku: data.sku?.trim() || `SKU-${Date.now()}`,
      dateListed: data.dateListed || null,
      dateSold: data.dateSold || null,
      soldPrice: data.soldPrice || null,
      // Handle tags properly
      tags: typeof data.tags === "string" ? 
        (data.tags && (data.tags as string).trim() ? (data.tags as string).split(",").map((tag: string) => tag.trim()).filter(Boolean) : null) : 
        (Array.isArray(data.tags) ? data.tags : null),
    };

    if (item) {
      updateMutation.mutate(formattedData);
    } else {
      createMutation.mutate(formattedData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleBarcodeScanned = (barcode: string, productInfo?: any) => {
    form.setValue("barcode", barcode);
    
    if (productInfo) {
      // Auto-fill form with product database information
      if (productInfo.title) {
        form.setValue("title", productInfo.title);
      }
      if (productInfo.brand && productInfo.title && !productInfo.title.includes(productInfo.brand)) {
        form.setValue("title", `${productInfo.brand} ${productInfo.title}`);
      }
      if (productInfo.category) {
        form.setValue("category", productInfo.category);
      }
      if (productInfo.description) {
        form.setValue("notes", productInfo.description);
      }
      
      toast({
        title: "Product Found!",
        description: `Auto-filled with: ${productInfo.title} (${productInfo.source})`,
      });
    } else {
      toast({
        title: "Barcode Scanned",
        description: `Barcode ${barcode} added. Product details not found - you can add them manually.`,
      });
    }
    setShowBarcodeScanner(false);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter item title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU (Auto-Generated)</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input placeholder="Click Build SKU to generate" {...field} data-testid="input-sku" readOnly />
                  </FormControl>
                  <Dialog open={showSkuBuilder} onOpenChange={setShowSkuBuilder}>
                    <DialogTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline"
                        data-testid="button-build-sku"
                      >
                        <Wrench className="w-4 h-4 mr-2" />
                        Build SKU
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>SKU Builder</DialogTitle>
                        <DialogDescription>
                          Build a detailed SKU for your power tool item
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label>Tool Type</Label>
                          <Select value={skuToolType} onValueChange={setSkuToolType}>
                            <SelectTrigger data-testid="select-tool-type">
                              <SelectValue placeholder="Select tool type" />
                            </SelectTrigger>
                            <SelectContent>
                              {toolTypes.map((type) => (
                                <SelectItem key={type.code} value={type.code}>
                                  {type.code} - {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Brand</Label>
                          <Select value={skuBrand} onValueChange={setSkuBrand}>
                            <SelectTrigger data-testid="select-brand">
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                            <SelectContent>
                              {brands.map((brand) => (
                                <SelectItem key={brand.code} value={brand.code}>
                                  {brand.code} - {brand.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Power / Motor / Style</Label>
                          <Select value={skuPower} onValueChange={setSkuPower}>
                            <SelectTrigger data-testid="select-power">
                              <SelectValue placeholder="Select power type" />
                            </SelectTrigger>
                            <SelectContent>
                              {powerOptions.map((power) => (
                                <SelectItem key={power.code} value={power.code}>
                                  {power.code} - {power.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Condition</Label>
                          <Select value={skuCondition} onValueChange={setSkuCondition}>
                            <SelectTrigger data-testid="select-condition">
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                              {skuConditions.map((cond) => (
                                <SelectItem key={cond.code} value={cond.code}>
                                  {cond.code} - {cond.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-2">Preview:</p>
                          <p className="text-lg font-mono">
                            {skuToolType && skuBrand && skuPower && skuCondition
                              ? `${skuToolType}-${skuBrand}-${skuPower}-${skuCondition}-${serialPrefixes[skuToolType] || 'X'}###`
                              : 'Select all options to see preview'}
                          </p>
                        </div>

                        <Button
                          type="button"
                          className="w-full"
                          onClick={async () => {
                            if (!skuToolType || !skuBrand || !skuPower || !skuCondition) {
                              toast({
                                title: "Incomplete Selection",
                                description: "Please select all SKU components",
                                variant: "destructive",
                              });
                              return;
                            }

                            try {
                              const response = await fetch(
                                `/api/inventory/generate-sku?toolType=${skuToolType}&brand=${skuBrand}&power=${skuPower}&condition=${skuCondition}`
                              );
                              const data = await response.json();

                              if (!response.ok) {
                                throw new Error(data.message || "Failed to generate SKU");
                              }

                              form.setValue("sku", data.sku);
                              toast({
                                title: "SKU Generated",
                                description: `${data.sku}`,
                              });
                              setShowSkuBuilder(false);
                            } catch (error: any) {
                              toast({
                                title: "Error",
                                description: error.message || "Failed to generate SKU",
                                variant: "destructive",
                              });
                            }
                          }}
                          data-testid="button-generate-sku"
                        >
                          Generate SKU
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-xs text-muted-foreground">Format: TOOLTYPE-BRAND-POWER-CONDITION-SERIAL (e.g. TRIM-RYO-40V-USED-T001)</p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="upc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>UPC (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="UPC barcode" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input placeholder="Scan or enter barcode" {...field} value={field.value || ""} />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowBarcodeScanner(true)}
                  >
                    <Scan className="w-4 h-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    placeholder="1" 
                    value={field.value || ""} 
                    onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={(value) => {
                  field.onChange(value);
                  // Auto-set date fields based on status
                  if (value === "listed" && !form.getValues("dateListed")) {
                    form.setValue("dateListed", new Date());
                  } else if (value === "sold" && !form.getValues("dateSold")) {
                    form.setValue("dateSold", new Date());
                  }
                }} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="palletId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source Pallet (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "none"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Leave blank for individual purchases" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Individual purchase (not from pallet)</SelectItem>
                    {pallets.map((pallet) => (
                      <SelectItem key={pallet.id} value={pallet.id}>
                        {pallet.name} - ${pallet.totalCost}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">
                  Only select a pallet if this item came from a liquidation pallet purchase. Most individual items, parts, and standalone purchases should be left blank.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="listedPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Listed Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("status") === "sold" && (
            <FormField
              control={form.control}
              name="soldPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sold Price ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="dateAcquired"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date Acquired</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("status") === "listed" && (
            <FormField
              control={form.control}
              name="dateListed"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date Listed</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {form.watch("status") === "sold" && (
            <FormField
              control={form.control}
              name="dateSold"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date Sold</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Textarea
                  placeholder="Enter any additional notes about this item"
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter tags separated by commas"
                  value={Array.isArray(field.value) ? field.value.join(", ") : (field.value || "")}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : item ? "Update Item" : "Create Item"}
          </Button>
        </div>
      </form>
    </Form>

    <BarcodeScanner
      isOpen={showBarcodeScanner}
      onClose={() => setShowBarcodeScanner(false)}
      onScanSuccess={handleBarcodeScanned}
    />


  </div>
  );
}
