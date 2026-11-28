import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Repeat, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { RecurringExpense } from "@shared/schema";

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/** Expenses that log themselves every month, with a way to stop each one. */
export default function RecurringExpenses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data = [] } = useQuery<RecurringExpense[]>({ queryKey: ["/api/recurring-expenses"] });

  const stop = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/recurring-expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-expenses"] });
      toast({ title: "Stopped", description: "It won't be logged again. Past entries are kept." });
    },
  });

  if (data.length === 0) return null;
  const monthly = data.reduce((t, r) => t + parseFloat(r.amount), 0);

  return (
    <Card className="p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-primary" />
          <p className="font-semibold">Repeats monthly</p>
        </div>
        <p className="text-sm text-muted-foreground">${monthly.toFixed(2)}/month, logged automatically</p>
      </div>
      <div className="divide-y divide-border">
        {data.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate font-medium">{r.title}</p>
              <p className="text-xs text-muted-foreground">
                {r.category} · on the {ordinal(r.dayOfMonth)} of each month
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="tabular font-semibold">${parseFloat(r.amount).toFixed(2)}</span>
              <Button
                variant="ghost"
                size="sm"
                disabled={stop.isPending}
                onClick={() => stop.mutate(r.id)}
                aria-label={`Stop repeating ${r.title}`}
              >
                <X className="h-4 w-4" /> Stop
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
