import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Package, DollarSign, Bell, Target, TrendingUp } from "lucide-react";

export default function Landing() {
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
          <Button onClick={() => window.location.href = "/api/login"}>
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Maximize Your Business <span className="text-primary">Profitability</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Track inventory, record sales, and analyze your business performance with powerful analytics. 
            Make data-driven decisions to grow your profit margins.
          </p>
          <Button 
            size="lg" 
            className="px-8 py-4 text-lg"
            onClick={() => window.location.href = "/api/login"}
          >
            Get Started Free
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Package className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Track your products with SKU management, condition tracking, and multi-platform support.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <DollarSign className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Sales Tracking</CardTitle>
              <CardDescription>
                Record sales with detailed profit calculations including fees, shipping, and platform costs.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Visualize your performance with real-time metrics, charts, and profitability insights.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Bell className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Smart Reminders</CardTitle>
              <CardDescription>
                Never miss important tasks with intelligent reminders linked to your inventory and sales.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Target className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Goal Tracking</CardTitle>
              <CardDescription>
                Set monthly profit goals and track your progress with visual indicators and reports.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <CardTitle>CSV Import/Export</CardTitle>
              <CardDescription>
                Easily import existing data and export reports for accounting and analysis purposes.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Pricing Tiers */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-xl text-slate-600">
              Start free and scale with your business success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Starter</CardTitle>
                <div className="text-4xl font-bold text-slate-900">Free</div>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Up to 50 inventory items</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Basic sales tracking</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Essential analytics dashboard</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Task reminders</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>CSV import/export</li>
                </ul>
                <Button 
                  className="w-full mt-6"
                  onClick={() => window.location.href = "/api/login"}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Professional Tier */}
            <Card className="relative border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Professional</CardTitle>
                <div className="text-4xl font-bold text-slate-900">$9.99<span className="text-base font-normal text-slate-500">/month</span></div>
                <CardDescription>For growing businesses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Unlimited inventory items</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Advanced profit analytics</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Multi-platform integration</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Smart profit insights</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Priority support</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Custom reporting</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Goal tracking & alerts</li>
                </ul>
                <Button 
                  className="w-full mt-6"
                  onClick={() => window.location.href = "/api/login"}
                >
                  Start Professional Trial
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Tier */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="text-4xl font-bold text-slate-900">$29.99<span className="text-base font-normal text-slate-500">/month</span></div>
                <CardDescription>For serious entrepreneurs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Everything in Professional</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Multi-user team access</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Advanced automation</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>API integrations</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>White-label reporting</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Dedicated account manager</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Custom integrations</li>
                </ul>
                <Button 
                  variant="outline"
                  className="w-full mt-6"
                  onClick={() => window.location.href = "/api/login"}
                >
                  Start Enterprise Trial
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-sm border">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to boost your profits?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join thousands of entrepreneurs who use ProfitPad to optimize their business performance.
          </p>
          <Button 
            size="lg" 
            className="px-8 py-4 text-lg"
            onClick={() => window.location.href = "/api/login"}
          >
            Start Your Free Trial
          </Button>
        </div>
      </main>
    </div>
  );
}
