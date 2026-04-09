import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, Settings, Shield } from "lucide-react";

interface SettingsShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const tabs = [
  { label: "Business Settings", href: "/settings", icon: Settings },
  { label: "Profile", href: "/settings/profile", icon: User },
  { label: "Account", href: "/settings/account", icon: Shield },
];

export default function SettingsShell({
  title,
  subtitle,
  children,
}: SettingsShellProps) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} />

        <div
          className="flex-1 overflow-y-auto p-4 md:p-6"
          style={{ paddingBottom: "150px" }}
        >
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const isActive =
                  location === tab.href ||
                  (tab.href !== "/settings" && location.startsWith(tab.href));

                const Icon = tab.icon;

                return (
                  <Link key={tab.href} href={tab.href}>
                    <Button
                      variant={isActive ? "default" : "outline"}
                      className={cn("h-10 px-4 inline-flex items-center gap-2")}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>

            <div className="max-w-4xl">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}