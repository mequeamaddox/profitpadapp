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

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  })();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 px-4 py-3 backdrop-blur-md md:px-8 md:py-4">
        <div className="flex items-center gap-3">
          <MobileNav />

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-foreground md:text-2xl">{title}</h1>
            {subtitle && (
              <p className="mt-0.5 hidden truncate text-sm text-muted-foreground sm:block">
                {subtitle.includes("Welcome back")
                  ? `${greeting}, ${user?.firstName || "there"}. Here's how your business is doing.`
                  : subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 md:gap-3">
            <div className="relative hidden lg:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search inventory, sales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-72 rounded-full bg-card pl-9"
              />
            </div>

            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full text-muted-foreground hover:text-foreground" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {(overdueReminders?.length || 0) > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-background">
                  {overdueReminders?.length}
                </span>
              )}
            </Button>

            <Button onClick={() => setShowAddMenu(true)} className="h-10 rounded-full px-3 md:px-5" aria-label="Add new">
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">Add New</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative hidden h-10 w-10 rounded-full p-0 md:inline-flex">
                  <Avatar className="h-9 w-9 ring-2 ring-border">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                    <AvatarFallback className="bg-accent text-sm font-bold text-accent-foreground">
                      {user?.firstName ? user.firstName.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-xl" align="end" forceMount>
                <div className="flex flex-col gap-0.5 p-2">
                  {user?.firstName && (
                    <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                  )}
                  {user?.email && (
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/logout" className="w-full cursor-pointer">
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
