import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertExpenseSchema, type Expense, type InsertExpense, type User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Camera, Eye } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import ReceiptCapture from "@/components/receipt-capture";


interface ExpenseFormProps {
  expense?: Expense | null;
  onSuccess?: () => void;
}

const expenseCategories = [
  "Shipping & Postage",
  "Packaging Materials", 
  "Storage & Warehousing",
  "Marketing & Advertising",
  "Platform Fees & Commissions",
  "Equipment & Supplies",
  "Professional Services",
  "Travel & Transportation",
  "Software & Subscriptions",
  "Office Supplies",
  "Insurance",
  "Utilities",
  "Other"
];

const taxTypes = [
  { value: "none", label: "No Tax" },
  { value: "inclusive", label: "Tax Inclusive (tax is part of the amount)" },
  { value: "exclusive", label: "Tax Exclusive (tax added to amount)" }
];

export default function ExpenseForm({ expense, onSuccess }: ExpenseFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showReceiptCapture, setShowReceiptCapture] = useState(false);


  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const form = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      title: expense?.title || "",
      description: expense?.description || "",
      amount: expense?.amount || "0.00",
      category: expense?.category || "",
      taxType: expense?.taxType || "exclusive",
      taxRate: expense?.taxRate || "0.00",
      taxAmount: expense?.taxAmount || "0.00",
      subtotal: expense?.subtotal || "0.00",
      total: expense?.total || "0.00",
      expenseDate: expense?.expenseDate ? new Date(expense.expenseDate) : new Date(),
      vendor: expense?.vendor ?? "",
      receiptUrl: expense?.receiptUrl ?? "",
      businessPurpose: expense?.businessPurpose ?? "",
      deductible: expense?.deductible ?? false,
      tags: expense?.tags || [],
    },
  });

  // Calculate tax and totals automatically
  const amount = parseFloat(form.watch("amount") || "0");
  const taxType = form.watch("taxType");
  const taxRate = parseFloat(form.watch("taxRate") || "0");
  
  React.useEffect(() => {
    let subtotal = 0;
    let taxAmount = 0;
    let total = 0;

    if (taxType === "none") {
      subtotal = amount;
      taxAmount = 0;
      total = amount;
    } else if (taxType === "inclusive") {
      // Tax is already included in the amount
      total = amount;
      subtotal = amount / (1 + taxRate / 100);
      taxAmount = total - subtotal;
    } else if (taxType === "exclusive") {
      // Tax is added to the amount
      subtotal = amount;
      taxAmount = (subtotal * taxRate) / 100;
      total = subtotal + taxAmount;
    }

    form.setValue("subtotal", subtotal.toFixed(2));
    form.setValue("taxAmount", taxAmount.toFixed(2));
    form.setValue("total", total.toFixed(2));
  }, [amount, taxType, taxRate, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertExpense) => {
      return await apiRequest("POST", "/api/expenses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Expense recorded successfully",
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
      // Trial checking removed per user request
      toast({
        title: "Error",
        description: "Failed to record expense",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertExpense>) => {
      return await apiRequest("PUT", `/api/expenses/${expense!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Expense updated successfully",
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
        description: "Failed to update expense",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertExpense) => {
    const formattedData = {
      ...data,
      tags: Array.isArray(data.tags) ? data.tags : (typeof data.tags === "string" && data.tags ? data.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean) : []),
    };

    if (expense) {
      updateMutation.mutate(formattedData);
    } else {
      createMutation.mutate(formattedData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleReceiptCaptured = (imageUrl: string, receiptData?: any) => {
    form.setValue('receiptUrl', imageUrl);
    
    // Auto-fill form with OCR data if available
    if (receiptData) {
      if (receiptData.merchant) {
        form.setValue('vendor', receiptData.merchant);
      }
      if (receiptData.date) {
        form.setValue('expenseDate', new Date(receiptData.date));
      }
      if (receiptData.total) {
        form.setValue('amount', receiptData.total.toString());
      }
      if (receiptData.category) {
        form.setValue('category', receiptData.category);
      }
      if (receiptData.tax && receiptData.subtotal) {
        // Calculate tax type based on amounts
        const total = receiptData.total || 0;
        const tax = receiptData.tax;
        const subtotal = receiptData.subtotal;
        
        if (Math.abs(subtotal + tax - total) < 0.01) {
          // Tax exclusive
          form.setValue('taxType', 'exclusive');
          form.setValue('subtotal', subtotal.toString());
          form.setValue('taxAmount', tax.toString());
          form.setValue('total', total.toString());
        } else if (Math.abs(total - tax - subtotal) < 0.01) {
          // Tax inclusive  
          form.setValue('taxType', 'inclusive');
          form.setValue('subtotal', subtotal.toString());
          form.setValue('taxAmount', tax.toString());
        }
      }
      if (receiptData.items && receiptData.items.length > 0) {
        // Create a description from items
        const itemDescriptions = receiptData.items.map((item: any) => item.description).join(', ');
        form.setValue('description', itemDescriptions);
      }
      // Note: paymentMethod not in current schema, skipping for now
      
      // Generate business purpose suggestion
      if (receiptData.merchant && receiptData.category) {
        const businessPurpose = `${receiptData.category} expense from ${receiptData.merchant}`;
        form.setValue('businessPurpose', businessPurpose);
      }
    }
    
    setShowReceiptCapture(false);
  };



  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expense Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter expense description" {...field} />
                </FormControl>
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
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {expenseCategories.map((category) => (
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
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount ($)</FormLabel>
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

          <FormField
            control={form.control}
            name="vendor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor/Payee</FormLabel>
                <FormControl>
                  <Input placeholder="Who was paid?" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="taxType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {taxTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {taxType !== "none" && (
            <FormField
              control={form.control}
              name="taxRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Rate (%)</FormLabel>
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
          )}

          <FormField
            control={form.control}
            name="expenseDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expense Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
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
        </div>

        {/* Tax calculation display */}
        {taxType !== "none" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-700">Subtotal</label>
              <div className="text-lg font-semibold">${form.watch("subtotal")}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Tax Amount</label>
              <div className="text-lg font-semibold">${form.watch("taxAmount")}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Total</label>
              <div className="text-lg font-semibold text-blue-600">${form.watch("total")}</div>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="businessPurpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Purpose (for tax records)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe how this expense relates to your business..."
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional details..."
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
            name="deductible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Tax Deductible</FormLabel>
                  <div className="text-sm text-gray-500">
                    Mark if this expense can be deducted from taxes
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (comma-separated)</FormLabel>
              <FormControl>
                <Input
                  placeholder="tax-prep, monthly, office..."
                  {...field}
                  value={Array.isArray(field.value) ? field.value.join(", ") : field.value || ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Receipt Management Section */}
        <FormField
          control={form.control}
          name="receiptUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receipt</FormLabel>
              <div className="space-y-2">
                {field.value ? (
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => field.value && window.open(field.value, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Receipt
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => field.onChange("")}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReceiptCapture(true)}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Capture Receipt
                  </Button>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : expense ? "Update Expense" : "Record Expense"}
        </Button>
        </form>
      </Form>

      <ReceiptCapture
        isOpen={showReceiptCapture}
        onClose={() => setShowReceiptCapture(false)}
        onCaptureSuccess={handleReceiptCaptured}
      />
    </div>
  );
}