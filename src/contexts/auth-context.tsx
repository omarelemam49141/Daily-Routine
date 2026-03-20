"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearSession,
  getExpectedHash,
  hasSession,
  isAuthRequired,
  setSession,
  sha256,
} from "@/lib/auth-hash";

type AuthContextValue = {
  requireAuth: boolean;
  authenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const requireAuth = isAuthRequired();
  const [authenticated, setAuthenticated] = useState(!requireAuth);

  useEffect(() => {
    if (requireAuth && hasSession()) {
      setAuthenticated(true);
    }
  }, [requireAuth]);

  const login = useCallback(
    async (password: string): Promise<boolean> => {
      const hash = await sha256(password);
      if (hash === getExpectedHash()) {
        setSession();
        setAuthenticated(true);
        return true;
      }
      return false;
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ requireAuth, authenticated, login, logout }),
    [requireAuth, authenticated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
