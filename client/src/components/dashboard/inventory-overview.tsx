import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowRight, PackageOpen } from "lucide-react";
import { DashboardMetrics, InventoryItem } from "@shared/schema";

const STATUS_STYLES: Record<string, string> = {
  listed: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  unlisted: "bg-slate-100 text-slate-600 ring-slate-500/15",
  sold: "bg-sky-50 text-sky-700 ring-sky-600/15",
  returned: "bg-amber-50 text-amber-700 ring-amber-600/15",
};

export default function InventoryOverview() {
  const [, setLocation] = useLocation();

  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: recentInventory = [], isLoading: inventoryLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory", { limit: 3 }],
  });

  const stats = (metrics?.inventoryStats || {}) as any;
  const tiles = [
    { label: "Total items", value: stats.totalItems || 0, tone: "text-foreground" },
    { label: "Active listings", value: stats.activeListings || 0, tone: "text-emerald-700" },
    { label: "Low stock", value: stats.lowStock || 0, tone: "text-amber-600" },
  ];

  return (
    <Card className="animate-fadeInUp h-full" style={{ animationDelay: "300ms" }}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle>Inventory</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/inventory")}
          className="-mr-2 h-8 gap-1 text-primary hover:bg-accent hover:text-primary"
        >
          Manage <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid grid-cols-3 divide-x divide-border/70 rounded-xl border border-border/70 bg-muted/40">
          {tiles.map((tile) => (
            <div key={tile.label} className="px-3 py-3 text-center md:py-4">
              {isLoading ? (
                <div className="mx-auto h-7 w-10 animate-pulse rounded bg-muted" />
              ) : (
                <p className={`tabular text-2xl font-extrabold ${tile.tone}`}>{tile.value}</p>
              )}
              <p className="mt-1 text-xs font-medium text-muted-foreground">{tile.label}</p>
            </div>
          ))}
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recently added</p>

        {inventoryLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : recentInventory.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
              <PackageOpen className="h-5 w-5 text-accent-foreground" />
            </div>
            <p className="font-semibold">No inventory yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add your first item to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/70">
            {recentInventory.slice(0, 3).map((item: any) => {
              const status = (item.status || "unlisted").toLowerCase();
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setLocation(`/inventory?edit=${item.id}`)}
                    className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted/60"
                  >
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.title} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                        <PackageOpen className="h-4 w-4 text-slate-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.sku}{item.platform ? ` · ${item.platform}` : ""}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="tabular text-sm font-bold">${parseFloat(item.listedPrice).toFixed(2)}</p>
                      <span
                        className={`rounded-full px-2 py-px text-[11px] font-semibold capitalize ring-1 ring-inset ${STATUS_STYLES[status] || STATUS_STYLES.unlisted}`}
                      >
                        {status}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
