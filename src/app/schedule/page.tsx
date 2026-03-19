"use client";

import { addDays, format, startOfWeek } from "date-fns";
import { arEG } from "date-fns/locale/ar-EG";
import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDueInstancesForDate, sortInstancesBySlot } from "@/lib/schedule";
import { slotLabelAr, slotTimeAr } from "@/lib/slots";
import { importanceBadgeClass, useHygieneStore } from "@/stores/hygiene-store";
import { useNotificationSettings } from "@/hooks/use-notification-settings";

const WEEK_STARTS_ON_SATURDAY = 6;

export default function SchedulePage() {
  const routines = useHygieneStore((s) => s.routines);
  const { morningTime, eveningTime } = useNotificationSettings();
  const start = startOfWeek(new Date(), { weekStartsOn: WEEK_STARTS_ON_SATURDAY });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="text-2xl font-black text-teal-950 dark:text-white">الجدول الأسبوعي</h1>
        <p className="text-sm text-teal-900/55 dark:text-white/50">
          الأسبوع يبدأ من السبت · ألوان حسب الأهمية
        </p>
      </div>

      <div className="space-y-4">
        {days.map((d, i) => {
          const raw = getDueInstancesForDate(d, routines);
          const items = sortInstancesBySlot(raw);
          return (
            <motion.div
              key={d.toISOString()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {format(d, "EEEE d MMM", { locale: arEG })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.length === 0 && (
                    <p className="text-sm text-teal-900/45 dark:text-white/40">لا مهام مجدولة</p>
                  )}
                  {items.map((it) => (
                    <Link
                      key={it.instanceKey}
                      href={`/routines/${it.routineId}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-teal-200/40 bg-teal-500/5 px-3 py-2 text-sm transition-colors hover:bg-teal-500/10 dark:border-white/10"
                    >
                      <span className="font-semibold text-teal-950 dark:text-white">{it.name}</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-teal-800/60 dark:text-white/45">
                          {slotLabelAr(it.slot)} · {slotTimeAr(it.slot, morningTime, eveningTime)}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${importanceBadgeClass(it.importance)}`}
                        >
                          {it.importance === "essential"
                            ? "أساسي"
                            : it.importance === "important"
                              ? "مهم"
                              : "بونص"}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
