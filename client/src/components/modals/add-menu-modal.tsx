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

  // On mobile, use a full-screen overlay instead of modal
  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
    if (!open) return null;
    
    return (
      <div className="fixed inset-0 z-50 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center">
            {selectedAction ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="mr-2 p-1"
              >
                ← Back
              </Button>
            ) : null}
            <h2 className="text-lg font-semibold">
              {selectedAction ? (
                <>
                  {selectedAction === "inventory" && "Add New Inventory Item"}
                  {selectedAction === "sales" && "Record New Sale"}
                  {selectedAction === "reminder" && "Create New Reminder"}
                </>
              ) : (
                "Add New"
              )}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenChange}
            className="p-1"
          >
            ✕
          </Button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto h-[calc(100vh-73px)] p-4">
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
            <div className="pb-8">
              {selectedAction === "inventory" && (
                <InventoryForm onSuccess={handleClose} />
              )}
              {selectedAction === "sales" && (
                <SalesForm onSuccess={handleClose} />
              )}
              {selectedAction === "reminder" && (
                <ReminderForm onSuccess={handleClose} />
              )}
              {/* Test content */}
              <div className="mt-8 p-4 bg-gray-100 rounded">
                <p>Test scroll area - this content should force scrolling on mobile</p>
                {Array.from({ length: 20 }, (_, i) => (
                  <p key={i} className="py-2">Test line {i + 1} - scroll test content</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop modal
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl mx-4 md:mx-auto flex flex-col md:h-auto md:max-h-[95vh] overflow-hidden">
        <DialogHeader className="flex-shrink-0">
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

        <div className="flex-1 overflow-y-auto min-h-0">
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
            <div className="pb-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
