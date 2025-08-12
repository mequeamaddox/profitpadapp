import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, Bell } from "lucide-react";
import InventoryForm from "@/components/forms/inventory-form";
import SalesForm from "@/components/forms/sales-form";
import ReminderForm from "@/components/forms/reminder-form";

interface AddMenuModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddMenuModal({ open, onOpenChange }: AddMenuModalProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
  };

  const handleBack = () => {
    setSelectedAction(null);
  };

  const handleClose = () => {
    setSelectedAction(null);
    onOpenChange(false);
  };

  const actions = [
    {
      id: "inventory",
      title: "Inventory Item",
      description: "Add a new product to your inventory",
      icon: Package,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      id: "sales",
      title: "Sale Record",
      description: "Record a new sale transaction",
      icon: DollarSign,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      id: "reminder",
      title: "Reminder",
      description: "Set up a new reminder or task",
      icon: Bell,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {selectedAction ? (
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="mr-2 p-0 h-auto"
                >
                  ← Back
                </Button>
                {selectedAction === "inventory" && "Add New Inventory Item"}
                {selectedAction === "sales" && "Record New Sale"}
                {selectedAction === "reminder" && "Create New Reminder"}
              </div>
            ) : (
              "Add New"
            )}
          </DialogTitle>
        </DialogHeader>

        {!selectedAction ? (
          <div className="space-y-3">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="w-full justify-start p-4 h-auto"
                onClick={() => handleActionSelect(action.id)}
              >
                <div className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center mr-3`}>
                  <action.icon className={action.iconColor} size={20} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-900">{action.title}</p>
                  <p className="text-sm text-slate-500">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div>
            {selectedAction === "inventory" && (
              <InventoryForm onSuccess={handleClose} />
            )}
            {selectedAction === "sales" && (
              <SalesForm onSuccess={handleClose} />
            )}
            {selectedAction === "reminder" && (
              <ReminderForm onSuccess={handleClose} />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
