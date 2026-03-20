"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

function isLoginPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "");
  return normalized === "/login";
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { requireAuth, authenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const onLogin = isLoginPath(pathname);

  useEffect(() => {
    if (!requireAuth) return;
    if (!authenticated && !onLogin) {
      router.replace("/login");
    }
    if (authenticated && onLogin) {
      router.replace("/");
    }
  }, [requireAuth, authenticated, onLogin, router]);

  if (!requireAuth) {
    return <>{children}</>;
  }

  if (!authenticated && !onLogin) {
    return null;
  }

  if (authenticated && onLogin) {
    return null;
  }

  return <>{children}</>;
}
