import type { Express, RequestHandler } from "express";
import { randomBytes } from "crypto";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "./db";
import { users, teamInvites, type User } from "@shared/schema";
import { ENTERPRISE_TEAM_SEATS } from "@shared/plans";

/*
 * Enterprise team access.
 *
 * A teammate is a normal user whose team_owner_id points at an Enterprise
 * owner. While the owner is on Enterprise, requireAuth makes the teammate's
 * requests act on the owner's account (claims.sub = owner id), so inventory,
 * sales, expenses, reminders and plan limits are all shared. Billing and team
 * management stay with the owner.
 */

export type TeamRole = "owner" | "member" | null;

export interface ResolvedAccount {
  user: User;
  /** The account whose data this user works on. */
  accountId: string;
  teamRole: TeamRole;
  owner?: User;
}

async function findUser(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function resolveAccount(userId: string): Promise<ResolvedAccount | null> {
  const user = await findUser(userId);
  if (!user) return null;

  if (user.teamOwnerId) {
    const owner = await findUser(user.teamOwnerId);
    // Membership only counts while the owner is on Enterprise
    if (owner && owner.subscriptionTier === "enterprise") {
      return { user, accountId: owner.id, teamRole: "member", owner };
    }
  }

  return {
    user,
    accountId: user.id,
    teamRole: user.subscriptionTier === "enterprise" ? "owner" : null,
  };
}

/** Rejects teammates from owner-only actions such as billing. */
export const requireAccountOwner: RequestHandler = (req: any, res, next) => {
  if (req.user?.claims?.teamRole === "member") {
    return res.status(403).json({ message: "Only the account owner can do this" });
  }
  next();
};

async function listMembers(ownerId: string) {
  return db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      joinedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.teamOwnerId, ownerId));
}

async function listPendingInvites(ownerId: string) {
  return db
    .select()
    .from(teamInvites)
    .where(and(eq(teamInvites.ownerId, ownerId), isNull(teamInvites.acceptedAt)));
}

const displayName = (u: Pick<User, "firstName" | "lastName" | "email">) =>
  [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "ProfitPad user";

export function registerTeamRoutes(app: Express, requireAuth: RequestHandler) {
  // Team overview: members and pending invites for owners, the owner for members
  app.get("/api/team", requireAuth, async (req: any, res) => {
    try {
      const account = await resolveAccount(req.user.claims.userId);
      if (!account) return res.status(401).json({ message: "Unauthorized" });

      if (account.teamRole === "member") {
        return res.json({
          role: "member",
          owner: { name: displayName(account.owner!), email: account.owner!.email },
        });
      }

      const [members, invites] = await Promise.all([
        listMembers(account.user.id),
        listPendingInvites(account.user.id),
      ]);
      res.json({
        role: account.teamRole,
        canManage: account.teamRole === "owner",
        seats: ENTERPRISE_TEAM_SEATS,
        members,
        invites: invites.map(({ id, email, token, createdAt }) => ({ id, email, token, createdAt })),
      });
    } catch (error) {
      console.error("Error loading team:", error);
      res.status(500).json({ message: "Failed to load team" });
    }
  });

  // Owner invites a teammate by email; returns a link to share with them
  app.post("/api/team/invites", requireAuth, requireAccountOwner, async (req: any, res) => {
    try {
      const account = await resolveAccount(req.user.claims.userId);
      if (!account || account.teamRole !== "owner") {
        return res.status(403).json({ message: "Team access is part of the Enterprise plan" });
      }

      const email = String(req.body?.email ?? "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: "Enter a valid email address" });
      }
      if (email === account.user.email?.toLowerCase()) {
        return res.status(400).json({ message: "You're already the owner of this account" });
      }

      const [members, invites] = await Promise.all([
        listMembers(account.user.id),
        listPendingInvites(account.user.id),
      ]);
      if (members.some((m) => m.email?.toLowerCase() === email)) {
        return res.status(409).json({ message: "That person is already on your team" });
      }
      const existing = invites.find((i) => i.email === email);
      if (existing) {
        return res.json({ id: existing.id, email, token: existing.token, createdAt: existing.createdAt });
      }
      if (members.length + invites.length >= ENTERPRISE_TEAM_SEATS) {
        return res.status(403).json({
          message: `Enterprise includes ${ENTERPRISE_TEAM_SEATS} teammates. Remove someone or cancel an invite first.`,
        });
      }

      const [invite] = await db
        .insert(teamInvites)
        .values({ ownerId: account.user.id, email, token: randomBytes(24).toString("base64url") })
        .returning();
      res.status(201).json({ id: invite.id, email, token: invite.token, createdAt: invite.createdAt });
    } catch (error) {
      console.error("Error creating invite:", error);
      res.status(500).json({ message: "Failed to create invite" });
    }
  });

  // Owner cancels a pending invite
  app.delete("/api/team/invites/:id", requireAuth, requireAccountOwner, async (req: any, res) => {
    try {
      await db
        .delete(teamInvites)
        .where(
          and(
            eq(teamInvites.id, req.params.id),
            eq(teamInvites.ownerId, req.user.claims.userId),
            isNull(teamInvites.acceptedAt),
          ),
        );
      res.json({ success: true });
    } catch (error) {
      console.error("Error cancelling invite:", error);
      res.status(500).json({ message: "Failed to cancel invite" });
    }
  });

  // Owner removes a teammate
  app.delete("/api/team/members/:id", requireAuth, requireAccountOwner, async (req: any, res) => {
    try {
      await db
        .update(users)
        .set({ teamOwnerId: null, updatedAt: new Date() })
        .where(and(eq(users.id, req.params.id), eq(users.teamOwnerId, req.user.claims.userId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing teammate:", error);
      res.status(500).json({ message: "Failed to remove teammate" });
    }
  });

  // Teammate leaves the team and goes back to their own account
  app.post("/api/team/leave", requireAuth, async (req: any, res) => {
    try {
      await db
        .update(users)
        .set({ teamOwnerId: null, updatedAt: new Date() })
        .where(eq(users.id, req.user.claims.userId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error leaving team:", error);
      res.status(500).json({ message: "Failed to leave team" });
    }
  });

  // Invite details for the join page
  app.get("/api/team/join/:token", requireAuth, async (req: any, res) => {
    try {
      const [invite] = await db.select().from(teamInvites).where(eq(teamInvites.token, req.params.token));
      if (!invite || invite.acceptedAt) {
        return res.status(404).json({ message: "This invite link is no longer valid" });
      }
      const owner = await findUser(invite.ownerId);
      const me = await findUser(req.user.claims.userId);
      res.json({
        ownerName: owner ? displayName(owner) : "a ProfitPad owner",
        email: invite.email,
        emailMatches: me?.email?.toLowerCase() === invite.email,
        ownerActive: owner?.subscriptionTier === "enterprise",
      });
    } catch (error) {
      console.error("Error loading invite:", error);
      res.status(500).json({ message: "Failed to load invite" });
    }
  });

  // Accept an invite. Only the invited email can use the link.
  app.post("/api/team/join/:token", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.userId;
      const [invite] = await db.select().from(teamInvites).where(eq(teamInvites.token, req.params.token));
      if (!invite || invite.acceptedAt) {
        return res.status(404).json({ message: "This invite link is no longer valid" });
      }

      const me = await findUser(userId);
      if (!me || me.email?.toLowerCase() !== invite.email) {
        return res.status(403).json({
          message: `This invite is for ${invite.email}. Sign in with that email to accept it.`,
        });
      }
      if (invite.ownerId === me.id) {
        return res.status(400).json({ message: "You can't join your own team" });
      }

      const owner = await findUser(invite.ownerId);
      if (!owner || owner.subscriptionTier !== "enterprise") {
        return res.status(403).json({ message: "This team is no longer on the Enterprise plan" });
      }

      const [{ memberCount }] = await db
        .select({ memberCount: sql<number>`count(*)::int` })
        .from(users)
        .where(eq(users.teamOwnerId, me.id));
      if (memberCount > 0) {
        return res.status(409).json({
          message: "You have teammates on your own account. Remove them before joining another team.",
        });
      }

      await db.update(users).set({ teamOwnerId: owner.id, updatedAt: new Date() }).where(eq(users.id, me.id));
      await db
        .update(teamInvites)
        .set({ acceptedAt: new Date(), acceptedBy: me.id })
        .where(eq(teamInvites.id, invite.id));

      res.json({ success: true, ownerName: displayName(owner) });
    } catch (error) {
      console.error("Error accepting invite:", error);
      res.status(500).json({ message: "Failed to join team" });
    }
  });
}
