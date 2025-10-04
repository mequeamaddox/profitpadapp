import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { type User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, DollarSign, Calculator } from "lucide-react";
import { z } from "zod";

// Settings form schema
const settingsSchema = z.object({
  monthlyGoal: z.string().min(1, "Monthly goal is required"),
  salesTaxRate: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 1;
  }, "Tax rate must be between 0 and 1 (e.g., 0.0825 for 8.25%)"),
  taxInclusiveSales: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      monthlyGoal: user?.monthlyGoal || "10000.00",
      salesTaxRate: user?.salesTaxRate || "0.0000",
      taxInclusiveSales: user?.taxInclusiveSales ?? true,
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        monthlyGoal: user.monthlyGoal || "10000.00",
        salesTaxRate: user.salesTaxRate || "0.0000",
        taxInclusiveSales: user.taxInclusiveSales ?? true,
      });
    }
  }, [user, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      return await apiRequest("/api/user/settings", "PUT", {
        monthlyGoal: data.monthlyGoal,
        salesTaxRate: data.salesTaxRate,
        taxInclusiveSales: data.taxInclusiveSales,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Settings Updated",
        description: "Your tax and business settings have been saved.",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session Expired",
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
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    updateMutation.mutate(data);
  };

  const isSubmitting = updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const taxRatePercent = ((parseFloat(form.watch("salesTaxRate")) || 0) * 100).toFixed(2);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Business Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Business Goals
              </CardTitle>
              <CardDescription>
                Set your monthly revenue targets to track progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="monthlyGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Revenue Goal</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input 
                          placeholder="10000.00" 
                          className="pl-8"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your monthly revenue target for tracking business performance
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Sales Tax Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Sales Tax Configuration
              </CardTitle>
              <CardDescription>
                Configure sales tax settings for accurate tax reporting and estimations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="salesTaxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Tax Rate</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="0.0825" 
                          step="0.0001"
                          min="0"
                          max="1"
                          {...field} 
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ({taxRatePercent}%)
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter as decimal (e.g., 0.0825 for 8.25% tax rate). This will be used for tax calculations and estimations.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="taxInclusiveSales"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Tax-Inclusive Sales</FormLabel>
                      <FormDescription>
                        {field.value 
                          ? "Sales prices include tax (most direct sales)" 
                          : "Tax is added on top of sales prices (most online platforms)"
                        }
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Tax Calculation Example</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  {form.watch("taxInclusiveSales") ? (
                    <>
                      <p><strong>Tax-Inclusive:</strong> $100 sale = ${(100 / (1 + (parseFloat(form.watch("salesTaxRate")) || 0))).toFixed(2)} base + ${(100 - (100 / (1 + (parseFloat(form.watch("salesTaxRate")) || 0)))).toFixed(2)} tax</p>
                      <p className="text-xs">Tax is already included in your sale price</p>
                    </>
                  ) : (
                    <>
                      <p><strong>Tax-Exclusive:</strong> $100 base + ${(100 * (parseFloat(form.watch("salesTaxRate")) || 0)).toFixed(2)} tax = ${(100 * (1 + (parseFloat(form.watch("salesTaxRate")) || 0))).toFixed(2)} total</p>
                      <p className="text-xs">Tax is added on top of your sale price</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}