import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Home, Package, DollarSign, Bell, Settings, HelpCircle, FileText, Receipt, Calculator, LogOut, Search } from "lucide-react";
import { User, Reminder } from "@shared/schema";

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  
  const { data: overdueReminders = [] } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders?overdue=true"],
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home, current: location === "/" },
    { name: "Inventory", href: "/inventory", icon: Package, current: location === "/inventory" },
    { name: "Sales", href: "/sales", icon: DollarSign, current: location === "/sales" },
    { name: "Expenses", href: "/expenses", icon: Receipt, current: location === "/expenses" },
    { 
      name: "Reminders", 
      href: "/reminders", 
      icon: Bell, 
      current: location === "/reminders",
      badge: overdueReminders?.length > 0 ? overdueReminders.length : null
    },
    { name: "Reports", href: "/reports", icon: FileText, current: location === "/reports" },
    { name: "Research", href: "/research", icon: Search, current: location === "/research" },
    { name: "Profit Estimator", href: "/profit-estimator", icon: Calculator, current: location === "/profit-estimator" },
    { name: "Settings", href: "/settings", icon: Settings, current: location === "/settings" },
    { name: "Help Center", href: "/help", icon: HelpCircle, current: location === "/help" },
  ];

  return (
    <aside className="hidden w-64 bg-gradient-to-b from-background via-background to-muted/20 shadow-premium-lg border-r border-border/60 flex-col">
      {/* Logo & Branding */}
      <div className="p-6 border-b border-border/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg animate-glow">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl text-foreground">ProfitPad</span>
            <span className="text-xs text-muted-foreground font-medium">Retail Intelligence</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item, index) => (
          <Button
            key={item.name}
            variant={item.current ? "default" : "ghost"}
            className={cn(
              "w-full justify-start rounded-xl font-medium transition-all duration-300 group animate-slideInRight",
              item.current 
                ? "btn-premium text-white shadow-lg hover:shadow-xl" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:shadow-md hover-lift"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => setLocation(item.href)}
          >
            <item.icon className={cn(
              "h-5 w-5 mr-3 transition-transform duration-300",
              item.current ? "text-white" : "group-hover:scale-110"
            )} />
            {item.name}
            {item.badge && (
              <Badge className="ml-auto bg-destructive hover:bg-destructive text-white shadow-sm animate-pulse">
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </nav>

      {/* User Profile & Plan Badge */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3 mb-3">
          {user?.profileImageUrl && (
            <img
              src={user.profileImageUrl}
              alt="User Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email || 'User'}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-2">
          <Button
            variant="ghost" 
            className="w-full justify-start text-xs p-2 h-auto"
            onClick={() => setLocation("/billing")}
          >
            {user?.isAdmin ? (
              <Badge className="bg-purple-600 text-white mr-2">
                Admin
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 mr-2">
                {user?.subscriptionTier === "professional" ? "Professional Plan" : 
                 user?.subscriptionTier === "enterprise" ? "Enterprise Plan" : 
                 user?.subscriptionTier === "starter" ? "Starter Plan" : 
                 user?.trialEndsAt ? "Trial Active" : "Starter Plan"}
              </Badge>
            )}
            <span className="text-xs text-slate-500">Manage Plan</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/logout")}
            className="w-full justify-start text-slate-500 hover:text-slate-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="text-sm">Sign Out</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
