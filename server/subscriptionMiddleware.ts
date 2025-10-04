import { storage } from "./storage";
import { getSubscriptionLimits, canPerformAction } from "./subscriptionLimits";

export function checkSubscriptionLimit(
  limitType: 'inventoryLimit' | 'salesLimit' | 'remindersLimit'
) {
  return async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const userData = await storage.getUser(userId);

      if (!userData) {
        return res.status(401).json({ message: "User not found" });
      }

      if (userData.isAdmin) {
        return next();
      }

      const tier = userData.subscriptionTier || 'trial';
      
      let currentCount = 0;
      switch (limitType) {
        case 'inventoryLimit':
          const inventory = await storage.getInventoryByUserId(userId);
          currentCount = inventory.length;
          break;
        case 'salesLimit':
          const sales = await storage.getSalesByUserId(userId);
          currentCount = sales.length;
          break;
        case 'remindersLimit':
          currentCount = await storage.getRemindersCount(userId);
          break;
      }

      const canProceed = canPerformAction(tier, limitType, currentCount);

      if (!canProceed) {
        const limits = getSubscriptionLimits(tier);
        const limit = limits[limitType];
        return res.status(403).json({
          message: `You have reached your ${limitType.replace('Limit', '')} limit`,
          limit: limit,
          current: currentCount,
          tier: tier,
          upgradeRequired: true
        });
      }

      next();
    } catch (error) {
      console.error("Subscription limit check error:", error);
      return res.status(500).json({ message: "Failed to check subscription limits" });
    }
  };
}
