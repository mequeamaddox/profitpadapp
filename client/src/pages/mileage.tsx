import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Car, Download, Plus, Trash2 } from "lucide-react";
import type { MileageTrip } from "@shared/schema";
import { defaultMileageRate } from "@shared/mileage";

const PURPOSES = ["Sourcing run", "Post office / drop-off", "Supply pickup", "Pallet / auction pickup", "Local sale meetup"];

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function errorMessage(error: unknown) {
  const raw = (error as Error)?.message ?? "";
  try {
    return JSON.parse(raw.slice(raw.indexOf(":") + 1)).message ?? raw;
  } catch {
    return raw || "Something went wrong";
  }
}

export default function Mileage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: trips = [], isLoading } = useQuery<MileageTrip[]>({ queryKey: ["/api/mileage"] });

  const today = format(new Date(), "yyyy-MM-dd");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tripDate: today, miles: "", purpose: PURPOSES[0], route: "", roundTrip: true, rate: "" });
  const rateFor = (date: string) => defaultMileageRate(new Date(`${date}T12:00:00`).getFullYear());

  const year = new Date().getFullYear();
  const [shownYear, setShownYear] = useState(year);
  const years = useMemo(() => {
    const set = new Set(trips.map((t) => new Date(t.tripDate).getFullYear()));
    set.add(year);
    return Array.from(set).sort((a, b) => b - a);
  }, [trips, year]);

  const yearTrips = trips.filter((t) => new Date(t.tripDate).getFullYear() === shownYear);
  const deduction = (t: MileageTrip) => parseFloat(t.miles) * parseFloat(t.ratePerMile);
  const totals = yearTrips.reduce((a, t) => ({ miles: a.miles + parseFloat(t.miles), amount: a.amount + deduction(t) }), {
    miles: 0,
    amount: 0,
  });
  const thisMonth = trips
    .filter((t) => {
      const d = new Date(t.tripDate);
      const n = new Date();
      return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
    })
    .reduce((a, t) => a + parseFloat(t.miles), 0);

  const add = useMutation({
    mutationFn: async () => {
      const oneWay = parseFloat(form.miles);
      return apiRequest("POST", "/api/mileage", {
        tripDate: `${form.tripDate}T12:00:00`,
        miles: form.roundTrip ? oneWay * 2 : oneWay,
        purpose: form.purpose,
        route: form.route,
        ratePerMile: form.rate || rateFor(form.tripDate),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mileage"] });
      setOpen(false);
      setForm((f) => ({ ...f, miles: "", route: "" }));
      toast({ title: "Trip logged" });
    },
    onError: (e) => toast({ title: "Couldn't log trip", description: errorMessage(e), variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/mileage/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/mileage"] }),
  });

  const exportCsv = () => {
    const rows = [
      ["Date", "Purpose", "Route", "Miles", "Rate per mile", "Deduction"],
      ...yearTrips.map((t) => [
        format(new Date(t.tripDate), "yyyy-MM-dd"),
        t.purpose,
        t.route ?? "",
        t.miles,
        t.ratePerMile,
        deduction(t).toFixed(2),
      ]),
      ["Total", "", "", totals.miles.toFixed(1), "", totals.amount.toFixed(2)],
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `profitpad-mileage-${shownYear}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  const oneWay = parseFloat(form.miles) || 0;
  const previewMiles = form.roundTrip ? oneWay * 2 : oneWay;
  const previewRate = parseFloat(form.rate) || rateFor(form.tripDate);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Header title="Mileage" subtitle="Business miles and your mileage deduction" />
        <div className="flex-1 overflow-y-auto px-4 pb-32 pt-5 md:px-8 md:pt-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {years.map((y) => (
                  <Button key={y} size="sm" variant={y === shownYear ? "default" : "outline"} onClick={() => setShownYear(y)}>
                    {y}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportCsv} disabled={yearTrips.length === 0}>
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
                <Button onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4" /> Log a trip
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{shownYear} deduction</p>
                <p className="tabular mt-1 text-3xl font-extrabold text-emerald-700">{usd(totals.amount)}</p>
                <p className="mt-1 text-sm text-muted-foreground">at the IRS standard mileage rate</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{shownYear} business miles</p>
                <p className="tabular mt-1 text-3xl font-extrabold">{totals.miles.toLocaleString("en-US", { maximumFractionDigits: 1 })}</p>
                <p className="mt-1 text-sm text-muted-foreground">{yearTrips.length} trips</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">This month</p>
                <p className="tabular mt-1 text-3xl font-extrabold">{thisMonth.toLocaleString("en-US", { maximumFractionDigits: 1 })} mi</p>
                <p className="mt-1 text-sm text-muted-foreground">Log every sourcing run; it adds up fast.</p>
              </Card>
            </div>

            <Card className="overflow-hidden">
              {isLoading ? (
                <p className="p-8 text-center text-muted-foreground">Loading…</p>
              ) : yearTrips.length === 0 ? (
                <div className="flex flex-col items-center gap-3 p-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Car className="h-6 w-6" />
                  </div>
                  <p className="font-semibold">No trips logged for {shownYear}</p>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Drives to thrift stores, garage sales, the post office and supply runs are business miles. Log them here
                    and ProfitPad adds up your deduction.
                  </p>
                  <Button onClick={() => setOpen(true)}>
                    <Plus className="h-4 w-4" /> Log your first trip
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {yearTrips.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{t.purpose}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {format(new Date(t.tripDate), "MMM d, yyyy")}
                          {t.route ? ` · ${t.route}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <div className="text-right">
                          <p className="tabular font-semibold">{parseFloat(t.miles)} mi</p>
                          <p className="tabular text-sm text-emerald-700">{usd(deduction(t))}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete trip"
                          onClick={() => remove.mutate(t.id)}
                          disabled={remove.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <p className="text-xs text-muted-foreground">
              Uses the IRS standard mileage rate for each trip's year. You can change the rate on any trip. Keep this log
              with your tax records and check deductions with a tax professional.
            </p>
          </div>
        </div>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log a trip</DialogTitle>
            <DialogDescription>Business driving only: sourcing, shipping, supplies, pickups.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              add.mutate();
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="tripDate">Date</Label>
                <Input id="tripDate" type="date" value={form.tripDate} max={today}
                  onChange={(e) => setForm({ ...form, tripDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="miles">{form.roundTrip ? "Miles each way" : "Miles"}</Label>
                <Input id="miles" type="number" step="0.1" min="0.1" inputMode="decimal" placeholder="12.5"
                  value={form.miles} onChange={(e) => setForm({ ...form, miles: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input id="purpose" list="mileage-purposes" value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })} required />
              <datalist id="mileage-purposes">
                {PURPOSES.map((p) => <option key={p} value={p} />)}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="route">Where (optional)</Label>
              <Input id="route" placeholder="Home → Goodwill on Main → Post office" value={form.route}
                onChange={(e) => setForm({ ...form, route: e.target.value })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Round trip</p>
                <p className="text-xs text-muted-foreground">Counts the drive back too</p>
              </div>
              <Switch checked={form.roundTrip} onCheckedChange={(v) => setForm({ ...form, roundTrip: v })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Rate per mile</Label>
              <Input id="rate" type="number" step="0.001" min="0" placeholder={rateFor(form.tripDate).toFixed(3)}
                value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
            </div>
            <div className="rounded-xl bg-muted/60 p-3 text-sm">
              {previewMiles > 0 ? (
                <>
                  <b>{previewMiles.toFixed(1)} miles</b> × ${previewRate.toFixed(3)} ={" "}
                  <b className="text-emerald-700">{usd(previewMiles * previewRate)}</b> deduction
                </>
              ) : (
                <span className="text-muted-foreground">Enter the miles to see the deduction.</span>
              )}
            </div>
            <Button type="submit" className="h-11 w-full" disabled={add.isPending}>
              Save trip
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
