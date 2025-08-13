import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertSalesRecordSchema, type SalesRecord, type InsertSalesRecord } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import React, { useState } from "react";
import { User } from "@shared/schema";

interface SalesFormProps {
  sale?: SalesRecord | null;
  onSuccess?: () => void;
}

const platforms = [
  "eBay", "Amazon", "Mercari", "Poshmark", "Depop", "Facebook Marketplace", 
  "StockX", "GOAT", "Chrono24", "Reverb", "Etsy", "Shopify", "Direct Sale", "Other"
];

export default function SalesForm({ sale, onSuccess }: SalesFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();


  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const form = useForm<InsertSalesRecord>({
    resolver: zodResolver(insertSalesRecordSchema),
    defaultValues: {
      inventoryItemId: sale?.inventoryItemId ?? "",
      itemTitle: sale?.itemTitle ?? "",
      purchasePrice: sale?.purchasePrice ?? "0.00",
      salePrice: sale?.salePrice ?? "",
      platformFee: sale?.platformFee ?? "0.00",
      shippingCost: sale?.shippingCost ?? "0.00", 
      otherFees: sale?.otherFees ?? "0.00",
      profit: sale?.profit ?? "0.00",
      salesTaxRate: sale?.salesTaxRate ?? user?.salesTaxRate ?? "0.0000",
      salesTaxAmount: sale?.salesTaxAmount ?? "0.00",
      taxIncluded: sale?.taxIncluded ?? user?.taxInclusiveSales ?? true,
      saleDate: sale?.saleDate ? new Date(sale.saleDate) : new Date(),
      platform: sale?.platform ?? "",
      buyerInfo: sale?.buyerInfo ?? "",
      notes: sale?.notes ?? "",
      tags: sale?.tags ?? [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertSalesRecord) => {
      return await apiRequest("POST", "/api/sales", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Sale recorded successfully",
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
        description: "Failed to record sale",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertSalesRecord>) => {
      return await apiRequest("PUT", `/api/sales/${sale!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Sale updated successfully",
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
        description: "Failed to update sale",
        variant: "destructive",
      });
    },
  });

  // Calculate profit and tax automatically
  const salePrice = parseFloat(form.watch("salePrice") || "0");
  const purchasePrice = parseFloat(form.watch("purchasePrice") || "0");
  const platformFee = parseFloat(form.watch("platformFee") || "0");
  const shippingCost = parseFloat(form.watch("shippingCost") || "0");
  const otherFees = parseFloat(form.watch("otherFees") || "0");
  const salesTaxRate = parseFloat(form.watch("salesTaxRate") || "0");
  const taxIncluded = form.watch("taxIncluded") ?? true;
  
  // Auto-update tax amount when rate or sale price changes
  React.useEffect(() => {
    if (salesTaxRate > 0) {
      let taxAmount = 0;
      if (taxIncluded) {
        // Tax-inclusive: extract tax from sale price
        taxAmount = salePrice - (salePrice / (1 + salesTaxRate));
      } else {
        // Tax-exclusive: add tax on top of sale price
        taxAmount = salePrice * salesTaxRate;
      }
      form.setValue("salesTaxAmount", taxAmount.toFixed(2));
    } else {
      form.setValue("salesTaxAmount", "0.00");
    }
  }, [salePrice, salesTaxRate, taxIncluded, form]);
  
  // Auto-update profit when costs change
  React.useEffect(() => {
    const profit = salePrice - purchasePrice - platformFee - shippingCost - otherFees;
    form.setValue("profit", profit.toFixed(2));
  }, [salePrice, purchasePrice, platformFee, shippingCost, otherFees, form]);

  const onSubmit = (data: InsertSalesRecord) => {
    const formattedData = {
      ...data,
      inventoryItemId: data.inventoryItemId || null,
      saleDate: data.saleDate instanceof Date ? data.saleDate : new Date(data.saleDate),
      tags: Array.isArray(data.tags) ? data.tags : (typeof data.tags === "string" && data.tags ? (data.tags as string).split(",").map((tag: string) => tag.trim()).filter(Boolean) : null),
    };

    if (sale) {
      updateMutation.mutate(formattedData);
    } else {
      createMutation.mutate(formattedData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="inventoryItemId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Linked Inventory Item (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value ?? "none"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select inventory item or leave blank" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No linked item (Manual entry)</SelectItem>
                    {(inventory as any[]).map((item: any) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title} - {item.sku}
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
                <Select onValueChange={field.onChange} defaultValue={field.value ?? ""}>
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
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Price ($)</FormLabel>
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
            name="platformFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform Fee ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shippingCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shipping Cost ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="itemTitle"
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
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="otherFees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Fees ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="profit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profit (Auto-calculated)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Sales Tax Section */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-4">Sales Tax Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="salesTaxRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Rate</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.0001"
                      min="0"
                      max="1"
                      placeholder="0.0825"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500">
                    As decimal (e.g., 0.0825 for 8.25%)
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salesTaxAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Amount (Auto-calculated)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      readOnly
                      className="bg-gray-50"
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taxIncluded"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm">Tax Included</FormLabel>
                    <p className="text-xs text-gray-500">
                      {field.value ? "In sale price" : "Added on top"}
                    </p>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value || false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="saleDate"
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
        </div>

        <FormField
          control={form.control}
          name="buyerInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Buyer Information (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter buyer information"
                  {...field}
                  value={field.value ?? ""}
                />
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
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any additional notes about this sale"
                  className="resize-none"
                  {...field}
                  value={field.value ?? ""}
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
                  value={Array.isArray(field.value) ? field.value.join(", ") : (field.value ?? "")}
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
            {isLoading ? "Saving..." : sale ? "Update Sale" : "Record Sale"}
          </Button>
        </div>
      </form>
    </Form>


    </div>
  );
}
