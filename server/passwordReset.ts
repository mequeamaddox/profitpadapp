import crypto from "crypto";
import type { Express } from "express";
import { and, eq, isNull } from "drizzle-orm";
import { db, pool } from "./db";
import { passwordResetTokens, users } from "@shared/schema";
import { storage } from "./storage";
import { hashPassword } from "./auth";
import { SUPPORT_EMAIL } from "@shared/plans";
import { appUrl, emailEnabled, sendEmail } from "./email";

const RESET_TTL_MS = 60 * 60 * 1000; // links work for 1 hour
const MIN_PASSWORD = 8;

// At most one reset email per address every 2 minutes.
const lastSent = new Map<string, number>();
const RESEND_GAP_MS = 2 * 60 * 1000;

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const passwordResetEmailEnabled = emailEnabled;

async function sendResetEmail(to: string, link: string) {
  await sendEmail({
      to,
      subject: "Reset your ProfitPad password",
      text:
        `Someone (hopefully you) asked to reset the password for your ProfitPad account.\n\n` +
        `Choose a new password here (the link works for 1 hour):\n${link}\n\n` +
        `If you didn't ask for this, you can ignore this email; your password won't change.\n\n` +
        `Questions? Reply to this email or write to ${SUPPORT_EMAIL}.`,
      html: `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;color:#0f172a">
          <h2 style="margin:0 0 12px">Reset your ProfitPad password</h2>
          <p>Someone (hopefully you) asked to reset the password for your ProfitPad account.</p>
          <p style="margin:24px 0">
            <a href="${link}" style="background:#059669;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Choose a new password</a>
          </p>
          <p style="color:#64748b;font-size:14px">This link works for 1 hour. If you didn't ask for this, ignore this email; your password won't change.</p>
          <p style="color:#64748b;font-size:14px">Questions? Write to <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
        </div>`,
  });
}

export function registerPasswordResetRoutes(app: Express) {
  app.get("/api/auth/password-reset-available", (_req, res) => {
    res.json({ available: passwordResetEmailEnabled(), supportEmail: SUPPORT_EMAIL });
  });

  // Always answers the same way, so it can't be used to find out who has an account.
  app.post("/api/auth/forgot-password", async (req, res) => {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    if (!passwordResetEmailEnabled()) {
      return res.status(503).json({ message: `Email ${SUPPORT_EMAIL} and we'll help you get back in.` });
    }
    // Answer first so response time doesn't reveal whether the account exists.
    res.json({ ok: true });

    const last = lastSent.get(email) ?? 0;
    if (!email || Date.now() - last < RESEND_GAP_MS) return;
    lastSent.set(email, Date.now());
    try {
      const user = await storage.getUserByEmail(email);
      if (user?.passwordHash) {
        const token = crypto.randomBytes(32).toString("base64url");
        await db.insert(passwordResetTokens).values({
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + RESET_TTL_MS),
        });
        // Never build this link from the request's Host header: a forged
        // header would send the token to someone else's site.
        const origin = appUrl(`${req.protocol}://${req.get("host")}`);
        await sendResetEmail(user.email!, `${origin}/reset-password?token=${token}`);
      }
    } catch (error) {
      console.error("Forgot password failed:", (error as Error)?.message);
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const token = String(req.body?.token ?? "");
    const password = String(req.body?.password ?? "");
    if (password.length < MIN_PASSWORD) {
      return res.status(400).json({ message: `Use at least ${MIN_PASSWORD} characters.` });
    }
    try {
      const [row] = await db
        .select()
        .from(passwordResetTokens)
        .where(and(eq(passwordResetTokens.tokenHash, hashToken(token)), isNull(passwordResetTokens.usedAt)));
      if (!row || row.expiresAt.getTime() < Date.now()) {
        return res.status(400).json({ message: "This reset link has expired or was already used. Request a new one." });
      }

      const passwordHash = await hashPassword(password);
      await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, row.userId));
      // Use up this link and any others sent to the same account.
      await db
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(and(eq(passwordResetTokens.userId, row.userId), isNull(passwordResetTokens.usedAt)));
      // Sign the account out everywhere, in case someone else had the old password.
      await pool.query(`DELETE FROM sessions WHERE sess->>'userId' = $1`, [row.userId]);

      res.json({ ok: true });
    } catch (error) {
      console.error("Reset password failed:", (error as Error)?.message);
      res.status(500).json({ message: "Couldn't reset your password. Please try again." });
    }
  });
}
