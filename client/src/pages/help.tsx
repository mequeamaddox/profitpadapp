import { useEffect, useState } from "react";
import { useAuthContext } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BookOpen, Package, DollarSign, Bell, Settings as SettingsIcon, TrendingUp, Search, ChevronDown, ChevronRight, Receipt, BarChart3, Camera, HelpCircle, MessageSquare, Mail, ExternalLink } from "lucide-react";

export default function Help() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

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

  const helpSections = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn the basics of ProfitPad and set up your account",
      topics: [
        "Creating your first inventory item",
        "Recording your first sale",
        "Understanding the dashboard",
        "Setting up monthly goals"
      ]
    },
    {
      icon: Package,
      title: "Inventory Management",
      description: "Master your inventory tracking and organization",
      topics: [
        "Adding products with SKUs and categories",
        "Uploading and managing product images",
        "Organizing items by platform and condition",
        "Using tags for better organization",
        "Archiving and managing old inventory"
      ]
    },
    {
      icon: DollarSign,
      title: "Sales Tracking",
      description: "Record and analyze your sales performance",
      topics: [
        "Recording sales with accurate pricing",
        "Tracking platform fees and shipping costs",
        "Linking sales to inventory items",
        "Understanding profit calculations",
        "Exporting sales data for taxes"
      ]
    },
    {
      icon: Receipt,
      title: "Expense Tracking",
      description: "Manage business expenses with tax handling",
      topics: [
        "Recording business expenses accurately",
        "Understanding tax-inclusive vs exclusive",
        "Categorizing expenses for better organization",
        "Setting up tax deductible expenses",
        "Exporting expense reports for taxes"
      ]
    },
    {
      icon: Bell,
      title: "Reminders & Tasks",
      description: "Stay organized with smart reminders",
      topics: [
        "Creating task reminders",
        "Linking reminders to inventory items",
        "Setting due dates and priorities",
        "Managing overdue tasks",
        "Using snooze functionality"
      ]
    },
    {
      icon: BarChart3,
      title: "Advanced Reports",
      description: "Generate insights from your business data",
      topics: [
        "Understanding revenue vs profit metrics",
        "Platform performance comparison",
        "Monthly trend analysis",
        "Inventory turnover reports",
        "Tax reporting and export features"
      ]
    },
    {
      icon: Camera,
      title: "Barcode Scanner",
      description: "Streamline inventory with barcode scanning",
      topics: [
        "Using the camera to scan barcodes",
        "Adding barcodes to inventory items",
        "Searching inventory by barcode",
        "Troubleshooting camera permissions",
        "Supported barcode formats"
      ]
    },
    {
      icon: SettingsIcon,
      title: "Settings & Configuration",
      description: "Customize ProfitPad for your business",
      topics: [
        "Setting monthly profit goals",
        "Managing account preferences",
        "Understanding plan features",
        "Team management (Premium)",
        "Data export and backup"
      ]
    }
  ];

  const faqItems = [
    {
      question: "How do I calculate accurate profit margins?",
      answer: "To calculate accurate profit margins, make sure to include ALL costs: item cost, platform fees (eBay, Amazon, etc.), shipping costs, payment processing fees, and any other expenses. ProfitPad automatically calculates your profit margin as (Sale Price - Total Costs) / Sale Price × 100."
    },
    {
      question: "What's the difference between revenue and profit?",
      answer: "Revenue is the total amount you receive from sales (sale price × quantity). Profit is what you keep after subtracting all costs (revenue - costs). Focus on profit margins rather than just revenue for business health."
    },
    {
      question: "How do I set up barcode scanning?",
      answer: "Click the barcode icon in any inventory form. Allow camera permissions when prompted. Point your camera at the barcode and wait for it to scan. The barcode will be automatically added to your item."
    },
    {
      question: "Can I export my data for taxes?",
      answer: "Yes! Go to Reports > Export and choose your date range. You can export sales, expenses, and inventory data as CSV files. This data is formatted to work with most accounting software."
    },
    {
      question: "How do I handle returns and refunds?",
      answer: "Create a new sale entry with a negative amount for the refund. Make sure to link it to the original inventory item to maintain accurate profit tracking."
    },
    {
      question: "What happens when my trial expires?",
      answer: "After your 3-day trial, you'll need to subscribe to continue using ProfitPad. Your data remains safe and you can immediately access it once you subscribe to the Professional or Enterprise plan."
    },
    {
      question: "How do I track expenses for tax purposes?",
      answer: "Use the Expenses section to record all business-related costs. Categorize them properly and mark tax-deductible expenses. You can export expense reports for your accountant or tax software."
    },
    {
      question: "Can I manage multiple selling platforms?",
      answer: "Absolutely! ProfitPad supports tracking inventory and sales across eBay, Amazon, Mercari, Facebook Marketplace, and more. Use the platform field to organize your multi-channel business."
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Help Center" subtitle="Get help and learn how to make the most of ProfitPad." />
        
        <div className="flex-1 overflow-y-auto p-6" style={{ paddingBottom: '150px' }}>
          {/* Search Bar */}
          <div className="relative mb-6">
            <Input
              type="text"
              placeholder="Search help topics, FAQs, and guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 w-full"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-4 w-full mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="guides">Guides</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Welcome Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-6 w-6 mr-2 text-primary" />
                    Welcome to ProfitPad Help
                  </CardTitle>
                  <CardDescription>
                    Find answers to common questions and learn how to optimize your business with ProfitPad.
                    Select a category below or search for specific topics.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Help Sections Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {helpSections.map((section, index) => (
                  <Card key={index} className="h-fit">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <section.icon className="h-5 w-5 mr-2 text-primary" />
                        {section.title}
                      </CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {section.topics.map((topic, topicIndex) => (
                          <div key={topicIndex} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                            {topic}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Tips for Success</CardTitle>
                  <CardDescription>
                    Expert tips to maximize your profitability with ProfitPad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Badge className="mt-1">Tip 1</Badge>
                        <div>
                          <h4 className="font-medium">Track All Costs</h4>
                          <p className="text-sm text-slate-600">
                            Include platform fees, shipping, and any other costs to get accurate profit calculations.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Badge className="mt-1">Tip 2</Badge>
                        <div>
                          <h4 className="font-medium">Use Consistent SKUs</h4>
                          <p className="text-sm text-slate-600">
                            Develop a consistent SKU naming system to easily track and find your inventory.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Badge className="mt-1">Tip 3</Badge>
                        <div>
                          <h4 className="font-medium">Set Realistic Goals</h4>
                          <p className="text-sm text-slate-600">
                            Start with achievable monthly goals and increase them as your business grows.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Badge className="mt-1">Tip 4</Badge>
                        <div>
                          <h4 className="font-medium">Regular Data Review</h4>
                          <p className="text-sm text-slate-600">
                            Check your dashboard weekly to identify trends and optimization opportunities.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Badge className="mt-1">Tip 5</Badge>
                        <div>
                          <h4 className="font-medium">Use Reminders</h4>
                          <p className="text-sm text-slate-600">
                            Set reminders for listing renewals, price updates, and inventory restocking.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Badge className="mt-1">Tip 6</Badge>
                        <div>
                          <h4 className="font-medium">Export Regularly</h4>
                          <p className="text-sm text-slate-600">
                            Export your data monthly for backup and tax preparation purposes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guides" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {helpSections.map((section, index) => (
                  <Card key={index} className="h-fit">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <section.icon className="h-5 w-5 mr-2 text-primary" />
                        {section.title}
                      </CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {section.topics.map((topic, topicIndex) => (
                          <div key={topicIndex} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                            {topic}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="faq" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="h-6 w-6 mr-2 text-primary" />
                    Frequently Asked Questions
                  </CardTitle>
                  <CardDescription>
                    Find quick answers to the most common questions about ProfitPad.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredFAQ.map((faq, index) => (
                      <Collapsible 
                        key={index}
                        open={openFAQ === index}
                        onOpenChange={() => setOpenFAQ(openFAQ === index ? null : index)}
                      >
                        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:bg-slate-50">
                          <span className="font-medium">{faq.question}</span>
                          {openFAQ === index ? (
                            <ChevronDown className="h-4 w-4 shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 py-3 text-sm text-slate-600 bg-slate-50 rounded-b-lg">
                          {faq.answer}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="h-6 w-6 mr-2 text-primary" />
                      Contact Support
                    </CardTitle>
                    <CardDescription>
                      Get help from our support team
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="font-medium">Email Support</p>
                        <p className="text-sm text-slate-600">support@profitpad.com</p>
                        <p className="text-xs text-slate-500">Response within 24 hours</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="font-medium">Live Chat</p>
                        <p className="text-sm text-slate-600">Available 9AM-6PM EST</p>
                        <p className="text-xs text-slate-500">Monday through Friday</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ExternalLink className="h-6 w-6 mr-2 text-primary" />
                      Additional Resources
                    </CardTitle>
                    <CardDescription>
                      More ways to get help and stay updated
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Video Tutorials
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Community Forum
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Feature Requests
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>System Status & Updates</CardTitle>
                  <CardDescription>
                    Stay informed about system status and new features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">All Systems Operational</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm">Latest Version: 2.1.0</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span className="text-sm">Last Update: Jan 2025</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}