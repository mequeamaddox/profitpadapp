// Subscription tier limits and feature access control
export interface SubscriptionLimits {
  inventoryLimit: number;
  salesLimit: number;
  remindersLimit: number;
  csvImport: boolean;
  advancedAnalytics: boolean;
  multiPlatform: boolean;
  teamAccess: boolean;
  customReporting: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
}

export const SUBSCRIPTION_LIMITS: Record<string, SubscriptionLimits> = {
  trial: {
    inventoryLimit: -1, // unlimited during trial
    salesLimit: -1, // unlimited during trial
    remindersLimit: -1, // unlimited during trial
    csvImport: true,
    advancedAnalytics: true,
    multiPlatform: true,
    teamAccess: false,
    customReporting: true,
    apiAccess: true,
    prioritySupport: false,
  },
  professional: {
    inventoryLimit: -1, // unlimited
    salesLimit: -1, // unlimited
    remindersLimit: -1, // unlimited
    csvImport: true,
    advancedAnalytics: true,
    multiPlatform: true,
    teamAccess: false,
    customReporting: true,
    apiAccess: true,
    prioritySupport: true,
  },
  enterprise: {
    inventoryLimit: -1, // unlimited
    salesLimit: -1, // unlimited
    remindersLimit: -1, // unlimited
    csvImport: true,
    advancedAnalytics: true,
    multiPlatform: true,
    teamAccess: true,
    customReporting: true,
    apiAccess: true,
    prioritySupport: true,
  },
};

export function getSubscriptionLimits(tier: string): SubscriptionLimits {
  return SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.trial;
}

export function canPerformAction(
  tier: string,
  action: keyof SubscriptionLimits,
  currentCount?: number
): boolean {
  const limits = getSubscriptionLimits(tier);
  const actionLimit = limits[action];
  
  if (typeof actionLimit === 'boolean') {
    return actionLimit;
  }
  
  if (typeof actionLimit === 'number') {
    if (actionLimit === -1) return true; // unlimited
    if (currentCount === undefined) return true;
    return currentCount < actionLimit;
  }
  
  return false;
}