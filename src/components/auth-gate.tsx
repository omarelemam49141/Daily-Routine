"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

function Spinner() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-teal-900/70 dark:text-white/60">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"
        aria-hidden
      />
      <p className="text-sm font-medium">جاري التحميل…</p>
    </div>
  );
}

function FirebaseMissing() {
  return (
    <div className="space-y-3 py-10 text-center">
      <p className="font-bold text-teal-950 dark:text-white">تعذر تفعيل الدخول</p>
      <p className="text-sm text-teal-900/65 dark:text-white/55">
        لم تُضبط مفاتيح Firebase في البناء. أضف المتغيرات{" "}
        <code className="rounded bg-teal-500/10 px-1">NEXT_PUBLIC_FIREBASE_*</code> في أسرار
        GitHub ثم أعد النشر.
      </p>
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { requireAuth, authResolved, hasFirebase, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!requireAuth || !authResolved) return;
    if (!hasFirebase) return;
    if (!user && pathname !== "/login") {
      router.replace("/login");
    }
    if (user && pathname === "/login") {
      router.replace("/");
    }
  }, [requireAuth, authResolved, hasFirebase, user, pathname, router]);

  if (!requireAuth) {
    return <>{children}</>;
  }

  if (!authResolved) {
    return <Spinner />;
  }

  if (!hasFirebase) {
    return <FirebaseMissing />;
  }

  if (!user && pathname !== "/login") {
    return <Spinner />;
  }

  if (user && pathname === "/login") {
    return <Spinner />;
  }

  return <>{children}</>;
}
