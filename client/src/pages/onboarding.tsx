import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, CheckCircle2, Star, Crown, Building2, Loader2 } from "lucide-react";
import type { User } from "@shared/schema";
import PayPalButton from "@/components/PayPalButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "9.99",
    period: "/month",
    description: "Perfect for getting started",
    features: [
      "Up to 100 inventory items",
      "Up to 100 sales records",
      "Basic profit analytics",
      "Task reminders",
      "3-day free trial"
    ],
    icon: Star,
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: "19.99",
    period: "/month",
    description: "For growing businesses",
    features: [
      "Up to 500 inventory items",
      "Up to 500 sales records",
      "Advanced profit analytics",
      "CSV import/export",
      "Priority support",
      "Custom reporting"
    ],
    icon: Crown,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "49.99",
    period: "/month",
    description: "For serious entrepreneurs",
    features: [
      "Unlimited everything",
      "Multi-user team access",
      "API integrations",
      "White-label reporting",
      "Dedicated account manager",
      "Custom integrations"
    ],
    icon: Building2,
    popular: false,
  }
];

export default function Onboarding() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>("professional");
  const [showPayPalDialog, setShowPayPalDialog] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const updateSubscriptionMutation = useMutation({
    mutationFn: async (tier: string) => {
      return await apiRequest("POST", "/api/subscription/activate", { tier });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setPaymentCompleted(true);
      toast({
        title: "Subscription Activated!",
        description: "Your subscription has been successfully activated.",
      });
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to activate subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinueToPayment = () => {
    setShowPayPalDialog(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayPalDialog(false);
    updateSubscriptionMutation.mutate(selectedPlan);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (paymentCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to ProfitPad!</h2>
            <p className="text-slate-600">Your subscription has been activated. Redirecting to your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="px-6 py-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">ProfitPad</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4">Step 1 of 2</Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Start your 3-day free trial. Your card will be charged ${selectedPlanData?.price} after the trial ends. Cancel anytime for a full refund.
          </p>
        </div>

        {/* Plan Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-primary shadow-xl' : ''
                } ${plan.popular ? 'border-primary border-2' : ''}`}
                onClick={() => handlePlanSelect(plan.id)}
                data-testid={`card-plan-${plan.id}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white">MOST POPULAR</Badge>
                  </div>
                )}
                
                {isSelected && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-500 text-white">Selected</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                    plan.id === 'starter' ? 'bg-blue-100 text-blue-600' :
                    plan.id === 'professional' ? 'bg-purple-100 text-purple-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-slate-500">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Selected Plan Summary */}
        <Card className="max-w-2xl mx-auto mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Selected Plan: {selectedPlanData?.name}</h3>
                <p className="text-slate-600">3-day free trial, then ${selectedPlanData?.price}/month</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">${selectedPlanData?.price}</p>
                <p className="text-sm text-slate-600">per month</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-slate-700 mb-2">💳 <strong>Payment Details:</strong></p>
              <ul className="text-sm text-slate-600 space-y-1 ml-6 list-disc">
                <li>3-day free trial starts today</li>
                <li>Your card will be charged ${selectedPlanData?.price} after 3 days</li>
                <li>Cancel anytime for a full refund if within trial period</li>
                <li>Subscription renews monthly</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="text-center">
          <Button 
            size="lg"
            className="px-12 py-6 text-lg"
            onClick={handleContinueToPayment}
            data-testid="button-continue-payment"
          >
            Continue to Payment →
          </Button>
          <p className="text-sm text-slate-500 mt-4">Secure payment processed by PayPal</p>
        </div>
      </main>

      {/* PayPal Payment Dialog */}
      <Dialog open={showPayPalDialog} onOpenChange={setShowPayPalDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Start your 3-day trial for {selectedPlanData?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="text-center mb-4">
              <p className="text-sm text-slate-600 mb-2">Trial Period: 3 Days Free</p>
              <p className="text-2xl font-bold text-slate-900">${selectedPlanData?.price}</p>
              <p className="text-sm text-slate-600">charged after trial ends</p>
            </div>
            <div className="w-full" data-testid="paypal-button-container">
              <PayPalButton 
                amount={selectedPlanData?.price || "0"}
                currency="USD"
                intent="CAPTURE"
              />
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">
              Your payment information is securely processed by PayPal. You will be charged ${selectedPlanData?.price} after your 3-day trial ends. Cancel anytime for a full refund.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
