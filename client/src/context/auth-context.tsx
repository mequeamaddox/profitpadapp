import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/queryClient";

type AuthUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  subscriptionTier?: string | null;
  trialEndsAt?: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshUser() {
    try {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  async function login(email: string, password: string) {
    const res = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await res.json();
    setUser(data);
  }

  async function register(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const res = await apiRequest("POST", "/api/auth/register", data);
    const user = await res.json();
    setUser(user);
  }

  async function logout() {
    try {
      await apiRequest("POST", "/api/auth/logout");
    } finally {
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, refreshUser }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}