import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  BarChart3, 
  Home, 
  Package, 
  DollarSign, 
  Bell, 
  Settings, 
  HelpCircle, 
  FileText, 
  Receipt, 
  Calculator, 
  Menu,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { User, Reminder } from "@shared/schema";

export default function MobileNav() {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  
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
      badge: overdueReminders.length > 0 ? overdueReminders.length : null
    },
    { name: "Reports", href: "/reports", icon: FileText, current: location === "/reports" },
    { name: "Profit Estimator", href: "/profit-estimator", icon: Calculator, current: location === "/profit-estimator" },
    { name: "Settings", href: "/settings", icon: Settings, current: location === "/settings" },
    { name: "Help Center", href: "/help", icon: HelpCircle, current: location === "/help" },
  ];

  const handleNavClick = (href: string) => {
    setLocation(href);
    setOpen(false);
  };

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex h-full flex-col">
            {/* Logo & Branding */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-900">ProfitPad</span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant={item.current ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    item.current 
                      ? "bg-primary text-white hover:bg-primary/90" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                  onClick={() => handleNavClick(item.href)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                  {item.badge && (
                    <Badge className="ml-auto bg-red-500 hover:bg-red-500 text-white">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </nav>

            {/* User Section */}
            <div className="border-t border-slate-200 p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user?.firstName || "User"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-slate-600 hover:text-slate-900"
                onClick={() => window.location.href = "/api/auth/logout"}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}