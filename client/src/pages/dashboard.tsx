import { useAuthContext } from "@/context/auth-context";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MetricsGrid from "@/components/dashboard/metrics-grid";
import RevenueChart from "@/components/dashboard/revenue-chart";
import RecentSales from "@/components/dashboard/recent-sales";
import QuickActions from "@/components/dashboard/quick-actions";
import InventoryOverview from "@/components/dashboard/inventory-overview";
import InventoryValue from "@/components/dashboard/inventory-value";
import InventoryCapital from "@/components/dashboard/inventory-capital";
import PWAInstallPrompt from "@/components/pwa-install-prompt";

export default function Dashboard() {
  const { user, isLoading } = useAuthContext();
  const isAuthenticated = !!user;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Header
          title="Dashboard"
          subtitle="Welcome back! Here's what's happening with your business."
        />
        <div className="flex-1 overflow-y-auto px-4 pb-32 pt-5 md:px-8 md:pt-6">
          <div className="mx-auto max-w-7xl">
            <MetricsGrid />

            <div className="mb-4 grid grid-cols-1 gap-4 md:mb-6 md:gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
              <RecentSales />
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <InventoryOverview />
              </div>
              <div className="grid gap-4 md:gap-6">
                <QuickActions />
                <InventoryValue />
                <InventoryCapital />
              </div>
            </div>
          </div>
        </div>
      </main>
      <PWAInstallPrompt />
    </div>
  );
}
