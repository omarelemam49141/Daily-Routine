"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { useHygieneStore } from "@/stores/hygiene-store";
import { ReminderRunner } from "@/components/reminder-runner";

export function Providers({ children }: { children: React.ReactNode }) {
  const setHydrated = useHygieneStore((s) => s.setHydrated);

  useEffect(() => {
    setHydrated(true);
  }, [setHydrated]);

  return (
    <>
      {children}
      <Toaster richColors position="top-center" dir="rtl" />
      <ReminderRunner />
    </>
  );
}
