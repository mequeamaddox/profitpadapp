import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { InventoryItem, SalesRecord } from "@shared/schema";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const pct = (n: number | null) => (n === null || !isFinite(n) ? "—" : `${Math.round(n * 100)}%`);
const num = (v: string | null | undefined) => parseFloat(v || "0") || 0;

interface Row {
  name: string;
  sales: number;
  revenue: number;
  costs: number;
  profit: number;
  returns: number;
  cost: number; // what the items cost (by-source ROI)
  daysToSell: number[];
  unsold: number;
  unsoldCost: number;
}

const blank = (name: string): Row => ({
  name, sales: 0, revenue: 0, costs: 0, profit: 0, returns: 0, cost: 0, daysToSell: [], unsold: 0, unsoldCost: 0,
});

function Bar({ value, max }: { value: number; max: number }) {
  const w = max > 0 ? Math.max(2, (Math.max(0, value) / max) * 100) : 0;
  return (
    <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
      <div className="h-1.5 rounded-full bg-primary" style={{ width: `${w}%` }} />
    </div>
  );
}

/**
 * Where the money comes from: profit by marketplace, and by where items were
 * bought. Returned sales count as returns and their losses come off profit.
 */
export default function ProfitBreakdown({
  sales,
  inventory,
  start,
  end,
}: {
  sales: SalesRecord[];
  inventory: InventoryItem[];
  start?: Date;
  end?: Date;
}) {
  const inRange = sales.filter((s) => {
    const t = new Date(s.saleDate).getTime();
    return (!start || t >= start.getTime()) && (!end || t <= end.getTime());
  });
  const items = new Map(inventory.map((i) => [i.id, i]));

  // By marketplace
  const byPlatform = new Map<string, Row>();
  for (const s of inRange) {
    const name = s.platform?.trim() || "Not set";
    const r = byPlatform.get(name) ?? blank(name);
    if (s.returnedAt) r.returns++;
    else {
      r.sales++;
      r.revenue += num(s.salePrice);
      r.costs += num(s.platformFee) + num(s.shippingCost) + num(s.otherFees);
    }
    r.profit += num(s.profit);
    byPlatform.set(name, r);
  }
  const platforms = Array.from(byPlatform.values()).sort((a, b) => b.profit - a.profit);
  const maxPlatformProfit = Math.max(0, ...platforms.map((p) => p.profit));

  // By source (where it was bought)
  const bySource = new Map<string, Row>();
  for (const s of inRange) {
    const item = s.inventoryItemId ? items.get(s.inventoryItemId) : undefined;
    const name = item?.source?.trim() || "Not recorded";
    const r = bySource.get(name) ?? blank(name);
    if (s.returnedAt) r.returns++;
    else {
      r.sales++;
      r.revenue += num(s.salePrice);
      r.cost += num(s.purchasePrice);
      if (item?.dateAcquired) {
        r.daysToSell.push(Math.max(0, (new Date(s.saleDate).getTime() - new Date(item.dateAcquired).getTime()) / 86_400_000));
      }
    }
    r.profit += num(s.profit);
    bySource.set(name, r);
  }
  const soldIds = new Set(sales.filter((s) => s.inventoryItemId && !s.returnedAt).map((s) => s.inventoryItemId));
  for (const i of inventory) {
    if (i.archived || i.status === "sold" || soldIds.has(i.id)) continue;
    const name = i.source?.trim() || "Not recorded";
    const r = bySource.get(name) ?? blank(name);
    const qty = Math.max(1, i.quantity ?? 1);
    r.unsold += qty;
    r.unsoldCost += num(i.purchasePrice) * qty;
    bySource.set(name, r);
  }
  const sources = Array.from(bySource.values()).sort((a, b) =>
    a.name === "Not recorded" ? 1 : b.name === "Not recorded" ? -1 : b.profit - a.profit,
  );
  const maxSourceProfit = Math.max(0, ...sources.map((p) => p.profit));
  const anySource = sources.some((s) => s.name !== "Not recorded");

  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profit by marketplace</CardTitle>
          <CardDescription>What you actually keep on each platform after fees, shipping and returns</CardDescription>
        </CardHeader>
        <CardContent>
          {platforms.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">No sales in this date range</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-3 font-semibold">Marketplace</th>
                    <th className="py-2 pr-3 text-right font-semibold">Sales</th>
                    <th className="py-2 pr-3 text-right font-semibold">Revenue</th>
                    <th className="py-2 pr-3 text-right font-semibold">Fees &amp; shipping</th>
                    <th className="py-2 pr-3 text-right font-semibold">Profit</th>
                    <th className="py-2 pr-3 text-right font-semibold">Per sale</th>
                    <th className="py-2 pr-3 text-right font-semibold">Margin</th>
                    <th className="py-2 text-right font-semibold">Returns</th>
                  </tr>
                </thead>
                <tbody>
                  {platforms.map((p) => (
                    <tr key={p.name} className="border-b last:border-0">
                      <td className="py-3 pr-3">
                        <p className="font-medium">{p.name}</p>
                        <Bar value={p.profit} max={maxPlatformProfit} />
                      </td>
                      <td className="tabular py-3 pr-3 text-right">{p.sales}</td>
                      <td className="tabular py-3 pr-3 text-right">{usd(p.revenue)}</td>
                      <td className="tabular py-3 pr-3 text-right text-muted-foreground">
                        {usd(p.costs)} {p.revenue > 0 && <span className="text-xs">({pct(p.costs / p.revenue)})</span>}
                      </td>
                      <td className={`tabular py-3 pr-3 text-right font-semibold ${p.profit < 0 ? "text-rose-700" : "text-emerald-700"}`}>
                        {usd(p.profit)}
                      </td>
                      <td className="tabular py-3 pr-3 text-right">{p.sales ? usd(p.profit / p.sales) : "—"}</td>
                      <td className="tabular py-3 pr-3 text-right">{p.revenue > 0 ? pct(p.profit / p.revenue) : "—"}</td>
                      <td className="tabular py-3 text-right">{p.returns || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profit by source</CardTitle>
          <CardDescription>Which places you buy from pay off best, and how much cash is still sitting in their items</CardDescription>
        </CardHeader>
        <CardContent>
          {!anySource ? (
            <p className="py-4 text-center text-muted-foreground">
              Add <b>Where you bought it</b> to your inventory items (or a <code>source</code> column in your CSV import) to
              see which stores, sales and suppliers make you the most money.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-3 font-semibold">Source</th>
                    <th className="py-2 pr-3 text-right font-semibold">Sold</th>
                    <th className="py-2 pr-3 text-right font-semibold">Profit</th>
                    <th className="py-2 pr-3 text-right font-semibold">Return on cost</th>
                    <th className="py-2 pr-3 text-right font-semibold">Avg days to sell</th>
                    <th className="py-2 text-right font-semibold">Still unsold</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((s) => {
                    const days = avg(s.daysToSell);
                    return (
                      <tr key={s.name} className="border-b last:border-0">
                        <td className="py-3 pr-3">
                          <p className={`font-medium ${s.name === "Not recorded" ? "text-muted-foreground" : ""}`}>{s.name}</p>
                          <Bar value={s.profit} max={maxSourceProfit} />
                        </td>
                        <td className="tabular py-3 pr-3 text-right">{s.sales}</td>
                        <td className={`tabular py-3 pr-3 text-right font-semibold ${s.profit < 0 ? "text-rose-700" : "text-emerald-700"}`}>
                          {usd(s.profit)}
                        </td>
                        <td className="tabular py-3 pr-3 text-right">{s.cost > 0 ? pct(s.profit / s.cost) : "—"}</td>
                        <td className="tabular py-3 pr-3 text-right">{days === null ? "—" : Math.round(days)}</td>
                        <td className="tabular py-3 text-right">
                          {s.unsold ? (
                            <>
                              {s.unsold} <span className="text-muted-foreground">· {usd(s.unsoldCost)}</span>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
