import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CreditCard } from "lucide-react";

interface TrialExpiredPromptProps {
  trialEndedAt?: string | null;
}

export default function TrialExpiredPrompt({ trialEndedAt }: TrialExpiredPromptProps) {
  const handleUpgradeClick = () => {
    // In a real application, this would navigate to the billing page
    window.location.href = "/settings";
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <CardTitle className="text-xl">Trial Expired</CardTitle>
          <p className="text-gray-600 mt-2">
            Your 3-day trial has ended. Please upgrade to continue using all features.
          </p>
          {trialEndedAt && (
            <p className="text-sm text-gray-500 mt-1">
              Trial ended: {new Date(trialEndedAt).toLocaleDateString()}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleUpgradeClick}
            className="w-full"
            size="lg"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Continue tracking your business with full access to inventory, sales, expenses, and advanced analytics.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}