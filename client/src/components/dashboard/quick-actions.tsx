import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, DollarSign, Upload, Bell } from "lucide-react";
import InventoryForm from "@/components/forms/inventory-form";
import SalesForm from "@/components/forms/sales-form";
import ReminderForm from "@/components/forms/reminder-form";

export default function QuickActions() {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const actions = [
    {
      id: "inventory",
      title: "Add Inventory Item",
      icon: Plus,
      gradient: "from-blue-500 to-blue-600",
      description: "Add new products to track",
    },
    {
      id: "sales",
      title: "Record Sale",
      icon: DollarSign,
      gradient: "from-emerald-500 to-emerald-600",
      description: "Log completed transactions",
    },
    {
      id: "csv",
      title: "Import CSV",
      icon: Upload,
      gradient: "from-purple-500 to-purple-600",
      description: "Bulk import inventory data",
    },
    {
      id: "reminder",
      title: "Create Reminder",
      icon: Bell,
      gradient: "from-amber-500 to-amber-600",
      description: "Set task notifications",
    },
  ];

  const handleActionClick = (actionId: string) => {
    if (actionId === "csv") {
      // TODO: Implement CSV import functionality
      return;
    }
    setOpenDialog(actionId);
  };

  const handleDialogClose = () => {
    setOpenDialog(null);
  };

  return (
    <>
      <Card className="card-retail group animate-fadeInUp" style={{ animationDelay: '800ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-foreground">Quick Actions</span>
            <div className="w-2 h-2 gradient-primary rounded-full animate-pulse shadow-sm"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actions.map((action, index) => (
              <Button
                key={action.id}
                variant="outline"
                className="w-full justify-start p-4 h-auto hover:shadow-lg hover-lift transition-all duration-300 border-border/60 hover:border-primary/30 animate-fadeInUp group/button bg-card/50 backdrop-blur-sm"
                style={{ animationDelay: `${800 + (index * 100)}ms` }}
                onClick={() => handleActionClick(action.id)}
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mr-4 transition-all duration-300 group-hover/button:scale-110 group-hover/button:rotate-6 shadow-lg animate-float`}>
                  <action.icon className="text-white" size={20} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-foreground font-medium">{action.title}</span>
                  <span className="text-xs text-muted-foreground">{action.description}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inventory Form Dialog */}
      <Dialog open={openDialog === "inventory"} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
          </DialogHeader>
          <InventoryForm onSuccess={handleDialogClose} />
        </DialogContent>
      </Dialog>

      {/* Sales Form Dialog */}
      <Dialog open={openDialog === "sales"} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record New Sale</DialogTitle>
          </DialogHeader>
          <SalesForm onSuccess={handleDialogClose} />
        </DialogContent>
      </Dialog>

      {/* Reminder Form Dialog */}
      <Dialog open={openDialog === "reminder"} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Reminder</DialogTitle>
          </DialogHeader>
          <ReminderForm onSuccess={handleDialogClose} />
        </DialogContent>
      </Dialog>
    </>
  );
}
