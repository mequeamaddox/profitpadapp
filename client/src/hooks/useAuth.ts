import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  console.log("useAuth - user:", user);
  console.log("useAuth - isLoading:", isLoading);
  console.log("useAuth - error:", error);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
