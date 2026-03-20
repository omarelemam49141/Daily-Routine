"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export function AuthGate({ children }: { children: ReactNode }) {
  const { requireAuth, authenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!requireAuth) return;
    if (!authenticated && pathname !== "/login") {
      router.replace("/login");
    }
    if (authenticated && pathname === "/login") {
      router.replace("/");
    }
  }, [requireAuth, authenticated, pathname, router]);

  if (!requireAuth) {
    return <>{children}</>;
  }

  if (!authenticated && pathname !== "/login") {
    return null;
  }

  if (authenticated && pathname === "/login") {
    return null;
  }

  return <>{children}</>;
}
