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
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      id: "sales",
      title: "Record Sale",
      icon: DollarSign,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      id: "csv",
      title: "Import CSV",
      icon: Upload,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      id: "reminder",
      title: "Create Reminder",
      icon: Bell,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
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
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="w-full justify-start p-3 h-auto"
                onClick={() => handleActionClick(action.id)}
              >
                <div className={`w-8 h-8 ${action.iconBg} rounded-lg flex items-center justify-center mr-3`}>
                  <action.icon className={`${action.iconColor} text-sm`} size={16} />
                </div>
                <span className="font-medium text-slate-900">{action.title}</span>
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
