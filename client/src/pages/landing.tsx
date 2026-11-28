import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Package, DollarSign, Bell, Target, TrendingUp, CheckCircle2, Star, Upload, Calculator, LineChart } from "lucide-react";
import { PLANS, PeriodToggle, PlanCard } from "@/components/billing/plans";
import { ENTERPRISE_TEAM_SEATS, MONEY_BACK_DAYS, SUPPORT_EMAIL, type BillingPeriod } from "@shared/plans";
import { PublicHeader, PublicFooter } from "@/components/layout/public-layout";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

const FAQS: { q: string; a: string }[] = [
  {
    q: "Is there a free trial?",
    a: `No. Instead, every plan has a ${MONEY_BACK_DAYS}-day money-back guarantee: if ProfitPad isn't right for you, email ${SUPPORT_EMAIL} within ${MONEY_BACK_DAYS} days of your first payment for a full refund.`,
  },
  {
    q: "How do I pay? Do I need a PayPal account?",
    a: "You pay at checkout through PayPal, using your PayPal account or a debit or credit card. In most countries you can pay by card without creating a PayPal account. ProfitPad never sees your card details.",
  },
  {
    q: "Will I be charged automatically? How do I cancel?",
    a: "Plans never renew automatically. A monthly payment covers 30 days and a yearly payment covers a full year. When it's up, you choose whether to renew, so there's nothing to cancel and no surprise charges.",
  },
  {
    q: "What happens to my data if my plan ends?",
    a: "It stays in your account. You can still sign in and see everything; you'll just need to renew before adding new items, sales or expenses.",
  },
  {
    q: "Which marketplaces does it work with?",
    a: "Any of them. Tag each item and sale with eBay, Poshmark, Mercari, Depop, Etsy, Amazon, Facebook Marketplace, StockX, Shopify and more, or as a direct sale. Each sale's fees and shipping come off its profit, and the Profit Estimator knows typical fee rates for the big marketplaces.",
  },
  {
    q: "Can I import my existing inventory?",
    a: "Yes. On the Professional and Enterprise plans you can import a CSV from a spreadsheet. Columns like title, sku, cost, price, platform, condition, category and quantity are picked up automatically.",
  },
  {
    q: "Can my team use it?",
    a: `Yes, with Enterprise. The account owner can invite up to ${ENTERPRISE_TEAM_SEATS} teammates who share the same inventory, sales and expenses. The owner manages billing and who's on the team.`,
  },
  {
    q: "Can I export my data for taxes?",
    a: "Yes. Reports can be exported as CSV files that work with most accounting software, so you're not scrambling at tax time.",
  },
];

export default function Landing() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // /pricing, /faq and /#pricing style links land on the right section
  useEffect(() => {
    const fromPath = window.location.pathname.replace(/^\//, "");
    const id = window.location.hash.slice(1) || (["pricing", "faq", "features"].includes(fromPath) ? fromPath : "");
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PublicHeader />

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
            onClick={() => window.location.href = "/register"}
            data-testid="button-get-started-hero"
          >
            Start Tracking Your Profit →
          </Button>
          <p className="text-sm text-slate-500 mt-4">Plans from $9.99/mo • {MONEY_BACK_DAYS}-day money-back guarantee • Pay with PayPal or card</p>
        </div>

        {/* Why resellers use ProfitPad */}
        <div className="mb-20 bg-white rounded-2xl p-8 shadow-sm border">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Made for the way resellers work</h3>
            <p className="text-slate-600">Everything you track in a spreadsheet, without the spreadsheet</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: DollarSign,
                title: "Real profit per sale",
                body: "Fees, shipping and your cost come out of every sale automatically, so you see what you actually made.",
              },
              {
                icon: Package,
                title: "Inventory & pallets",
                body: "Track every item from purchase to sale, scan barcodes, and spread pallet costs across what's inside.",
              },
              {
                icon: Target,
                title: "Goals & expenses",
                body: "Set a monthly profit goal, log expenses with receipt photos, and watch your progress on one dashboard.",
              },
            ].map((item) => (
              <Card key={item.title} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-semibold text-slate-900 mb-1">{item.title}</p>
                  <p className="text-slate-600 text-sm">{item.body}</p>
                </CardContent>
              </Card>
            ))}
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
                  Add items by hand, scan a barcode, or import a CSV. Quick and easy setup.
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
        <div className="mb-20 scroll-mt-24" id="features">
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
        <div className="mb-20 scroll-mt-24" id="pricing">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600">
              Less than the cost of one flip mistake per month
            </p>
          </div>

          <div className="mb-8 text-center">
            <PeriodToggle value={period} onChange={setPeriod} />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                period={period}
                onSelect={() => (window.location.href = `/register?plan=${plan.id}&period=${period}`)}
                actionLabel={`Start with ${plan.name}`}
              />
            ))}
          </div>
          <p className="text-center text-slate-600 mt-8">
            Pay with PayPal or a debit/credit card. Plans never renew automatically. Every plan is backed by a{" "}
            <a href="/refund-policy" className="font-medium text-primary hover:underline">{MONEY_BACK_DAYS}-day money-back guarantee</a>.
          </p>
        </div>

        {/* FAQ */}
        <div className="mb-20 scroll-mt-24" id="faq">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Questions, answered</h2>
            <p className="text-xl text-slate-600">
              Anything else? Email <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">{SUPPORT_EMAIL}</a>
            </p>
          </div>
          <div className="mx-auto max-w-3xl divide-y divide-border rounded-2xl border border-border bg-card shadow-card">
            {FAQS.map((item, i) => (
              <Collapsible key={item.q} open={openFaq === i} onOpenChange={(o) => setOpenFaq(o ? i : null)}>
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold">
                  {item.q}
                  <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-5 pb-5 text-slate-600">{item.a}</CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl p-12 shadow-xl">
          <h2 className="text-4xl font-bold mb-4">
            Stop Guessing. Start Growing.
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Take control of your profits with ProfitPad
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            onClick={() => window.location.href = "/register"}
            data-testid="button-get-started-footer"
          >
            Start Tracking Your Profit →
          </Button>
          <p className="text-sm mt-4 opacity-75">{MONEY_BACK_DAYS}-day money-back guarantee • Set up in under a minute</p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
