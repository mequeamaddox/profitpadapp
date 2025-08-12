import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Bell, Plus } from "lucide-react";
import AddMenuModal from "@/components/modals/add-menu-modal";
import { User, Reminder } from "@shared/schema";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data: overdueReminders = [] } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders", { overdue: true }],
  });

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle && (
              <p className="text-slate-600 mt-1">
                {subtitle.includes("Welcome back") 
                  ? `Welcome back, ${user?.firstName || "there"}! Here's what's happening with your business.`
                  : subtitle
                }
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search inventory, sales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-80"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5 text-slate-400 hover:text-slate-600" />
              {overdueReminders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {overdueReminders.length}
                </span>
              )}
            </Button>
            
            {/* Add New Button */}
            <Button onClick={() => setShowAddMenu(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
        </div>
      </header>

      <AddMenuModal 
        open={showAddMenu} 
        onOpenChange={setShowAddMenu} 
      />
    </>
  );
}
