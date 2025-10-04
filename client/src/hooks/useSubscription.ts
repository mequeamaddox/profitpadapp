import { useQuery } from "@tanstack/react-query";

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

export interface SubscriptionUsage {
  tier: string;
  limits: SubscriptionLimits;
  usage: {
    inventory: number;
    sales: number;
    reminders: number;
  };
  isAdmin: boolean;
}

export function useSubscription() {
  const { data: subscriptionData, isLoading, error } = useQuery<SubscriptionUsage>({
    queryKey: ["/api/subscription/usage"],
  });

  const canAddInventory = () => {
    if (!subscriptionData) return true;
    if (subscriptionData.isAdmin) return true;
    
    const { inventoryLimit } = subscriptionData.limits;
    const { inventory } = subscriptionData.usage;
    
    if (inventoryLimit === -1) return true;
    return inventory < inventoryLimit;
  };

  const canAddSale = () => {
    if (!subscriptionData) return true;
    if (subscriptionData.isAdmin) return true;
    
    const { salesLimit } = subscriptionData.limits;
    const { sales } = subscriptionData.usage;
    
    if (salesLimit === -1) return true;
    return sales < salesLimit;
  };

  const canAddReminder = () => {
    if (!subscriptionData) return true;
    if (subscriptionData.isAdmin) return true;
    
    const { remindersLimit } = subscriptionData.limits;
    const { reminders } = subscriptionData.usage;
    
    if (remindersLimit === -1) return true;
    return reminders < remindersLimit;
  };

  const hasFeature = (feature: keyof SubscriptionLimits) => {
    if (!subscriptionData) return false;
    if (subscriptionData.isAdmin) return true;
    
    const featureValue = subscriptionData.limits[feature];
    if (typeof featureValue === 'boolean') {
      return featureValue;
    }
    return false;
  };

  const getRemainingCount = (type: 'inventory' | 'sales' | 'reminders') => {
    if (!subscriptionData) return null;
    if (subscriptionData.isAdmin) return -1;
    
    const limitKey = `${type}Limit` as keyof SubscriptionLimits;
    const limit = subscriptionData.limits[limitKey] as number;
    const usage = subscriptionData.usage[type];
    
    if (limit === -1) return -1;
    return Math.max(0, limit - usage);
  };

  return {
    subscriptionData,
    isLoading,
    error,
    canAddInventory,
    canAddSale,
    canAddReminder,
    hasFeature,
    getRemainingCount,
    tier: subscriptionData?.tier || 'trial',
    isAdmin: subscriptionData?.isAdmin || false,
  };
}
