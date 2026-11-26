import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, DollarSign, Bell, Receipt } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import InventoryForm from "@/components/forms/inventory-form";
import SalesForm from "@/components/forms/sales-form";
import ReminderForm from "@/components/forms/reminder-form";

export default function QuickActions() {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const actions = [
    { id: "inventory", title: "Add item", hint: "New inventory", icon: Plus, tint: "bg-emerald-50 text-emerald-700" },
    { id: "sales", title: "Record sale", hint: "Log a sale", icon: DollarSign, tint: "bg-sky-50 text-sky-700" },
    { id: "expense", title: "Add expense", hint: "Track costs", icon: Receipt, tint: "bg-amber-50 text-amber-700" },
    { id: "reminder", title: "Reminder", hint: "Follow up", icon: Bell, tint: "bg-violet-50 text-violet-700" },
  ];

  const handleActionClick = (actionId: string) => {
    if (actionId === "expense") {
      setLocation("/expenses");
      return;
    }
    setOpenDialog(actionId);
  };

  const handleDialogClose = () => setOpenDialog(null);

  return (
    <>
      <Card className="animate-fadeInUp h-full" style={{ animationDelay: "240ms" }}>
        <CardHeader className="pb-3">
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action.id)}
                className="group flex flex-col items-start gap-3 rounded-xl border border-border/80 bg-card p-3.5 text-left transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift"
              >
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", action.tint)}>
                  <action.icon className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.hint}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={openDialog === "inventory"} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
          </DialogHeader>
          <InventoryForm onSuccess={handleDialogClose} />
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "sales"} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record New Sale</DialogTitle>
          </DialogHeader>
          <SalesForm onSuccess={handleDialogClose} />
        </DialogContent>
      </Dialog>

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
