import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Crown, Check } from "lucide-react";

interface TrialExpiredPromptProps {
  isOpen: boolean;
  onClose: () => void;
  trialEndedAt: string;
}

export default function TrialExpiredPrompt({ 
  isOpen, 
  onClose,
  trialEndedAt 
}: TrialExpiredPromptProps) {
  const endDate = new Date(trialEndedAt).toLocaleDateString();

  const handleUpgrade = (tier: 'professional' | 'enterprise') => {
    // In a real app, this would redirect to payment processor
    console.log(`Upgrading to ${tier}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <DialogTitle>Your 3-Day Trial Has Ended</DialogTitle>
          </div>
          <DialogDescription>
            Your trial period ended on {endDate}. Choose a plan to continue using ProfitPad and keep all your data.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 my-6">
          {/* Professional Plan */}
          <div className="border rounded-lg p-6 relative">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Professional</h3>
              <div className="text-3xl font-bold mb-4">
                $19.99
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Unlimited inventory items</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Unlimited sales records</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Unlimited reminders</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Advanced analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Multi-platform integration</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Priority support</span>
              </li>
            </ul>
            
            <Button 
              onClick={() => handleUpgrade('professional')}
              className="w-full"
            >
              Choose Professional
            </Button>
          </div>

          {/* Enterprise Plan */}
          <div className="border rounded-lg p-6 relative border-primary">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Most Popular
              </span>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Enterprise</h3>
              <div className="text-3xl font-bold mb-4">
                $49.99
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Everything in Professional</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Team access & collaboration</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">API integrations</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Custom reporting</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Dedicated support</span>
              </li>
            </ul>
            
            <Button 
              onClick={() => handleUpgrade('enterprise')}
              className="w-full"
            >
              Choose Enterprise
            </Button>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Your data is safely stored and will remain accessible once you upgrade.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}