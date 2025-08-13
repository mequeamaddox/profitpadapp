import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import ReminderForm from "@/components/forms/reminder-form";
import NotificationCenter from "@/components/notifications/notification-center";
import NotificationSettings from "@/components/notifications/notification-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Clock, CheckCircle, Bell, Settings } from "lucide-react";
import type { Reminder } from "@shared/schema";

export default function Reminders() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

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

  const { data: reminders = [], isLoading: remindersLoading } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
    enabled: isAuthenticated,
  });

  const { data: overdueReminders = [] } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders?overdue=true"],
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/reminders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({
        title: "Success",
        description: "Reminder deleted successfully",
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
        description: "Failed to delete reminder",
        variant: "destructive",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      await apiRequest("PUT", `/api/reminders/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({
        title: "Success",
        description: "Reminder updated successfully",
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
        description: "Failed to update reminder",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingReminder(null);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const filteredReminders = reminders.filter((reminder: Reminder) => 
    showCompleted ? true : !reminder.completed
  );

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
        <Header title="Reminders" subtitle="Stay on top of your tasks and deadlines." />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6" style={{ paddingBottom: '150px' }}>
          <Tabs defaultValue="reminders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="reminders" className="text-xs md:text-sm">
                <span className="hidden sm:inline">My </span>Reminders
              </TabsTrigger>
              <TabsTrigger value="notifications" className="relative text-xs md:text-sm">
                <Bell className="h-4 w-4 md:mr-2" />
                <span className="hidden sm:inline">Notifications</span>
                {overdueReminders.length > 0 && (
                  <Badge variant="destructive" className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5 rounded-full p-0 text-xs">
                    {overdueReminders.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs md:text-sm">
                <Settings className="h-4 w-4 md:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reminders" className="space-y-6">
              {/* Actions Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Button
                    variant={showCompleted ? "default" : "outline"}
                    onClick={() => setShowCompleted(!showCompleted)}
                    size="sm"
                  >
                    {showCompleted ? "Hide Completed" : "Show Completed"}
                  </Button>
                </div>
                
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingReminder(null)} className="shrink-0">
                      <Plus className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Create Reminder</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 md:mx-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingReminder ? "Edit Reminder" : "Create New Reminder"}
                      </DialogTitle>
                    </DialogHeader>
                    <ReminderForm
                      reminder={editingReminder}
                      onSuccess={handleFormClose}
                    />
                  </DialogContent>
                </Dialog>
              </div>

          {/* Overdue Alert */}
          {overdueReminders.length > 0 && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Overdue Reminders ({overdueReminders.length})
                </CardTitle>
                <CardDescription className="text-red-600">
                  You have overdue tasks that need attention.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Reminders Grid */}
          <div className="grid gap-4">
            {remindersLoading ? (
              <div className="text-center py-8">Loading reminders...</div>
            ) : filteredReminders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 text-slate-500">
                  {showCompleted 
                    ? "No reminders found." 
                    : "No active reminders. Create your first reminder to get started."
                  }
                </CardContent>
              </Card>
            ) : (
              filteredReminders.map((reminder: Reminder) => (
                <Card 
                  key={reminder.id} 
                  className={`${reminder.completed ? 'opacity-60' : ''} ${
                    isOverdue(reminder.dueDate) && !reminder.completed ? 'border-red-200 bg-red-50' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={reminder.completed}
                          onCheckedChange={(checked) =>
                            completeMutation.mutate({
                              id: reminder.id,
                              completed: !!checked,
                            })
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h3 className={`font-semibold ${reminder.completed ? 'line-through' : ''}`}>
                            {reminder.title}
                          </h3>
                          {reminder.description && (
                            <p className="text-slate-600 mt-1 text-sm">
                              {reminder.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-3">
                            <div className="flex items-center text-sm text-slate-500">
                              <Clock className="h-4 w-4 mr-1" />
                              Due: {new Date(reminder.dueDate).toLocaleDateString()} at{" "}
                              {new Date(reminder.dueDate).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            {isOverdue(reminder.dueDate) && !reminder.completed && (
                              <Badge variant="destructive">Overdue</Badge>
                            )}
                            {reminder.completed && (
                              <Badge variant="default">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(reminder)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationCenter />
        </TabsContent>

        <TabsContent value="settings">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
      </main>
    </div>
  );
}
