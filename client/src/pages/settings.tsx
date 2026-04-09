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
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import SettingsShell from "@/components/settings/settings-shell";
import { DollarSign, Calculator } from "lucide-react";
import { z } from "zod";

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
      return await apiRequest("PUT", "/api/user/settings", {
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
        description: "Your business settings have been saved.",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session Expired",
          description: "Please log in again.",
          variant: "destructive",
        });
        window.location.href = "/login";
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
  const taxRatePercent = (
    (parseFloat(form.watch("salesTaxRate")) || 0) * 100
  ).toFixed(2);

  if (isLoading) {
    return (
      <SettingsShell
        title="Settings"
        subtitle="Manage your business preferences."
      >
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell
      title="Settings"
      subtitle="Manage your business goals and tax preferences."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Business Goals
              </CardTitle>
              <CardDescription>
                Set your monthly revenue targets to track progress.
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
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <Input
                          placeholder="10000.00"
                          className="pl-8"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your monthly revenue target for tracking performance.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Sales Tax Configuration
              </CardTitle>
              <CardDescription>
                Configure sales tax settings for accurate reporting.
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
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                          ({taxRatePercent}%)
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter as decimal, for example 0.0825 for 8.25%.
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
                      <FormLabel className="text-base">
                        Tax-Inclusive Sales
                      </FormLabel>
                      <FormDescription>
                        {field.value
                          ? "Sales prices include tax."
                          : "Tax is added on top of sale prices."}
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
    </SettingsShell>
  );
}