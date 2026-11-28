import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

// Adding data needs an active paid plan. There's no free trial: the "trial"
// tier is what new accounts have before they pick a plan.
export const checkTrialExpired = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  
  if (!user || !user.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userData = await storage.getUser(user.claims.sub);
  
  if (!userData) {
    return res.status(401).json({ message: "User not found" });
  }

  // Admin users bypass all subscription checks
  if (userData.isAdmin) {
    return next();
  }

  if (!userData.subscriptionTier || userData.subscriptionTier === 'trial') {
    return res.status(402).json({
      message: "Choose a plan to continue",
      needsPlan: true,
    });
  }

  // Check if a paid plan has run out (null expiry = no expiry)
  if (userData.subscriptionTier !== 'trial' && userData.planExpiresAt) {
    if (new Date() > new Date(userData.planExpiresAt)) {
      return res.status(402).json({
        message: "Plan expired",
        planExpired: true,
        planExpiredAt: userData.planExpiresAt
      });
    }
  }

  next();
};
