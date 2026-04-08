import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, RequestHandler } from "express";
import { pool } from "./db";
import { storage } from "./storage";

const PgSession = connectPg(session);

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}

const SESSION_COOKIE_NAME = "profitpad.sid";

export function setupSession(app: Express) {
  app.set("trust proxy", 1);

  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "sessions",
        createTableIfMissing: true,
      }),
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      name: SESSION_COOKIE_NAME,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    }),
  );
}

function sanitizeUser(user: any) {
  if (!user) return null;

  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export const requireAuth: RequestHandler = async (req: any, res, next) => {
  const userId = req.session?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = {
    claims: {
      sub: userId,
    },
  };

  next();
};

export async function registerHandler(req: any, res: any) {
  try {
    const { email, password, firstName, lastName } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await storage.getUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({
        message: "An account with that email already exists",
      });
    }

    const passwordHash = await hashPassword(String(password));

    const user = await storage.createLocalUser({
      email: normalizedEmail,
      passwordHash,
      authProvider: "local",
      firstName: firstName || null,
      lastName: lastName || null,
      subscriptionTier: "trial",
    });

    req.session.userId = user.id;

    return res.status(201).json(sanitizeUser(user));
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: "Failed to register user",
    });
  }
}

export async function loginHandler(req: any, res: any) {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await storage.getUserByEmail(normalizedEmail);
    if (!user || !user.passwordHash) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isValid = await verifyPassword(String(password), user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    req.session.userId = user.id;
    await storage.updateUserLoginMetadata(user.id);

    const freshUser = await storage.getUser(user.id);

    return res.json(sanitizeUser(freshUser));
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Failed to login",
    });
  }
}

export async function logoutHandler(req: any, res: any) {
  try {
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Logout session destroy error:", err);
        return res.status(500).json({
          message: "Failed to logout",
        });
      }

      res.clearCookie(SESSION_COOKIE_NAME);
      return res.json({ success: true });
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Failed to logout",
    });
  }
}

export async function currentUserHandler(req: any, res: any) {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.json(sanitizeUser(user));
  } catch (error) {
    console.error("Current user error:", error);
    return res.status(500).json({
      message: "Failed to load current user",
    });
  }
}