"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { importanceBadgeClass, useHygieneStore } from "@/stores/hygiene-store";
import type { Importance } from "@/types";

const filters: { id: Importance | "all"; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "essential", label: "أساسي" },
  { id: "important", label: "مهم" },
  { id: "bonus", label: "بونص" },
];

export default function RoutinesPage() {
  const routines = useHygieneStore((s) => s.routines);
  const [q, setQ] = useState("");
  const [imp, setImp] = useState<Importance | "all">("all");

  const list = useMemo(() => {
    return routines.filter((r) => {
      if (imp !== "all" && r.importance !== imp) return false;
      if (!q.trim()) return true;
      return r.name.includes(q) || r.steps.some((s) => s.title.includes(q));
    });
  }, [imp, q, routines]);

  return (
    <div className="relative overflow-hidden pb-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 hygiene-fog bg-gradient-to-b from-teal-400/15 via-transparent to-cyan-400/10 dark:from-teal-300/10 dark:to-cyan-300/10"
      />
      <div className="relative z-10 space-y-4">
        <div>
        <h1 className="text-2xl font-black text-teal-950 dark:text-white">الروتينات</h1>
        <p className="text-sm text-teal-900/55 dark:text-white/50">
          فلترة بالأهمية وبحث سريع
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-600/50" />
        <Input
          placeholder="بحث..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pr-10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <motion.button
            key={f.id}
            type="button"
            onClick={() => setImp(f.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              imp === f.id
                ? "bg-gradient-to-l from-teal-500 to-cyan-500 text-white shadow-md"
                : "bg-white/60 text-teal-800 hover:bg-teal-100/80 dark:bg-white/10 dark:text-teal-100"
            }`}
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {f.label}
          </motion.button>
        ))}
      </div>

      <div className="space-y-3">
        {list.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.03, duration: 0.25, ease: "easeOut" }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
          >
            <Link href={`/routines/${r.id}`}>
              <Card className="transition-transform hover:scale-[1.01] hover:border-teal-400/40">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">{r.name}</CardTitle>
                    <Badge
                      variant="outline"
                      className={importanceBadgeClass(r.importance)}
                    >
                      {r.importance === "essential"
                        ? "أساسي"
                        : r.importance === "important"
                          ? "مهم"
                          : "بونص"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {r.steps.length} خطوات · ~{r.estimatedMinutes} د
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-teal-900/50 dark:text-white/45 line-clamp-2">
                  {r.tips[0] ?? r.warnings[0] ?? "اضغط للتفاصيل والخطوات"}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
      </div>
    </div>
  );
}
