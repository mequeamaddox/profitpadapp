import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Package, DollarSign, Bell, Settings as SettingsIcon, TrendingUp } from "lucide-react";

export default function Help() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
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
      icon: TrendingUp,
      title: "Reports & Analytics",
      description: "Understand your business performance",
      topics: [
        "Reading dashboard metrics",
        "Understanding profit vs revenue",
        "Monthly goal tracking",
        "Revenue trend analysis",
        "Inventory performance insights"
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

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Header title="Help Center" subtitle="Get help and learn how to make the most of ProfitPad." />
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Welcome Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-6 w-6 mr-2 text-primary" />
                Welcome to ProfitPad Help
              </CardTitle>
              <CardDescription>
                Find answers to common questions and learn how to optimize your business with ProfitPad.
                If you need additional support, contact our team at support@profitpad.com
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
          <Card className="mt-8">
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
                      <h4 className="font-medium">Export Data Regularly</h4>
                      <p className="text-sm text-slate-600">
                        Export your sales data monthly for accounting and tax preparation purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
