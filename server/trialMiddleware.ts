import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

// Check if user's trial has expired
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

  // Check if trial has expired
  if (userData.subscriptionTier === 'trial' && userData.trialEndsAt) {
    const now = new Date();
    const trialEnd = new Date(userData.trialEndsAt);
    
    if (now > trialEnd) {
      return res.status(402).json({ 
        message: "Trial expired", 
        trialExpired: true,
        trialEndedAt: userData.trialEndsAt
      });
    }
  }

  next();
};

// Get remaining trial days
export function getRemainingTrialDays(trialEndsAt: Date | null): number {
  if (!trialEndsAt) return 0;
  
  const now = new Date();
  const trialEnd = new Date(trialEndsAt);
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}