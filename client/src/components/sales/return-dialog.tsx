import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SalesRecord } from "@shared/schema";

/** Marks a sale as returned: reverses its revenue and profit, records what was lost, and can restock the item. */
export default function ReturnDialog({ sale, onClose }: { sale: SalesRecord | null; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [costsLost, setCostsLost] = useState("");
  const [backInStock, setBackInStock] = useState(true);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (sale) {
      // The original shipping label usually isn't refunded
      setCostsLost(parseFloat(sale.shippingCost || "0") > 0 ? parseFloat(sale.shippingCost!).toFixed(2) : "");
      setBackInStock(true);
      setNote("");
    }
  }, [sale]);

  const cost = parseFloat(sale?.purchasePrice || "0") || 0;
  const loss = (parseFloat(costsLost) || 0) + (backInStock ? 0 : cost);

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", `/api/sales/${sale!.id}/return`, { costsLost: costsLost || "0", backInStock, note }),
    onSuccess: () => {
      for (const key of ["/api/sales", "/api/inventory", "/api/dashboard/metrics", "/api/inventory/capital"]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      toast({
        title: "Marked as returned",
        description:
          backInStock && sale?.inventoryItemId ? "The item is back in your inventory." : "Your totals have been updated.",
      });
      onClose();
    },
    onError: () => toast({ title: "Couldn't mark as returned", variant: "destructive" }),
  });

  return (
    <Dialog open={!!sale} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as returned</DialogTitle>
          <DialogDescription>
            {sale?.itemTitle} · sold for ${sale?.salePrice}. The sale comes out of your revenue and profit.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="costsLost">Costs you didn't get back ($)</Label>
            <Input
              id="costsLost"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={costsLost}
              onChange={(e) => setCostsLost(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Shipping labels, return shipping, fees the marketplace kept. Pre-filled with the original shipping cost.
            </p>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Item is back in stock</p>
              <p className="text-xs text-muted-foreground">
                {sale?.inventoryItemId
                  ? "Puts it back in your inventory to sell again"
                  : "Turn off if the item didn't come back"}
              </p>
            </div>
            <Switch checked={backInStock} onCheckedChange={setBackInStock} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input
              id="note"
              placeholder="Not as described, buyer's remorse…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="rounded-xl bg-muted/60 p-3 text-sm">
            This return costs you <b className="text-rose-700">${loss.toFixed(2)}</b>
            {!backInStock && cost > 0 ? ` (including the $${cost.toFixed(2)} you paid for it)` : ""}.
          </div>
          <Button type="submit" className="h-11 w-full" disabled={mutation.isPending}>
            Mark as returned
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
