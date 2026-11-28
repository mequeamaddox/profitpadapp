import type { Express, RequestHandler } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "./db";
import { storage } from "./storage";
import { inventoryItems, mileageTrips, salesRecords } from "@shared/schema";
import { defaultMileageRate } from "@shared/mileage";

const money = (n: number) => (Math.round(n * 100) / 100).toFixed(2);

export function registerInsightRoutes(app: Express, requireAuth: RequestHandler, checkTrialExpired: RequestHandler) {
  /* ---------- mileage log ---------- */

  app.get("/api/mileage", requireAuth, async (req: any, res) => {
    const trips = await db
      .select()
      .from(mileageTrips)
      .where(eq(mileageTrips.userId, req.user.claims.sub))
      .orderBy(desc(mileageTrips.tripDate));
    res.json(trips);
  });

  app.post("/api/mileage", requireAuth, checkTrialExpired, async (req: any, res) => {
    const tripDate = new Date(req.body?.tripDate ?? Date.now());
    const miles = parseFloat(req.body?.miles);
    const purpose = String(req.body?.purpose ?? "").trim();
    const route = String(req.body?.route ?? "").trim() || null;
    const rate =
      req.body?.ratePerMile !== undefined && req.body?.ratePerMile !== ""
        ? parseFloat(req.body.ratePerMile)
        : defaultMileageRate(tripDate.getFullYear());

    if (isNaN(tripDate.getTime())) return res.status(400).json({ message: "Enter a valid date" });
    if (!(miles > 0) || miles > 5000) return res.status(400).json({ message: "Enter the miles driven" });
    if (!purpose) return res.status(400).json({ message: "Say what the trip was for" });
    if (!(rate >= 0) || rate > 5) return res.status(400).json({ message: "Enter a valid rate per mile" });

    const [trip] = await db
      .insert(mileageTrips)
      .values({
        userId: req.user.claims.sub,
        tripDate,
        miles: miles.toFixed(1),
        purpose,
        route,
        ratePerMile: rate.toFixed(3),
      })
      .returning();
    res.status(201).json(trip);
  });

  app.delete("/api/mileage/:id", requireAuth, async (req: any, res) => {
    const deleted = await db
      .delete(mileageTrips)
      .where(and(eq(mileageTrips.id, req.params.id), eq(mileageTrips.userId, req.user.claims.sub)))
      .returning({ id: mileageTrips.id });
    if (deleted.length === 0) return res.status(404).json({ message: "Trip not found" });
    res.json({ ok: true });
  });

  /* ---------- returns ---------- */

  // Marks a sale as returned. The sale's amounts are zeroed and what the
  // seller lost goes in otherFees (so profit = -loss), which keeps every
  // existing total, report and export correct without special cases.
  app.post("/api/sales/:id/return", requireAuth, checkTrialExpired, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const sale = await storage.getSalesRecord(req.params.id, userId);
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    if (sale.returnedAt) return res.status(400).json({ message: "This sale is already marked as returned" });

    const costsLost = Math.max(0, parseFloat(req.body?.costsLost ?? "0") || 0);
    const backInStock = req.body?.backInStock !== false;
    const note = String(req.body?.note ?? "").trim();
    // If the item didn't come back, what was paid for it is lost too
    const loss = costsLost + (backInStock ? 0 : parseFloat(sale.purchasePrice || "0") || 0);

    const [updated] = await db
      .update(salesRecords)
      .set({
        returnedAt: new Date(),
        returnedSalePrice: sale.salePrice,
        salePrice: "0.00",
        purchasePrice: "0.00",
        platformFee: "0.00",
        shippingCost: "0.00",
        otherFees: money(loss),
        profit: money(-loss),
        salesTaxAmount: sale.salesTaxAmount === null ? null : "0.00",
        notes: [sale.notes, `Returned${note ? `: ${note}` : ""}`].filter(Boolean).join("\n"),
        updatedAt: new Date(),
      })
      .where(and(eq(salesRecords.id, sale.id), eq(salesRecords.userId, userId)))
      .returning();

    if (sale.inventoryItemId) {
      const item = await storage.getInventoryItem(sale.inventoryItemId, userId);
      if (item) {
        await db
          .update(inventoryItems)
          .set(
            backInStock
              ? { status: item.dateListed ? "listed" : "unlisted", soldPrice: null, dateSold: null, updatedAt: new Date() }
              : // Gone for good: its cost is now part of the return's loss
                { status: "returned", archived: true, updatedAt: new Date() },
          )
          .where(and(eq(inventoryItems.id, item.id), eq(inventoryItems.userId, userId)));
      }
    }

    res.json(updated);
  });

  /* ---------- money tied up in inventory ---------- */

  app.get("/api/inventory/capital", requireAuth, async (req: any, res) => {
    const items = await db
      .select()
      .from(inventoryItems)
      .where(and(eq(inventoryItems.userId, req.user.claims.sub), eq(inventoryItems.archived, false)));

    // Items with a sale recorded against them count as sold even if their
    // status was never switched to "sold"
    const soldIds = new Set(
      (await storage.getSalesRecords(req.user.claims.sub))
        .filter((s) => s.inventoryItemId && !s.returnedAt)
        .map((s) => s.inventoryItemId!),
    );

    const now = Date.now();
    const buckets = [
      { label: "Under 30 days", max: 30, cost: 0, count: 0 },
      { label: "30–60 days", max: 60, cost: 0, count: 0 },
      { label: "60–90 days", max: 90, cost: 0, count: 0 },
      { label: "90+ days", max: Infinity, cost: 0, count: 0 },
    ];
    let cost = 0;
    let listedValue = 0;
    let count = 0;

    for (const item of items) {
      if (item.status === "sold" || soldIds.has(item.id)) continue;
      const qty = Math.max(1, item.quantity ?? 1);
      const itemCost = (parseFloat(item.purchasePrice || "0") || 0) * qty;
      const days = Math.floor((now - new Date(item.dateAcquired).getTime()) / 86_400_000);
      const bucket = buckets.find((b) => days < b.max)!;
      bucket.cost += itemCost;
      bucket.count += qty;
      cost += itemCost;
      listedValue += (parseFloat(item.listedPrice || "0") || 0) * qty;
      count += qty;
    }

    res.json({
      cost: money(cost),
      listedValue: money(listedValue),
      potentialProfit: money(listedValue - cost),
      items: count,
      buckets: buckets.map((b) => ({ label: b.label, cost: money(b.cost), items: b.count })),
    });
  });
}
