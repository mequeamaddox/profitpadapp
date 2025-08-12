import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { insertNotificationSettingsSchema, type NotificationSettings } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Bell, Mail, Clock, Moon, Globe } from "lucide-react";

const formSchema = insertNotificationSettingsSchema;
type FormData = z.infer<typeof formSchema>;

export default function NotificationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery<NotificationSettings>({
    queryKey: ["/api/notification-settings"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      browserNotifications: true,
      emailNotifications: false,
      reminderLeadTime: 60,
      dailyDigest: false,
      weeklyReport: true,
      lowStockAlerts: true,
      profitGoalAlerts: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
      timezone: "UTC",
    },
  });

  // Update form when settings data loads
  useEffect(() => {
    if (settings) {
      form.reset({
        browserNotifications: settings.browserNotifications,
        emailNotifications: settings.emailNotifications,
        reminderLeadTime: settings.reminderLeadTime,
        dailyDigest: settings.dailyDigest,
        weeklyReport: settings.weeklyReport,
        lowStockAlerts: settings.lowStockAlerts,
        profitGoalAlerts: settings.profitGoalAlerts,
        quietHoursStart: settings.quietHoursStart,
        quietHoursEnd: settings.quietHoursEnd,
        timezone: settings.timezone,
      });
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("/api/notification-settings", "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-settings"] });
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    updateSettingsMutation.mutate(data);
  };

  const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Australia/Sydney",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Bell className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* General Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>General Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="browserNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Browser Notifications</FormLabel>
                      <FormDescription>
                        Show notifications in your browser for important reminders
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email Notifications</span>
                      </FormLabel>
                      <FormDescription>
                        Receive reminder notifications via email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reminderLeadTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Reminder Lead Time (minutes)</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="5" 
                        max="1440"
                        {...field}
                        value={field.value ?? 60}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                      />
                    </FormControl>
                    <FormDescription>
                      How early to notify you before reminders are due
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Business Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Business Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="lowStockAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Low Stock Alerts</FormLabel>
                      <FormDescription>
                        Get notified when inventory items are running low
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profitGoalAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Profit Goal Alerts</FormLabel>
                      <FormDescription>
                        Get notified about monthly profit goal progress
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Reports & Digest */}
          <Card>
            <CardHeader>
              <CardTitle>Reports & Digest</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="dailyDigest"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Daily Digest</FormLabel>
                      <FormDescription>
                        Receive a daily summary of your business activities
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weeklyReport"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Weekly Report</FormLabel>
                      <FormDescription>
                        Get a comprehensive weekly business performance report
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Moon className="h-5 w-5" />
                <span>Quiet Hours</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quietHoursStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} value={field.value ?? "22:00"} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quietHoursEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} value={field.value ?? "08:00"} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormDescription>
                No notifications will be sent during these hours
              </FormDescription>

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>Timezone</span>
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value ?? "UTC"}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz} value={tz}>
                              {tz}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            disabled={updateSettingsMutation.isPending}
            className="w-full"
          >
            {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </Form>
    </div>
  );
}