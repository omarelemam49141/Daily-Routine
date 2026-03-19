"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { importanceBadgeClass, useHygieneStore } from "@/stores/hygiene-store";
import { useNotificationSettings } from "@/hooks/use-notification-settings";
import { slotLabelAr, slotTimeAr } from "@/lib/slots";

function parseArabicNumberedItems(
  text: string,
): Array<{ marker: string; content: string }> | null {
  // Matches Arabic-Indic digits and Western digits like: "١. ...", "2) ...", "3، ..."
  const re = /([٠-٩0-9]+)[\.\u060C\u066B\u066C\)]\s+/g; // . ، ، ) variants
  const matches = Array.from(text.matchAll(re)).map((m) => {
    const index = m.index ?? 0;
    return { index, marker: m[1], full: m[0] };
  });

  // Filter to likely item starts (must be start-of-string or preceded by whitespace/newline)
  const filtered = matches.filter((m) => {
    const prev = m.index <= 0 ? "" : text[m.index - 1] ?? "";
    return m.index === 0 || /\s/.test(prev);
  });

  if (filtered.length < 2) return null;

  const items = filtered.map((m, i) => {
    const start = m.index + m.full.length;
    const end = filtered[i + 1]?.index ?? text.length;
    const content = text.slice(start, end).trim();
    return { marker: m.marker, content };
  });

  return items;
}

export function RoutineDetailPageClient() {
  const params = useParams();
  const id = String(params.id ?? "");
  const routines = useHygieneStore((s) => s.routines);
  const tools = useHygieneStore((s) => s.tools);
  const routine = useMemo(() => routines.find((r) => r.id === id), [id, routines]);
  const { morningTime, eveningTime } = useNotificationSettings();

  const [stepDone, setStepDone] = useState<Record<number, boolean>>({});

  if (!routine) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="font-bold">الروتين غير موجود</p>
        <Button asChild variant="secondary">
          <Link href="/routines">رجوع</Link>
        </Button>
      </div>
    );
  }

  const toolList = tools.filter((t) => routine.toolIds.includes(t.id));
  const doneCount = routine.steps.filter((s) => stepDone[s.order]).length;
  const progress = routine.steps.length ? doneCount / routine.steps.length : 0;

  const scheduleText = (() => {
    const s = routine.schedule;
    if (s.kind === "daily") {
      const parts = s.slots.map((slot) => {
        if (slot === "anytime") return slotLabelAr(slot);
        return `${slotLabelAr(slot)} · ${slotTimeAr(slot, morningTime, eveningTime)}`;
      });
      return `استخدام يومي: ${parts.length} مرة · ${parts.join("، ")}`;
    }
    if (s.kind === "weekly") {
      return `مجدوّلة أسبوعياً (${s.daysOfWeek.length} يوم)`;
    }
    return `مجدوّلة بنمط أسبوعي`;
  })();

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/routines" className="gap-1">
            <ArrowRight className="h-4 w-4 rotate-180" />
            رجوع
          </Link>
        </Button>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-black text-teal-950 dark:text-white">{routine.name}</h1>
          <Badge variant="outline" className={importanceBadgeClass(routine.importance)}>
            {routine.importance === "essential"
              ? "أساسي"
              : routine.importance === "important"
                ? "مهم"
                : "بونص"}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-teal-900/55 dark:text-white/50">
          ~{routine.estimatedMinutes} دقيقة · {routine.steps.length} خطوة
        </p>
        <p className="mt-1 text-sm text-teal-900/50 dark:text-white/45">{scheduleText}</p>
        <div className="mt-3">
          <Progress value={progress * 100} />
        </div>
      </div>

      {routine.warnings.length > 0 && (
        <Card className="border-amber-400/40 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-amber-900 dark:text-amber-100">
              <AlertTriangle className="h-4 w-4" />
              تحذيرات مهمة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-amber-950/80 dark:text-amber-50/90">
            {routine.warnings.map((w) => (
              <p key={w}>• {w}</p>
            ))}
          </CardContent>
        </Card>
      )}

      {routine.tips.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">نصائح</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-teal-900/70 dark:text-white/65">
            {routine.tips.map((t) => (
              <p key={t}>✦ {t}</p>
            ))}
          </CardContent>
        </Card>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-teal-900/70 dark:text-white/70">الأدوات</h2>
        <div className="flex flex-wrap gap-2">
          {toolList.map((t) => (
            <Badge key={t.id} variant="outline" className="rounded-xl px-3 py-1">
              {t.name}
            </Badge>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-teal-900/70 dark:text-white/70">الخطوات</h2>
        <AnimatePresence initial={false}>
          {routine.steps.map((s, idx) => {
            const done = Boolean(stepDone[s.order]);
            return (
              <motion.div
                key={s.order}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className={
                    done
                      ? "border-emerald-400/50 bg-emerald-500/5"
                      : "hover:border-teal-300/50"
                  }
                >
                  <CardContent className="flex gap-3 p-4">
                    <button
                      type="button"
                      onClick={() =>
                        setStepDone((prev) => ({
                          ...prev,
                          [s.order]: !prev[s.order],
                        }))
                      }
                      className="shrink-0"
                    >
                      <CheckCircle2
                        className={
                          done
                            ? "h-8 w-8 text-emerald-500"
                            : "h-8 w-8 text-teal-300 dark:text-white/20"
                        }
                      />
                    </button>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-bold text-teal-950 dark:text-white">
                        {s.order}. {s.title}
                      </p>
                    {(() => {
                      const items = parseArabicNumberedItems(s.description);
                      if (!items) {
                        return (
                          <p className="whitespace-pre-line text-sm text-teal-900/65 dark:text-white/60">
                            {s.description}
                          </p>
                        );
                      }

                      return (
                        <div className="mt-1 space-y-2">
                          {items.map((it, i) => (
                            <motion.p
                              key={`${s.order}-${i}`}
                              className="text-sm text-teal-900/65 dark:text-white/60"
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.22, delay: i * 0.03 }}
                            >
                              <span className="font-semibold">{it.marker}.</span>{" "}
                              {it.content}
                            </motion.p>
                          ))}
                        </div>
                      );
                    })()}
                      {s.warning && (
                        <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                          ⚠ {s.warning}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </section>
    </div>
  );
}
