import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import ProfitEstimator from "@/components/profit-estimator";

export default function ProfitEstimatorPage() {
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
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Profit Estimator" subtitle="Calculate potential profits for items before purchasing or listing them." />
        <div className="flex-1 overflow-y-auto p-8" style={{ paddingBottom: '150px' }}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Profit Estimator</h1>
              <p className="text-gray-600 mt-2">
                Calculate potential profits for items before purchasing or listing them.
              </p>
            </div>
            
            <ProfitEstimator />
          </div>
        </div>
      </main>
    </div>
  );
}