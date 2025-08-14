import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell, Plus, LogOut, User as UserIcon } from "lucide-react";
import AddMenuModal from "@/components/modals/add-menu-modal";
import MobileNav from "./mobile-nav";
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
    queryKey: ["/api/reminders?overdue=true"],
  });

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Navigation */}
          <MobileNav />
          
          <div className="flex-1 md:flex-initial md:mr-4">
            <h1 className="text-lg md:text-2xl font-bold text-slate-900 truncate">{title}</h1>
            {subtitle && (
              <p className="text-slate-600 mt-1 text-sm md:text-base hidden sm:block">
                {subtitle.includes("Welcome back") 
                  ? `Welcome back, ${user?.firstName || "there"}! Here's what's happening with your business.`
                  : subtitle
                }
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search - Hidden on mobile */}
            <div className="relative hidden lg:block">
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
              {(overdueReminders?.length || 0) > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {overdueReminders?.length}
                </span>
              )}
            </Button>
            
            {/* Add New Button - Responsive */}
            <Button onClick={() => setShowAddMenu(true)} size="sm" className="md:h-auto">
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Add New</span>
            </Button>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                    <AvatarFallback>
                      {user?.firstName ? user.firstName.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.firstName && (
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                    )}
                    {user?.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/api/logout" className="w-full cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
