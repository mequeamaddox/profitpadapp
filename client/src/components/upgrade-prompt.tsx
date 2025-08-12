import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Zap, Users, X } from "lucide-react";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: string;
  feature: string;
  limit?: number;
}

export default function UpgradePrompt({ isOpen, onClose, currentTier, feature, limit }: UpgradePromptProps) {
  if (!isOpen) return null;

  const getPricingInfo = () => {
    if (currentTier === 'starter') {
      return {
        nextTier: 'Professional',
        price: '$19.99/month',
        icon: <Zap className="h-6 w-6 text-yellow-600" />,
        benefits: [
          'Unlimited inventory items',
          'Advanced profit analytics',
          'Multi-platform integration',
          'Smart profit insights',
          'Priority support',
          'Custom reporting'
        ]
      };
    } else if (currentTier === 'professional') {
      return {
        nextTier: 'Enterprise',
        price: '$49.99/month',
        icon: <Crown className="h-6 w-6 text-purple-600" />,
        benefits: [
          'Multi-user team access',
          'Advanced automation',
          'API integrations',
          'White-label reporting',
          'Dedicated account manager',
          'Custom integrations'
        ]
      };
    }
    return null;
  };

  const pricingInfo = getPricingInfo();
  if (!pricingInfo) return null;

  const limitMessage = limit 
    ? `Your ${currentTier} plan allows ${limit} ${feature}. You've reached this limit.`
    : `This feature is not available on your ${currentTier} plan.`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-lg w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {pricingInfo.icon}
              <CardTitle className="text-xl">Upgrade Required</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">{limitMessage}</p>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{pricingInfo.nextTier}</h3>
              <span className="text-2xl font-bold text-primary">{pricingInfo.price}</span>
            </div>
            
            <ul className="space-y-2">
              {pricingInfo.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button 
              onClick={() => {
                // In a real app, this would redirect to billing/upgrade flow
                alert(`Upgrade to ${pricingInfo.nextTier} coming soon! Contact support for early access.`);
                onClose();
              }}
              className="flex-1"
            >
              Upgrade Now
            </Button>
            <Button variant="outline" onClick={onClose}>
              Maybe Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}