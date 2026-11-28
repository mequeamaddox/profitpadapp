import crypto from "crypto";
import type { Express, RequestHandler } from "express";
import { and, eq, isNull, lt, or, sql } from "drizzle-orm";
import { db } from "./db";
import { storage } from "./storage";
import { expenses, recurringExpenses, users, type RecurringExpense, type User } from "@shared/schema";
import { SUPPORT_EMAIL } from "@shared/plans";
import { appUrl, emailEnabled, escapeHtml, sendEmail } from "./email";

/* ---------- shared helpers ---------- */

/** Same rule as checkTrialExpired: admins, or a paid plan that hasn't run out. */
export function canAddData(user: Pick<User, "isAdmin" | "subscriptionTier" | "planExpiresAt">, now = new Date()) {
  if (user.isAdmin) return true;
  if (!user.subscriptionTier || user.subscriptionTier === "trial") return false;
  return !user.planExpiresAt || new Date(user.planExpiresAt) > now;
}

const monthKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

function nextMonthKey(key: string) {
  const [y, m] = key.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

/** The date in month `key` for a given day of month, clamped to the month's last day. */
function dayInMonth(key: string, day: number) {
  const [y, m] = key.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return new Date(Date.UTC(y, m - 1, Math.min(day, last), 12));
}

const money = (n: number) =>
  `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ---------- recurring expenses ---------- */

/** Called after an expense is created with "repeat every month" on. */
export async function createRecurringFromExpense(
  userId: string,
  expense: { title: string; amount: string; category: string; vendor?: string | null; deductible?: boolean | null; expenseDate?: Date | null },
) {
  const date = expense.expenseDate ? new Date(expense.expenseDate) : new Date();
  const [row] = await db
    .insert(recurringExpenses)
    .values({
      userId,
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      vendor: expense.vendor || null,
      deductible: expense.deductible ?? true,
      dayOfMonth: date.getUTCDate(),
      // The expense just saved covers this month
      lastLoggedMonth: monthKey(date),
    })
    .returning();
  return row;
}

/** Logs every recurring expense that has come due. Safe to run any number of times. */
export async function runRecurringExpenses(now = new Date()) {
  const current = monthKey(now);
  const rows = await db.select().from(recurringExpenses);
  let logged = 0;
  const owners = new Map<string, User | undefined>();

  for (const row of rows) {
    let month = row.lastLoggedMonth;
    // Catch up on missed months (e.g. after a plan lapsed), at most a year back
    for (let i = 0; i < 12; i++) {
      const due = nextMonthKey(month);
      if (due > current) break;
      const date = dayInMonth(due, row.dayOfMonth);
      if (date > now) break;

      if (!owners.has(row.userId)) owners.set(row.userId, await storage.getUser(row.userId));
      const owner = owners.get(row.userId);
      if (!owner || !canAddData(owner, now)) break; // picked up again once they renew

      // Claim this month first so two runs can never log it twice
      const claimed = await db
        .update(recurringExpenses)
        .set({ lastLoggedMonth: due })
        .where(and(eq(recurringExpenses.id, row.id), eq(recurringExpenses.lastLoggedMonth, month)))
        .returning({ id: recurringExpenses.id });
      if (claimed.length === 0) break;

      await db.insert(expenses).values({
        userId: row.userId,
        title: row.title,
        amount: row.amount,
        category: row.category,
        vendor: row.vendor,
        deductible: row.deductible,
        expenseDate: date,
        description: "Logged automatically: repeats every month",
        tags: ["recurring"],
      });
      logged++;
      month = due;
    }
  }
  return logged;
}

/* ---------- weekly summary email ---------- */

const DIGEST_HOUR_UTC = 13; // Monday ~8-9am US Eastern
const STALE_DAYS = 60;

/** Monday 00:00 UTC of the week containing `now`. */
function weekStartUtc(now: Date) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dow = (d.getUTCDay() + 6) % 7; // Monday = 0
  d.setUTCDate(d.getUTCDate() - dow);
  return d;
}

function unsubscribeToken(userId: string) {
  return crypto.createHmac("sha256", process.env.SESSION_SECRET || "").update(`weekly:${userId}`).digest("base64url");
}

export interface WeeklySummary {
  firstName: string | null;
  weekLabel: string;
  sales: number;
  revenue: number;
  profit: number;
  prevProfit: number;
  bestSale: { title: string; profit: number; platform: string | null } | null;
  expensesTotal: number;
  monthProfit: number;
  monthlyGoal: number;
  monthPace: number | null; // projected month-end profit at the current rate
  staleCount: number;
  staleItems: { title: string; days: number; price: number }[];
}

export async function buildWeeklySummary(user: User, now = new Date()): Promise<WeeklySummary> {
  const weekEnd = weekStartUtc(now);
  const weekStart = new Date(weekEnd.getTime() - 7 * 86_400_000);
  const prevStart = new Date(weekStart.getTime() - 7 * 86_400_000);
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();

  const sales = await storage.getSalesRecords(user.id);
  const inRange = (d: Date | string, a: Date, b: Date) => {
    const t = new Date(d).getTime();
    return t >= a.getTime() && t < b.getTime();
  };
  const week = sales.filter((s) => inRange(s.saleDate, weekStart, weekEnd));
  const prev = sales.filter((s) => inRange(s.saleDate, prevStart, weekStart));
  const month = sales.filter((s) => inRange(s.saleDate, monthStart, new Date(now.getTime() + 1)));
  const sum = (list: typeof sales, f: (s: (typeof sales)[number]) => string | null) =>
    list.reduce((t, s) => t + (parseFloat(f(s) || "0") || 0), 0);

  const best = [...week].sort((a, b) => parseFloat(b.profit) - parseFloat(a.profit))[0];

  const allExpenses = await storage.getExpenses(user.id);
  const expensesTotal = allExpenses
    .filter((e) => e.expenseDate && inRange(e.expenseDate, weekStart, weekEnd))
    .reduce((t, e) => t + (parseFloat(e.amount) || 0), 0);

  const stale = (await storage.getStaleInventoryAnalysis(user.id)).filter(
    (i: any) => i.daysListed >= STALE_DAYS && i.status !== "sold",
  );

  const monthProfit = sum(month, (s) => s.profit);
  const dayOfMonth = now.getUTCDate();
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

  return {
    firstName: user.firstName,
    weekLabel: `${fmt(weekStart)} – ${fmt(new Date(weekEnd.getTime() - 86_400_000))}`,
    sales: week.filter((s) => !s.returnedAt).length,
    revenue: sum(week, (s) => s.salePrice),
    profit: sum(week, (s) => s.profit),
    prevProfit: sum(prev, (s) => s.profit),
    bestSale: best ? { title: best.itemTitle, profit: parseFloat(best.profit), platform: best.platform } : null,
    expensesTotal,
    monthProfit,
    monthlyGoal: parseFloat(user.monthlyGoal || "0") || 0,
    monthPace: dayOfMonth >= 3 ? (monthProfit / dayOfMonth) * daysInMonth : null,
    staleCount: stale.length,
    staleItems: stale.slice(0, 3).map((i: any) => ({
      title: i.title,
      days: i.daysListed,
      price: parseFloat(i.listedPrice || i.purchasePrice || "0") || 0,
    })),
  };
}

export function renderWeeklyEmail(s: WeeklySummary, links: { app: string; unsubscribe: string }) {
  const change = s.profit - s.prevProfit;
  const changeText =
    s.prevProfit === 0 && s.profit === 0
      ? ""
      : change >= 0
        ? `up ${money(change)} from the week before`
        : `down ${money(-change)} from the week before`;
  const goalPct = s.monthlyGoal > 0 ? Math.round((s.monthProfit / s.monthlyGoal) * 100) : null;
  const onPace = s.monthlyGoal > 0 && s.monthPace !== null ? s.monthPace >= s.monthlyGoal : null;

  const lines: string[] = [];
  lines.push(`Hi ${s.firstName || "there"}, here's your ProfitPad week (${s.weekLabel}).`, "");
  lines.push(
    s.sales > 0
      ? `Profit: ${money(s.profit)} from ${s.sales} sale${s.sales === 1 ? "" : "s"} (${money(s.revenue)} in sales)${changeText ? `, ${changeText}` : ""}.`
      : `No sales recorded last week.${s.prevProfit > 0 ? ` The week before you made ${money(s.prevProfit)}.` : ""}`,
  );
  if (s.bestSale) lines.push(`Best flip: ${s.bestSale.title} (${money(s.bestSale.profit)} profit${s.bestSale.platform ? ` on ${s.bestSale.platform}` : ""}).`);
  if (s.expensesTotal > 0) lines.push(`Expenses logged: ${money(s.expensesTotal)}.`);
  if (goalPct !== null) {
    lines.push(
      `Monthly goal: ${money(s.monthProfit)} of ${money(s.monthlyGoal)} (${goalPct}%)` +
        (onPace === null ? "." : onPace ? ", on pace to hit it." : `, on pace for about ${money(s.monthPace!)}.`),
    );
  } else {
    lines.push(`Profit so far this month: ${money(s.monthProfit)}. Set a monthly goal in Settings to track your pace.`);
  }
  if (s.staleCount > 0) {
    lines.push("", `${s.staleCount} item${s.staleCount === 1 ? " has" : "s have"} been sitting ${STALE_DAYS}+ days. Consider repricing or moving to another platform:`);
    for (const i of s.staleItems) lines.push(`  - ${i.title} (${i.days} days${i.price ? `, ${money(i.price)}` : ""})`);
  }
  lines.push("", `Open ProfitPad: ${links.app}`, "", `Don't want these? Turn them off: ${links.unsubscribe}`);

  const stat = (label: string, value: string, sub = "") => `
    <td style="padding:14px 16px;background:#f1f5f4;border-radius:12px;width:50%;vertical-align:top">
      <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;font-weight:600">${label}</div>
      <div style="font-size:24px;font-weight:800;color:#0f172a;margin-top:4px">${value}</div>
      ${sub ? `<div style="font-size:13px;color:#64748b;margin-top:2px">${sub}</div>` : ""}
    </td>`;

  const staleHtml =
    s.staleCount > 0
      ? `<div style="margin-top:24px;padding:16px;border:1px solid #fde68a;background:#fffbeb;border-radius:12px">
          <div style="font-weight:700">${s.staleCount} item${s.staleCount === 1 ? "" : "s"} sitting ${STALE_DAYS}+ days</div>
          <div style="font-size:14px;color:#64748b;margin:4px 0 8px">Consider a price drop or listing on another platform.</div>
          ${s.staleItems
            .map(
              (i) =>
                `<div style="font-size:14px;padding:4px 0">${escapeHtml(i.title)} <span style="color:#64748b">· ${i.days} days${i.price ? ` · ${money(i.price)}` : ""}</span></div>`,
            )
            .join("")}
        </div>`
      : "";

  const goalHtml =
    goalPct !== null
      ? `<div style="margin-top:24px">
          <div style="display:flex;justify-content:space-between;font-size:14px"><b>Monthly goal</b></div>
          <div style="font-size:14px;color:#334155;margin:4px 0 8px">${money(s.monthProfit)} of ${money(s.monthlyGoal)} · ${goalPct}%${
            onPace === null ? "" : onPace ? " · on pace" : ` · on pace for ~${money(s.monthPace!)}`
          }</div>
          <div style="height:10px;background:#e2e8f0;border-radius:99px;overflow:hidden">
            <div style="height:10px;width:${Math.min(100, Math.max(0, goalPct))}%;background:#059669"></div>
          </div>
        </div>`
      : "";

  const html = `
  <div style="background:#f8fafc;padding:24px 12px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0f172a">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:28px;border:1px solid #e2e8f0">
      <div style="font-weight:800;font-size:18px;color:#047857">ProfitPad</div>
      <h1 style="font-size:22px;margin:16px 0 4px">Your week: ${s.weekLabel}</h1>
      <p style="margin:0 0 20px;color:#64748b">Hi ${escapeHtml(s.firstName || "there")}, here's how the business did.</p>
      <table role="presentation" style="width:100%;border-spacing:8px;margin:0 -8px"><tr>
        ${stat("Profit", money(s.profit), changeText)}
        ${stat("Sales", String(s.sales), s.sales ? `${money(s.revenue)} revenue` : "")}
      </tr></table>
      ${
        s.bestSale
          ? `<p style="margin:16px 0 0;font-size:14px">🏆 Best flip: <b>${escapeHtml(s.bestSale.title)}</b>, ${money(s.bestSale.profit)} profit${s.bestSale.platform ? ` on ${escapeHtml(s.bestSale.platform)}` : ""}</p>`
          : ""
      }
      ${s.expensesTotal > 0 ? `<p style="margin:8px 0 0;font-size:14px;color:#334155">Expenses logged: ${money(s.expensesTotal)}</p>` : ""}
      ${goalHtml}
      ${staleHtml}
      <p style="margin:28px 0 0"><a href="${links.app}" style="background:#059669;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Open ProfitPad</a></p>
    </div>
    <p style="max-width:520px;margin:16px auto 0;font-size:12px;color:#94a3b8;text-align:center">
      You get this every Monday. <a href="${links.unsubscribe}" style="color:#94a3b8">Turn off weekly emails</a> · Questions? ${SUPPORT_EMAIL}
    </p>
  </div>`;

  return { subject: `Your ProfitPad week: ${money(s.profit)} profit`, text: lines.join("\n"), html };
}

/** Sends this week's summary to everyone due one. Safe to run any number of times. */
export async function runWeeklyDigests(now = new Date()) {
  if (!emailEnabled()) return 0;
  // Mondays from 13:00 UTC; anyone missed (e.g. during a deploy) is picked up later that week
  const weekStart = weekStartUtc(now);
  if (now.getTime() < weekStart.getTime() + DIGEST_HOUR_UTC * 3_600_000) return 0;

  const candidates = await db
    .select()
    .from(users)
    .where(
      and(
        isNull(users.teamOwnerId),
        sql`${users.email} IS NOT NULL`,
        lt(users.createdAt, weekStart),
        or(isNull(users.weeklyDigestSentAt), lt(users.weeklyDigestSentAt, weekStart)),
      ),
    );

  let sent = 0;
  for (const user of candidates) {
    if (!canAddData(user, now)) continue;
    const settings = await storage.getNotificationSettings(user.id);
    if (settings && settings.weeklyReport === false) continue;

    const claimed = await db
      .update(users)
      .set({ weeklyDigestSentAt: now })
      .where(and(eq(users.id, user.id), or(isNull(users.weeklyDigestSentAt), lt(users.weeklyDigestSentAt, weekStart))))
      .returning({ id: users.id });
    if (claimed.length === 0) continue;

    try {
      const summary = await buildWeeklySummary(user, now);
      // Nothing to say: no sales in two weeks and nothing going stale
      if (summary.sales === 0 && summary.prevProfit === 0 && summary.staleCount === 0) continue;
      const base = appUrl();
      const unsubscribe = `${base}/api/email/unsubscribe?u=${encodeURIComponent(user.id)}&t=${unsubscribeToken(user.id)}`;
      const email = renderWeeklyEmail(summary, { app: base, unsubscribe });
      await sendEmail({
        to: user.email!,
        ...email,
        headers: { "List-Unsubscribe": `<${unsubscribe}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
      });
      sent++;
    } catch (error) {
      console.error(`Weekly summary failed for ${user.id}:`, (error as Error)?.message);
    }
  }
  if (sent) console.log(`Sent ${sent} weekly summary email(s)`);
  return sent;
}

/* ---------- scheduler & routes ---------- */

export function startAutomations() {
  const tick = async () => {
    try {
      const logged = await runRecurringExpenses();
      if (logged) console.log(`Logged ${logged} recurring expense(s)`);
    } catch (error) {
      console.error("Recurring expenses run failed:", (error as Error)?.message);
    }
    try {
      await runWeeklyDigests();
    } catch (error) {
      console.error("Weekly summary run failed:", (error as Error)?.message);
    }
  };
  setTimeout(tick, 60_000);
  setInterval(tick, 15 * 60_000);
}

export function registerAutomationRoutes(app: Express, requireAuth: RequestHandler, requireAccountOwner: RequestHandler) {
  app.get("/api/recurring-expenses", requireAuth, async (req: any, res) => {
    const rows: RecurringExpense[] = await db
      .select()
      .from(recurringExpenses)
      .where(eq(recurringExpenses.userId, req.user.claims.sub));
    res.json(rows);
  });

  app.delete("/api/recurring-expenses/:id", requireAuth, async (req: any, res) => {
    const deleted = await db
      .delete(recurringExpenses)
      .where(and(eq(recurringExpenses.id, req.params.id), eq(recurringExpenses.userId, req.user.claims.sub)))
      .returning({ id: recurringExpenses.id });
    if (deleted.length === 0) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  });

  // Preview of this week's summary email, for the signed-in owner
  app.get("/api/weekly-summary/preview", requireAuth, requireAccountOwner, async (req: any, res) => {
    const user = await storage.getUser(req.user.claims.sub);
    if (!user) return res.status(404).end();
    const summary = await buildWeeklySummary(user);
    const email = renderWeeklyEmail(summary, { app: appUrl(), unsubscribe: "#" });
    res.type("html").send(email.html);
  });

  const unsubscribe = async (req: any, res: any) => {
    const userId = String(req.query.u ?? "");
    const token = String(req.query.t ?? "");
    const expected = unsubscribeToken(userId);
    const ok =
      userId &&
      token.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected)) &&
      (await storage.getUser(userId));
    if (!ok) return res.status(400).type("html").send("<p>This unsubscribe link isn't valid.</p>");
    await storage.upsertNotificationSettings({ userId, weeklyReport: false });
    res
      .type("html")
      .send(
        `<div style="font-family:system-ui,sans-serif;max-width:420px;margin:80px auto;text-align:center;color:#0f172a">
          <h2>You're unsubscribed</h2>
          <p style="color:#64748b">You won't get ProfitPad's weekly summary any more. You can turn it back on any time under Reminders → Notification settings.</p>
          <p><a href="/" style="color:#059669;font-weight:600">Back to ProfitPad</a></p>
        </div>`,
      );
  };
  app.get("/api/email/unsubscribe", unsubscribe);
  app.post("/api/email/unsubscribe", unsubscribe); // one-click unsubscribe from mail apps
}
