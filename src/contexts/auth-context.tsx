"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebase } from "@/lib/firebase";

type AuthContextValue = {
  requireAuth: boolean;
  authResolved: boolean;
  hasFirebase: boolean;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const requireAuth = process.env.NEXT_PUBLIC_REQUIRE_AUTH === "true";
  const [authResolved, setAuthResolved] = useState(!requireAuth);
  const [hasFirebase, setHasFirebase] = useState(!requireAuth);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!requireAuth) {
      setAuthResolved(true);
      setHasFirebase(true);
      setUser(null);
      return;
    }

    let unsub: (() => void) | undefined;
    let cancelled = false;

    void getFirebase()
      .then((fb) => {
        if (cancelled) return;
        if (!fb) {
          setHasFirebase(false);
          setUser(null);
          setAuthResolved(true);
          return;
        }
        setHasFirebase(true);
        if (!cancelled) {
          setUser(fb.auth.currentUser);
          setAuthResolved(true);
        }
        unsub = onAuthStateChanged(fb.auth, (u) => {
          if (cancelled) return;
          setUser(u);
        });
      })
      .catch((e) => {
        console.error("[Auth] Firebase:", e);
        setHasFirebase(false);
        setUser(null);
        setAuthResolved(true);
      });

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [requireAuth]);

  const value = useMemo(
    () => ({
      requireAuth,
      authResolved,
      hasFirebase,
      user,
    }),
    [requireAuth, authResolved, hasFirebase, user],
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
