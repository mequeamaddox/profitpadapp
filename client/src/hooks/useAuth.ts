import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0, // Always refetch to get latest auth state
    gcTime: 0, // Don't cache auth results
    refetchOnMount: true,
    refetchOnWindowFocus: true, // Check auth when user returns to tab
  });

  // Enhanced debugging for auth state
  if (typeof window !== 'undefined') {
    console.log("🔍 useAuth Debug:", { 
      user: user?.id, 
      isLoading, 
      error: error?.message, 
      isAuthenticated: !!user,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other'
    });
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch, // Allow manual refresh of auth state
  };
}
