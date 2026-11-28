import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Capital {
  cost: string;
  items: number;
  buckets: { label: string; cost: string; items: number }[];
}

const money = (v: string | number) =>
  `$${parseFloat(String(v)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Fresh stock to old stock: green to red
const COLORS = ["bg-emerald-500", "bg-lime-400", "bg-amber-400", "bg-rose-500"];

/** How much cash is sitting in unsold stock, and how long it's been sitting there. */
export default function InventoryCapital() {
  const { data, isLoading } = useQuery<Capital>({ queryKey: ["/api/inventory/capital"] });

  const header = (
    <CardHeader className="pb-3">
      <CardTitle>Cash in inventory</CardTitle>
      <p className="text-sm text-muted-foreground">What you paid for stock that hasn't sold, by how long you've had it</p>
    </CardHeader>
  );

  if (isLoading) {
    return (
      <Card>
        {header}
        <CardContent>
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const total = parseFloat(data?.cost ?? "0");
  if (!data || data.items === 0) {
    return (
      <Card>
        {header}
        <CardContent>
          <p className="py-6 text-center text-sm text-muted-foreground">No unsold inventory</p>
        </CardContent>
      </Card>
    );
  }

  const old = data.buckets.slice(2).reduce((t, b) => t + parseFloat(b.cost), 0);
  const oldShare = total > 0 ? Math.round((old / total) * 100) : 0;

  return (
    <Card className="animate-fadeInUp" style={{ animationDelay: "420ms" }}>
      {header}
      <CardContent className="space-y-4">
        <div>
          <p className="tabular text-3xl font-extrabold tracking-tight">{money(total)}</p>
          <p className="mt-1 text-sm text-muted-foreground">tied up in {data.items} unsold items</p>
        </div>

        <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
          {data.buckets.map((b, i) => {
            const w = total > 0 ? (parseFloat(b.cost) / total) * 100 : 0;
            return w > 0 ? <div key={b.label} className={`h-full ${COLORS[i]}`} style={{ width: `${w}%` }} /> : null;
          })}
        </div>

        <div className="space-y-1.5 text-sm">
          {data.buckets.map((b, i) => (
            <div key={b.label} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className={`h-2.5 w-2.5 rounded-full ${COLORS[i]}`} />
                {b.label}
              </span>
              <span className="tabular font-semibold">{money(b.cost)}</span>
            </div>
          ))}
        </div>

        {oldShare >= 25 && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {oldShare}% of it has been sitting 60+ days.{" "}
            <Link href="/inventory" className="font-semibold underline">
              Reprice or relist
            </Link>{" "}
            to free up cash.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
