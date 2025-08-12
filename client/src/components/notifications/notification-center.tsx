import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Clock, AlertTriangle, CheckCircle, X, Timer } from "lucide-react";
import { Reminder } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function NotificationCenter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasPermission, setHasPermission] = useState(false);

  // Check and request notification permission
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setHasPermission(true);
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          setHasPermission(permission === "granted");
        });
      }
    }
  }, []);

  const { data: dueReminders = [] } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders?due=true"],
    refetchInterval: 60000, // Check every minute
  });

  const { data: overdueReminders = [] } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders?overdue=true"],
    refetchInterval: 60000, // Check every minute
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/reminders/${id}`, {
        method: "PUT",
        body: JSON.stringify({ completed: true }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({
        title: "Reminder completed",
        description: "The reminder has been marked as completed",
      });
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: async ({ id, minutes }: { id: string; minutes: number }) => {
      return apiRequest(`/api/reminders/${id}/snooze`, {
        method: "POST",
        body: JSON.stringify({ minutes }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({
        title: "Reminder snoozed",
        description: "The reminder will notify you again later",
      });
    },
  });

  // Show browser notifications for critical reminders
  useEffect(() => {
    if (hasPermission && (dueReminders.length > 0 || overdueReminders.length > 0)) {
      const criticalReminders = [...dueReminders, ...overdueReminders].filter(
        r => r.priority === "critical" && !r.completed
      );
      
      criticalReminders.forEach(reminder => {
        if (reminder.notificationMethods?.includes("browser")) {
          new Notification(`Critical Reminder: ${reminder.title}`, {
            body: reminder.description || "You have an important task due",
            icon: "/favicon.ico",
            tag: reminder.id,
          });
        }
      });
    }
  }, [dueReminders, overdueReminders, hasPermission]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical": return <AlertTriangle className="h-4 w-4" />;
      case "high": return <Bell className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const ReminderCard = ({ reminder, type }: { reminder: Reminder; type: "due" | "overdue" }) => (
    <Card className={`mb-3 ${type === "overdue" ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50"}`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between space-x-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className={getPriorityColor(reminder.priority || "medium")}>
                <div className="flex items-center space-x-1">
                  {getPriorityIcon(reminder.priority || "medium")}
                  <span className="capitalize">{reminder.priority || "medium"}</span>
                </div>
              </Badge>
              {reminder.category && (
                <Badge variant="outline" className="text-xs">
                  {reminder.category}
                </Badge>
              )}
            </div>
            <h4 className="font-semibold text-gray-900 truncate">{reminder.title}</h4>
            {reminder.description && (
              <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span>Due {formatDistanceToNow(new Date(reminder.dueDate))} ago</span>
              {reminder.isRecurring && (
                <Badge variant="outline" className="text-xs">
                  Repeats {reminder.recurringType}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => completeMutation.mutate(reminder.id)}
              disabled={completeMutation.isPending}
              className="text-green-600 hover:text-green-700"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => snoozeMutation.mutate({ id: reminder.id, minutes: 15 })}
              disabled={snoozeMutation.isPending}
              className="text-blue-600 hover:text-blue-700"
            >
              <Timer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const totalNotifications = dueReminders.length + overdueReminders.length;

  if (totalNotifications === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600">You have no pending reminders.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {totalNotifications} pending
        </Badge>
      </div>

      <Tabs defaultValue="overdue" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overdue" className="relative">
            Overdue
            {overdueReminders.length > 0 && (
              <Badge className="ml-2 bg-red-600">{overdueReminders.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="due" className="relative">
            Due Soon
            {dueReminders.length > 0 && (
              <Badge className="ml-2 bg-orange-600">{dueReminders.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overdue" className="mt-6">
          {overdueReminders.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600">No overdue reminders</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {overdueReminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} type="overdue" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="due" className="mt-6">
          {dueReminders.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600">No reminders due soon</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {dueReminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} type="due" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}