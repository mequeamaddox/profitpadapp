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
