import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Star, Crown, Building2, Calendar, CreditCard } from "lucide-react";
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
    price: "$9.99",
    period: "/month",
    description: "Perfect for small businesses getting started",
    features: [
      "Up to 100 inventory items",
      "Complete sales tracking", 
      "Essential analytics",
      "Task reminders",
      "CSV import/export",
      "Basic support"
    ],
    icon: Star,
    popular: false,
    color: "blue"
  },
  {
    id: "professional", 
    name: "Professional",
    price: "$19.99",
    period: "/month",
    description: "Advanced features for growing businesses",
    features: [
      "Unlimited inventory items",
      "Unlimited sales tracking",
      "Advanced analytics & reports", 
      "Unlimited reminders",
      "Multi-platform integration",
      "Barcode scanning",
      "Priority support"
    ],
    icon: Crown,
    popular: true,
    color: "purple"
  },
  {
    id: "enterprise",
    name: "Enterprise", 
    price: "$49.99",
    period: "/month",
    description: "Full-featured solution for large operations",
    features: [
      "Everything in Professional",
      "Team access & collaboration",
      "API integrations", 
      "Custom reporting",
      "Dedicated account manager",
      "Phone support",
      "Custom integrations"
    ],
    icon: Building2,
    popular: false,
    color: "gold"
  }
];

export default function Billing() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPayPalDialog, setShowPayPalDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  });

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      const amount = plan.price.replace('$', '');
      setPaymentAmount(amount);
      setShowPayPalDialog(true);
    }
  };

  const getTrialStatus = () => {
    if (!user?.trialEndsAt) return null;
    
    const trialEnd = new Date(user.trialEndsAt);
    const now = new Date();
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      active: daysLeft > 0,
      daysLeft: Math.max(0, daysLeft),
      expired: daysLeft <= 0
    };
  };

  const trialStatus = getTrialStatus();
  const currentPlan = user?.subscriptionTier || "starter";
  const isAdmin = user?.isAdmin;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Billing & Plans" subtitle="Manage your subscription and billing preferences" />
        
        <div className="flex-1 overflow-y-auto p-6" style={{ paddingBottom: '150px' }}>
          {/* Current Plan Status */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {isAdmin ? (
                      <Badge className="bg-purple-600 text-white">
                        Admin Account - Full Access
                      </Badge>
                    ) : (
                      <>
                        <Badge variant="outline" className="text-sm">
                          {currentPlan === "professional" ? "Professional Plan" : 
                           currentPlan === "enterprise" ? "Enterprise Plan" : 
                           currentPlan === "starter" ? "Starter Plan" : "Starter Plan"}
                        </Badge>
                        {trialStatus?.active && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Trial Active - {trialStatus.daysLeft} days left
                          </Badge>
                        )}
                        {trialStatus?.expired && (
                          <Badge variant="destructive">
                            Trial Expired
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    {isAdmin 
                      ? "Admin accounts have unlimited access to all features without subscription restrictions."
                      : trialStatus?.active 
                      ? `Your trial ends on ${new Date(user?.trialEndsAt!).toLocaleDateString()}`
                      : trialStatus?.expired
                      ? "Your trial has expired. Please select a plan to continue using ProfitPad."
                      : "Thank you for being a ProfitPad subscriber!"}
                  </p>
                </div>
                {trialStatus?.active && (
                  <div className="flex items-center text-blue-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{trialStatus.daysLeft} days remaining</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Plan Selection */}
          <div className="mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Plan</h2>
              <p className="text-slate-600">Select the perfect plan for your business needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const isCurrentPlan = currentPlan === plan.id;
                
                return (
                  <Card 
                    key={plan.id} 
                    className={`relative ${plan.popular ? 'ring-2 ring-purple-500' : ''} ${isCurrentPlan ? 'bg-emerald-50 border-emerald-200' : ''} transition-all hover:shadow-lg`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-purple-500 text-white">Most Popular</Badge>
                      </div>
                    )}
                    
                    {isCurrentPlan && (
                      <div className="absolute -top-3 right-4">
                        <Badge className="bg-emerald-500 text-white">Current Plan</Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <div className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                        plan.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        plan.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        <span className="text-slate-500">{plan.period}</span>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-slate-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button 
                        className="w-full" 
                        variant={isCurrentPlan ? "secondary" : plan.popular ? "default" : "outline"}
                        onClick={() => handlePlanSelect(plan.id)}
                        disabled={isCurrentPlan}
                      >
                        {isCurrentPlan ? "Current Plan" : `Choose ${plan.name}`}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Management</CardTitle>
              <CardDescription>
                Secure payments processed through PayPal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Payment Information</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    All payments are securely processed through PayPal. You can pay with:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                    <li>PayPal account balance</li>
                    <li>Credit or debit card (via PayPal)</li>
                    <li>Bank account (via PayPal)</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Need Help?</p>
                    <p className="text-sm text-slate-600">Contact our support team for billing questions or plan guidance</p>
                  </div>
                  <Button variant="outline">
                    Contact Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* PayPal Payment Dialog */}
      <Dialog open={showPayPalDialog} onOpenChange={setShowPayPalDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Subscribe to {plans.find(p => p.id === selectedPlan)?.name} for ${paymentAmount}/month
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="text-center mb-4">
              <p className="text-2xl font-bold text-slate-900">${paymentAmount}</p>
              <p className="text-sm text-slate-600">per month</p>
            </div>
            <PayPalButton 
              amount={paymentAmount}
              currency="USD"
              intent="CAPTURE"
            />
            <p className="text-xs text-slate-500 text-center mt-2">
              Payments are securely processed through PayPal. Your subscription will renew monthly.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}