import { useEffect } from "react";
import { useAuthContext } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import BarcodeLookup from "@/components/barcode-lookup";
import StaleInventoryAlerts from "@/components/notifications/stale-inventory-alerts";
import PWAInstallPrompt from "@/components/pwa-install-prompt";

export default function Research() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuthContext();

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

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Research & Analytics" 
          subtitle="Product research, barcode lookup, and inventory optimization tools." 
        />
        <div className="flex-1 overflow-y-auto p-4 md:p-6" style={{ paddingBottom: '150px' }}>
          <div className="space-y-6">
            {/* Barcode Lookup */}
            <BarcodeLookup />
            
            {/* Stale Inventory Alerts */}
            <StaleInventoryAlerts />
          </div>
        </div>
      </main>
      <PWAInstallPrompt />
    </div>
  );
}