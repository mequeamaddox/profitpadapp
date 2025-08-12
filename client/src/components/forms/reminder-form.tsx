import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertReminderSchema, type Reminder, type InsertReminder } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import UpgradePrompt from "@/components/upgrade-prompt";
import { useState } from "react";
import { User } from "@shared/schema";

interface ReminderFormProps {
  reminder?: Reminder | null;
  onSuccess?: () => void;
}

export default function ReminderForm({ reminder, onSuccess }: ReminderFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const { data: sales = [] } = useQuery({
    queryKey: ["/api/sales"],
  });

  const form = useForm<InsertReminder>({
    resolver: zodResolver(insertReminderSchema),
    defaultValues: {
      title: reminder?.title || "",
      description: reminder?.description || "",
      dueDate: reminder?.dueDate ? new Date(reminder.dueDate) : new Date(),
      inventoryItemId: reminder?.inventoryItemId || "",
      salesRecordId: reminder?.salesRecordId || "",
      completed: reminder?.completed || false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertReminder) => {
      return await apiRequest("POST", "/api/reminders", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({
        title: "Success",
        description: "Reminder created successfully",
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
      if (error.message.includes('Reminders limit reached')) {
        setShowUpgradePrompt(true);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create reminder",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertReminder>) => {
      return await apiRequest("PUT", `/api/reminders/${reminder!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({
        title: "Success",
        description: "Reminder updated successfully",
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
        description: "Failed to update reminder",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertReminder) => {
    const formattedData = {
      ...data,
      inventoryItemId: data.inventoryItemId || null,
      salesRecordId: data.salesRecordId || null,
    };

    if (reminder) {
      updateMutation.mutate(formattedData);
    } else {
      createMutation.mutate(formattedData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const selectedDate = form.watch("dueDate");

  return (
    <div>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reminder Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter reminder title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter reminder description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date & Time</FormLabel>
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
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Time</FormLabel>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <Input
                type="time"
                value={selectedDate ? format(selectedDate, "HH:mm") : ""}
                onChange={(e) => {
                  if (selectedDate && e.target.value) {
                    const [hours, minutes] = e.target.value.split(":");
                    const newDate = new Date(selectedDate);
                    newDate.setHours(parseInt(hours), parseInt(minutes));
                    form.setValue("dueDate", newDate);
                  }
                }}
              />
            </div>
          </FormItem>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="inventoryItemId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link to Inventory Item (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select inventory item" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No linked item</SelectItem>
                    {inventory.map((item: any) => (
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
            name="salesRecordId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link to Sales Record (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sales record" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No linked sale</SelectItem>
                    {sales.map((sale: any) => (
                      <SelectItem key={sale.id} value={sale.id}>
                        Sale ${sale.salePrice} - {format(new Date(sale.dateSold), "PPP")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : reminder ? "Update Reminder" : "Create Reminder"}
          </Button>
        </div>
      </form>
    </Form>

    <UpgradePrompt 
      isOpen={showUpgradePrompt}
      onClose={() => setShowUpgradePrompt(false)}
      currentTier={user?.subscriptionTier || 'starter'}
      feature="reminders"
      limit={20}
    />
  </div>
  );
}
