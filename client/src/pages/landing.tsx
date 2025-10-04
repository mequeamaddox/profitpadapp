import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Package, DollarSign, Bell, Target, TrendingUp, CheckCircle2, Star, Upload, Calculator, LineChart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const {} = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="px-6 py-4 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">ProfitPad</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-signin-header"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-20">
          <Badge className="mb-6 text-sm px-4 py-1">Built by resellers, for resellers</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Know your <span className="text-primary">REAL profit</span> on every flip<br/>
            <span className="text-3xl md:text-4xl text-slate-600">after fees, shipping & costs</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto">
            ProfitPad replaces messy spreadsheets so you can grow your reselling business with clarity and confidence. 
            Stop guessing—start knowing exactly what you're making.
          </p>
          <Button 
            size="lg" 
            className="px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-start-trial-hero"
          >
            Start Your Free 3-Day Trial →
          </Button>
          <p className="text-sm text-slate-500 mt-4">No credit card required • Cancel anytime</p>
        </div>

        {/* Social Proof */}
        <div className="mb-20 bg-white rounded-2xl p-8 shadow-sm border">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Trusted by resellers nationwide</h3>
            <p className="text-slate-600">See what other sellers are saying</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex mb-3">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </div>
                <p className="text-slate-700 mb-4">"ProfitPad helped me discover I was losing $2 per sale without knowing it. Game changer for my business!"</p>
                <p className="text-sm text-slate-500">- Sarah M., eBay Seller</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex mb-3">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </div>
                <p className="text-slate-700 mb-4">"Finally ditched my spreadsheets! ProfitPad shows me exactly which items are actually profitable."</p>
                <p className="text-sm text-slate-500">- Mike T., Pallet Reseller</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex mb-3">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </div>
                <p className="text-slate-700 mb-4">"The fee calculator alone has saved me hundreds. I know my real margins before I even list!"</p>
                <p className="text-sm text-slate-500">- Jessica L., Amazon FBA</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How ProfitPad Works
            </h2>
            <p className="text-xl text-slate-600">
              Get started in 3 simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-2">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">1</div>
                <CardTitle className="text-xl">Enter Your Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Add items manually or import from your selling platform. Quick and easy setup.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">2</div>
                <CardTitle className="text-xl">Auto-Calculate Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  ProfitPad automatically calculates fees, shipping, and all costs for accurate profit tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LineChart className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">3</div>
                <CardTitle className="text-xl">See True Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  View your real profit and discover what products bring the most money to your pocket.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features as Benefits */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-xl text-slate-600">
              Stop leaving money on the table
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Package className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Never Oversell or Lose Track</CardTitle>
                <CardDescription className="text-base">
                  Manage your inventory across all platforms. Know exactly what you have in stock, where it's listed, and what condition it's in.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-primary mb-4" />
                <CardTitle>See Your REAL Profit After Hidden Costs</CardTitle>
                <CardDescription className="text-base">
                  Track every fee, shipping charge, and expense. No more surprises—know your actual take-home on every sale.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Know What Brings the Most Profit</CardTitle>
                <CardDescription className="text-base">
                  Detailed analytics show which products make you the most money—not just revenue, but actual profit you keep.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Bell className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Never Miss Important Tasks</CardTitle>
                <CardDescription className="text-base">
                  Smart reminders for repricing, relisting, and follow-ups keep your business running smoothly without the mental load.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Hit Your Monthly Goals</CardTitle>
                <CardDescription className="text-base">
                  Set profit targets and track progress in real-time. Stay motivated and focused on growing your business.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Simplify Tax Time & Accounting</CardTitle>
                <CardDescription className="text-base">
                  Export clean reports for your accountant. Track expenses and income all year long—no scrambling at tax time.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="mb-20" id="pricing">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600">
              Less than the cost of one flip mistake per month
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Tier */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Starter</CardTitle>
                <div className="text-4xl font-bold text-slate-900">$9.99<span className="text-base font-normal text-slate-500">/month</span></div>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Up to 100 inventory items</span></li>
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Up to 100 sales records</span></li>
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Basic profit analytics</span></li>
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Task reminders</span></li>
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>3-day free trial</span></li>
                </ul>
                <Button 
                  className="w-full mt-6"
                  variant="outline"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-trial-starter"
                >
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Professional Tier */}
            <Card className="relative border-primary border-2 shadow-xl scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                MOST POPULAR
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-2xl">Professional</CardTitle>
                <div className="text-4xl font-bold text-slate-900">$19.99<span className="text-base font-normal text-slate-500">/month</span></div>
                <CardDescription>For growing businesses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Up to 500 inventory items</span></li>
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Up to 500 sales records</span></li>
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Advanced profit analytics</span></li>
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>CSV import/export reports</span></li>
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Priority support</span></li>
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Custom reporting</span></li>
                </ul>
                <Button 
                  className="w-full mt-6"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-trial-professional"
                >
                  Start Professional Trial →
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Tier */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="text-4xl font-bold text-slate-900">$49.99<span className="text-base font-normal text-slate-500">/month</span></div>
                <CardDescription>For serious entrepreneurs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Unlimited everything</span></li>
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Multi-user team access</span></li>
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>API integrations</span></li>
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>White-label reporting</span></li>
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Dedicated account manager</span></li>
                  <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span>Custom integrations</span></li>
                </ul>
                <Button 
                  variant="outline"
                  className="w-full mt-6"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-trial-enterprise"
                >
                  Start Enterprise Trial
                </Button>
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-slate-600 mt-8">
            💳 Cancel anytime, no credit card traps • All plans include a 3-day free trial
          </p>
        </div>

        {/* Final CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl p-12 shadow-xl">
          <h2 className="text-4xl font-bold mb-4">
            Stop Guessing. Start Growing.
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of resellers who've taken control of their profits with ProfitPad
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-start-trial-footer"
          >
            Start Your Free 3-Day Trial →
          </Button>
          <p className="text-sm mt-4 opacity-75">No credit card required • Takes less than 60 seconds</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-slate-600">
          <p className="text-sm">© 2025 ProfitPad. Built for resellers who want to maximize every flip.</p>
        </div>
      </footer>
    </div>
  );
}
