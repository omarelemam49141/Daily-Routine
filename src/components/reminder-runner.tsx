"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useHygieneStore, toDateKey } from "@/stores/hygiene-store";
import { useNotificationSettings } from "@/hooks/use-notification-settings";
import { useAuth } from "@/contexts/auth-context";

function matchesNow(hhmm: string): boolean {
  const [h, m] = hhmm.split(":").map(Number);
  const now = new Date();
  return now.getHours() === h && now.getMinutes() === m;
}

export function ReminderRunner() {
  const { requireAuth, user } = useAuth();
  const { enabled, morningTime, eveningTime, pushEnabled } =
    useNotificationSettings();

  const lastMorning = useRef<string | null>(null);
  const lastEvening = useRef<string | null>(null);

  useEffect(() => {
    if (requireAuth && !user) return;
    if (!enabled) return;
    const id = window.setInterval(() => {
      const today = toDateKey(new Date());
      const {
        getDueToday,
        getNextIncomplete,
        isCompleted,
      } = useHygieneStore.getState();
      const due = getDueToday();
      const pending =
        due.length -
        due.filter((d) => isCompleted(today, d.instanceKey)).length;

      if (matchesNow(morningTime)) {
        if (lastMorning.current !== today) {
          lastMorning.current = today;
          toast.info("تذكير صباحي", {
            description:
              pending > 0
                ? `عندك ${pending} مهام نظافة النهاردة — ابدأ بـ: ${getNextIncomplete()?.name ?? ""}`
                : "ممتاز! خلصت مهام النهاردة.",
          });
          if (
            pushEnabled &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("روتين النظافة", {
              body: `صباح الخير — ${pending} مهام متبقية اليوم`,
            });
          }
        }
      }

      if (matchesNow(eveningTime)) {
        if (lastEvening.current !== today) {
          lastEvening.current = today;
          toast.info("تذكير مسائي", {
            description:
              "روتين الفم والوجه قبل النوم — دقايق بسيطة بتفرق جداً.",
          });
          if (
            pushEnabled &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("روتين النظافة", {
              body: "تذكير مسائي: العناية بالفم والوجه",
            });
          }
        }
      }
    }, 15_000);

    return () => window.clearInterval(id);
  }, [requireAuth, user, enabled, eveningTime, morningTime, pushEnabled]);

  return null;
}
