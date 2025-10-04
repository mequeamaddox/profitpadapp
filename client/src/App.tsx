import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { getQueryFn } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Sales from "@/pages/sales";
import Expenses from "@/pages/expenses";
import Reminders from "@/pages/reminders";
import Settings from "@/pages/settings";
import Reports from "@/pages/reports";
import Research from "@/pages/research";
import Help from "@/pages/help";
import ProfitEstimatorPage from "@/pages/profit-estimator";
import Logout from "@/pages/logout";
import Billing from "@/pages/billing";
import PrintLabels from "@/pages/print-labels";


function AuthenticatedRouter() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Debug logging
  console.log("🔍 AuthenticatedRouter:", { isAuthenticated, isLoading, user: user?.id });

  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading...</div>
    </div>;
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/:rest*" component={Landing} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/sales" component={Sales} />
          <Route path="/expenses" component={Expenses} />
          <Route path="/reminders" component={Reminders} />
          <Route path="/reports" component={Reports} />
          <Route path="/research" component={Research} />
          <Route path="/profit-estimator" component={ProfitEstimatorPage} />
          <Route path="/settings" component={Settings} />
          <Route path="/logout" component={Logout} />
          <Route path="/billing" component={Billing} />
          <Route path="/help" component={Help} />
          <Route path="/print-labels" component={PrintLabels} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Create QueryClient instance with useMemo to prevent recreation
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: getQueryFn({ on401: "returnNull" }),
        refetchInterval: false,
        refetchOnWindowFocus: true, // Refetch on window focus to catch auth changes
        staleTime: 0, // Always fresh queries
        gcTime: 0, // Don't cache any queries 
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthenticatedRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
