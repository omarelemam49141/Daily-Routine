"use client";

import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { categoryLabelAr, frequencyLabelAr, toolMonthlyCost } from "@/lib/budget";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHygieneStore } from "@/stores/hygiene-store";
import type { ToolCategory } from "@/types";

const COLORS = [
  "#14b8a6",
  "#22d3ee",
  "#a78bfa",
  "#fbbf24",
  "#fb7185",
  "#34d399",
  "#60a5fa",
  "#c084fc",
];

export default function BudgetPage() {
  const tools = useHygieneStore((s) => s.tools);
  const priceOverrides = useHygieneStore((s) => s.priceOverrides);
  const setPriceOverride = useHygieneStore((s) => s.setPriceOverride);
  const getEffectivePrice = useHygieneStore((s) => s.getEffectivePrice);

  const rows = useMemo(() => {
    return tools.map((t) => {
      const ov = priceOverrides[t.id];
      const qty = ov?.quantity ?? 1;
      const eff = getEffectivePrice(t.id);
      const monthly = toolMonthlyCost(t, eff, qty);
      return { tool: t, qty, eff, monthly };
    });
  }, [getEffectivePrice, priceOverrides, tools]);

  const totalMonthly = rows.reduce((a, r) => a + r.monthly, 0);
  const totalYearly = totalMonthly * 12;

  const byCat = useMemo(() => {
    const m = new Map<ToolCategory, number>();
    for (const r of rows) {
      m.set(r.tool.category, (m.get(r.tool.category) ?? 0) + r.monthly);
    }
    return [...m.entries()].map(([name, value]) => ({
      name: categoryLabelAr(name),
      value: Math.round(value * 100) / 100,
    }));
  }, [rows]);

  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="text-2xl font-black text-teal-950 dark:text-white">الميزانية</h1>
        <p className="text-sm text-teal-900/55 dark:text-white/50">
          عدّل الأسعار والكمية — التقدير الشهري يعتمد على دورة الشراء
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">شهرياً (تقدير)</CardTitle>
              <CardDescription>مجموع كل الأدوات</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-teal-700 dark:text-teal-300">
                {formatCurrency(Math.round(totalMonthly))}
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">سنوياً (تقدير)</CardTitle>
              <CardDescription>شهري × ١٢</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-cyan-700 dark:text-cyan-300">
                {formatCurrency(Math.round(totalYearly))}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">توزيع التكلفة حسب الفئة</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          {byCat.every((x) => x.value === 0) ? (
            <p className="text-sm text-teal-900/50 dark:text-white/45">
              أدخل أسعاراً في الجدول لظهور الرسم
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCat}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {byCat.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) =>
                    formatCurrency(typeof v === "number" ? v : Number(v) || 0)
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">جدول الأسعار</CardTitle>
          <CardDescription>اضغط «تعديل» لتحديث السعر أو الكمية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map(({ tool, qty, eff, monthly }) => (
            <div
              key={tool.id}
              className="rounded-2xl border border-teal-200/40 p-3 dark:border-white/10"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-teal-950 dark:text-white">{tool.name}</p>
                  <p className="text-xs text-teal-800/55 dark:text-white/45">
                    {categoryLabelAr(tool.category)} · {frequencyLabelAr(tool.purchaseFrequencyDays)} · شهرياً ~
                    {formatCurrency(Math.round(monthly))}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-teal-800 dark:text-teal-200">
                    {formatCurrency(Math.round(eff))} × {qty}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setEditingId((id) => (id === tool.id ? null : tool.id))
                    }
                  >
                    {editingId === tool.id ? "إغلاق" : "تعديل"}
                  </Button>
                </div>
              </div>
              {editingId === tool.id && (
                <EditRow
                  defaultPrice={eff}
                  defaultQty={qty}
                  onSave={(price, quantity) => {
                    setPriceOverride(tool.id, price, quantity);
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function EditRow({
  defaultPrice,
  defaultQty,
  onSave,
  onCancel,
}: {
  defaultPrice: number;
  defaultQty: number;
  onSave: (p: number, q: number) => void;
  onCancel: () => void;
}) {
  const [p, setP] = useState(String(defaultPrice));
  const [q, setQ] = useState(String(defaultQty));
  return (
    <div className="mt-3 space-y-3 rounded-2xl bg-teal-500/5 p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>السعر (جنيه)</Label>
          <Input inputMode="decimal" value={p} onChange={(e) => setP(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>الكمية لكل دورة شراء</Label>
          <Input inputMode="numeric" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          className="flex-1"
          onClick={() => onSave(Number(p) || 0, Number(q) || 1)}
        >
          حفظ
        </Button>
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </div>
  );
}
