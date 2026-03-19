"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { arabicDayName } from "@/lib/schedule";
import { slotLabelAr, slotTimeAr } from "@/lib/slots";
import { ProgressRing } from "@/components/layout/progress-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotificationSettings } from "@/hooks/use-notification-settings";
import {
  importanceBadgeClass,
  useHygieneStore,
  toDateKey,
} from "@/stores/hygiene-store";

export function DashboardHome() {
  const hydrated = useHygieneStore((s) => s.hydrated);
  const getDueToday = useHygieneStore((s) => s.getDueToday);
  const getProgressToday = useHygieneStore((s) => s.getProgressToday);
  const getStreak = useHygieneStore((s) => s.getStreak);
  const getNextIncomplete = useHygieneStore((s) => s.getNextIncomplete);
  const isCompleted = useHygieneStore((s) => s.isCompleted);
  const toggleCompletion = useHygieneStore((s) => s.toggleCompletion);

  const { morningTime, eveningTime } = useNotificationSettings();

  const today = useMemo(() => new Date(), []);
  const dateKey = toDateKey(today);
  const due = useMemo(
    () => (hydrated ? getDueToday(today) : []),
    [getDueToday, hydrated, today],
  );
  const { done, total, ratio } = useMemo(
    () => (hydrated ? getProgressToday(today) : { done: 0, total: 0, ratio: 0 }),
    [getProgressToday, hydrated, today],
  );
  const streak = hydrated ? getStreak() : 0;
  const nextUp = hydrated ? getNextIncomplete(today) : null;

  const celebrated = useRef(false);
  useEffect(() => {
    if (!hydrated || total === 0) return;
    if (ratio >= 1 && !celebrated.current) {
      celebrated.current = true;
      toast.success("يوم نظافة كامل!", {
        description: "كفاية إتقان — ربنا يباركلك 💚",
      });
    }
    if (ratio < 1) celebrated.current = false;
  }, [hydrated, ratio, total]);

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 hygiene-fog bg-linear-to-b from-teal-400/15 via-transparent to-cyan-400/10 dark:from-teal-300/10 dark:to-cyan-300/10"
      />
      <div className="relative z-10 space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-teal-800/70 dark:text-teal-200/70">
            {arabicDayName(today)} · اليوم
          </p>
          <h1 className="text-2xl font-black tracking-tight text-teal-950 dark:text-white">
            روتين النظافة
          </h1>
          <p className="mt-1 text-sm text-teal-900/55 dark:text-white/55">
            playful بس جدّي في التفاصيل
          </p>
        </div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-1"
        >
          <ProgressRing value={ratio} />
          <span className="text-xs font-semibold text-teal-800/70 dark:text-teal-200/70">
            {done}/{total} مكتمل
          </span>
        </motion.div>
      </header>

      <Card className="overflow-hidden border-teal-300/30 bg-linear-to-br from-white/90 to-teal-50/50 dark:from-white/5 dark:to-teal-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-amber-500" />
            سلسلة الإنجاز
          </CardTitle>
          <CardDescription>أيام متتالية أكملت فيها كل الأساسي</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-black text-teal-700 dark:text-teal-300">{streak}</p>
        </CardContent>
      </Card>

      {nextUp && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">التالي</CardTitle>
              <CardDescription>
                {nextUp.name} · {slotLabelAr(nextUp.slot)} · {slotTimeAr(nextUp.slot, morningTime, eveningTime)} · ~{nextUp.estimatedMinutes} د
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href={`/routines/${nextUp.routineId}`}>ابدأ الخطوات</Link>
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  toggleCompletion(dateKey, nextUp.instanceKey);
                  toast.message("تم التحديث", { description: nextUp.name });
                }}
              >
                تمّت
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-teal-900/70 dark:text-white/70">
          مهام اليوم
        </h2>
        <AnimatePresence initial={false}>
          {due.map((item, idx) => {
            const doneToday = isCompleted(dateKey, item.instanceKey);
            return (
              <motion.div
                key={item.instanceKey}
                layout
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: idx * 0.03, duration: 0.25, ease: "easeOut" }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
              >
                <Card
                  className={
                    doneToday
                      ? "border-emerald-400/40 bg-emerald-500/5"
                      : "hover:border-teal-300/50"
                  }
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <button
                      type="button"
                      aria-label="تبديل الإتمام"
                      onClick={() => toggleCompletion(dateKey, item.instanceKey)}
                      className="shrink-0 rounded-2xl p-1 transition-transform active:scale-95"
                    >
                      <CheckCircle2
                        className={
                          doneToday
                            ? "h-8 w-8 text-emerald-500"
                            : "h-8 w-8 text-teal-300 dark:text-white/20"
                        }
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-teal-950 dark:text-white">{item.name}</p>
                        <Badge
                          className={importanceBadgeClass(item.importance)}
                          variant="outline"
                        >
                          {item.importance === "essential"
                            ? "أساسي"
                            : item.importance === "important"
                              ? "مهم"
                              : "بونص"}
                        </Badge>
                        <span className="text-xs text-teal-800/60 dark:text-white/50">
                          {slotLabelAr(item.slot)} · {slotTimeAr(item.slot, morningTime, eveningTime)}
                        </span>
                      </div>
                      <p className="text-xs text-teal-900/50 dark:text-white/45">
                        ~{item.estimatedMinutes} دقيقة
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/routines/${item.routineId}`}>تفاصيل</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </section>
      </div>
    </div>
  );
}
