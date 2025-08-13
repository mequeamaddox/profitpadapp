import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0, // Always refetch to get latest auth state
  });

  // Log to both console and DOM for debugging
  if (typeof window !== 'undefined') {
    console.log("🔍 useAuth Debug:", { user, isLoading, error: error?.message });
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user && user.id,
  };
}
