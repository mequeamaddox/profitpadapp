import { useState } from "react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Zap, TrendingUp, Crown } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limitType: 'inventory' | 'sales' | 'reminders';
  currentTier: string;
  currentCount: number;
  limit: number;
}

const TIER_INFO = {
  trial: {
    name: "Trial",
    price: "Free",
    color: "bg-slate-500",
    icon: AlertCircle
  },
  starter: {
    name: "Starter",
    price: "$9.99",
    color: "bg-blue-500",
    icon: Zap
  },
  professional: {
    name: "Professional",
    price: "$19.99",
    color: "bg-purple-500",
    icon: TrendingUp
  },
  enterprise: {
    name: "Enterprise",
    price: "$49.99",
    color: "bg-amber-500",
    icon: Crown
  }
};

const LIMIT_LABELS = {
  inventory: "inventory items",
  sales: "sales records",
  reminders: "reminders"
};

export function UpgradeModal({
  open,
  onOpenChange,
  limitType,
  currentTier,
  currentCount,
  limit
}: UpgradeModalProps) {
  const limitLabel = LIMIT_LABELS[limitType];
  const tierInfo = TIER_INFO[currentTier as keyof typeof TIER_INFO] || TIER_INFO.trial;
  const TierIcon = tierInfo.icon;

  const getRecommendedTier = () => {
    if (currentTier === 'trial' || currentTier === 'starter') {
      return 'professional';
    }
    return 'enterprise';
  };

  const recommendedTier = getRecommendedTier();
  const recommendedTierInfo = TIER_INFO[recommendedTier as keyof typeof TIER_INFO];
  const RecommendedIcon = recommendedTierInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-upgrade">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-10 h-10 ${tierInfo.color} rounded-lg flex items-center justify-center`}>
              <TierIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Limit Reached</DialogTitle>
              <Badge variant="outline" className="mt-1">
                {tierInfo.name} Plan
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-base">
            You've reached your limit of <strong>{limit} {limitLabel}</strong>.
            <div className="mt-2 p-3 bg-slate-100 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Current usage:</span>
                <span className="font-semibold">{currentCount} / {limit}</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 ${recommendedTierInfo.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <RecommendedIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-slate-900">Upgrade to {recommendedTierInfo.name}</h4>
                {recommendedTierInfo.price && (
                  <Badge className="bg-emerald-500">{recommendedTierInfo.price}/mo</Badge>
                )}
              </div>
              <p className="text-sm text-slate-600">
                {recommendedTier === 'professional' ? (
                  <>Get up to <strong>500 {limitLabel}</strong> plus advanced analytics and CSV exports</>
                ) : (
                  <>Get <strong>unlimited {limitLabel}</strong> and all premium features</>
                )}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel"
          >
            Maybe Later
          </Button>
          <Link href="/billing">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" data-testid="button-upgrade">
              View Plans
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
