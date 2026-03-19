"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Info, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryLabelAr } from "@/lib/budget";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importanceBadgeClass, useHygieneStore } from "@/stores/hygiene-store";
import type { Tool, ToolCategory } from "@/types";

const CATS: ToolCategory[] = [
  "cleansing",
  "hairCare",
  "skinCare",
  "grooming",
  "oralCare",
  "intimateCare",
  "nailCare",
  "underwear",
  "extra",
];

const IMP = ["essential", "important", "bonus"] as const;

function NotesList({
  label,
  text,
  maxLines,
  compact,
}: {
  label: string;
  text: string;
  maxLines?: number;
  compact?: boolean;
}) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  const isTruncated =
    typeof maxLines === "number" && maxLines >= 0 && lines.length > maxLines;

  const displayLines = isTruncated
    ? lines
        .map((l, idx) => (idx === maxLines! - 1 ? `${l} ...` : l))
        .slice(0, maxLines)
    : lines;

  return (
    <div className={`${compact ? "mt-0" : "mt-2"} space-y-1.5`}>
      <p className="text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1">
        <Info className="h-3.5 w-3.5 shrink-0" />
        {label}
      </p>
      <ul className="space-y-1.5 pr-1">
        {displayLines.map((line, i) => {
          const isWarning =
            line.startsWith("ممنوع") ||
            line.startsWith("لا ت") ||
            line.startsWith("⚠") ||
            line.startsWith("تحذير");

          return (
            <li
              key={`${i}-${line.slice(0, 14)}`}
              className={`flex items-start gap-2 rounded-lg px-2.5 py-1.5 text-xs leading-relaxed ${
                isWarning
                  ? "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 border border-amber-200/60 dark:border-amber-700/40"
                  : "bg-teal-50 text-teal-800 dark:bg-teal-900/20 dark:text-teal-200 border border-teal-200/50 dark:border-teal-700/30"
              }`}
            >
              {isWarning ? (
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
              ) : (
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400 dark:bg-teal-500" />
              )}
              <span>{line}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function UsageText({
  label,
  text,
  maxParagraphs,
  compact,
}: {
  label: string;
  text: string;
  maxParagraphs?: number;
  compact?: boolean;
}) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const isTruncated =
    typeof maxParagraphs === "number" &&
    maxParagraphs >= 0 &&
    paragraphs.length > maxParagraphs;

  const displayParagraphs = isTruncated
    ? paragraphs
        .slice(0, maxParagraphs)
        .map((p, idx) => (idx === maxParagraphs - 1 ? `${p} ...` : p))
    : paragraphs;

  const displayText = displayParagraphs.join("\n\n");
  if (!displayText.trim()) return null;

  return (
    <div
      className={`${compact ? "mt-0" : "mt-2"} rounded-xl border border-teal-200/60 bg-teal-50/60 p-2`}
    >
      <p className="text-xs font-bold text-teal-800 dark:text-teal-200 flex items-center gap-1">
        <Info className="h-3.5 w-3.5 shrink-0" />
        {label}
      </p>
      <div className="mt-1 whitespace-pre-line text-xs leading-relaxed text-teal-800/85 dark:text-teal-200/90">
        {displayText}
      </div>
    </div>
  );
}

function emptyTool(): Tool {
  return {
    id: `custom-${Date.now()}`,
    name: "",
    category: "extra",
    brand: "",
    alternativeBrand: "",
    price: 0,
    purchaseFrequencyDays: 30,
    importance: "important",
    notes: "",
    usage: "",
  };
}

export default function ProductsPage() {
  const tools = useHygieneStore((s) => s.tools);
  const addTool = useHygieneStore((s) => s.addTool);
  const updateTool = useHygieneStore((s) => s.updateTool);
  const removeTool = useHygieneStore((s) => s.removeTool);
  const [cat, setCat] = useState<ToolCategory | "all">("all");
  const [modal, setModal] = useState<"add" | null>(null);
  const [edit, setEdit] = useState<Tool | null>(null);
  const [detailsTool, setDetailsTool] = useState<Tool | null>(null);
  const [draft, setDraft] = useState<Tool>(emptyTool());

  const list = useMemo(() => {
    if (cat === "all") return tools;
    return tools.filter((t) => t.category === cat);
  }, [cat, tools]);

  return (
    <div className="space-y-4 pb-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-teal-950 dark:text-white">المنتجات والأدوات</h1>
          <p className="text-sm text-teal-900/55 dark:text-white/50">إضافة، تعديل، وحذف</p>
        </div>
        <Button
          type="button"
          className="gap-2"
          onClick={() => {
            setDraft(emptyTool());
            setModal("add");
          }}
        >
          <Plus className="h-4 w-4" />
          إضافة
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={cat === "all"} onClick={() => setCat("all")} label="الكل" />
        {CATS.map((c) => (
          <FilterChip
            key={c}
            active={cat === c}
            onClick={() => setCat(c)}
            label={categoryLabelAr(c)}
          />
        ))}
      </div>

      <div className={cat === "all" ? "space-y-6" : "space-y-3"}>
        {cat === "all"
          ? CATS.map((c) => {
              const sectionTools = tools.filter((t) => t.category === c);
              if (sectionTools.length === 0) return null;
              return (
                <div key={c} className="space-y-3">
                  <h2 className="text-sm font-bold text-teal-900/70 dark:text-white/70">
                    {categoryLabelAr(c)}
                  </h2>
                  {sectionTools.map((t, i) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card>
                        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
                          <div>
                            <CardTitle className="text-base">
                              {t.name || "بدون اسم"}
                            </CardTitle>
                            <p className="mt-1 text-xs text-teal-800/55 dark:text-white/45">
                              {categoryLabelAr(t.category)}
                            </p>
                          </div>
                          <Badge variant="outline" className={importanceBadgeClass(t.importance)}>
                            {t.importance === "essential"
                              ? "أساسي"
                              : t.importance === "important"
                                ? "مهم"
                                : "بونص"}
                          </Badge>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2 text-sm text-teal-900/70 dark:text-white/65">
                          <p>
                            <span className="font-semibold">العلامة:</span> {t.brand || "—"}
                          </p>
                          <p>
                            <span className="font-semibold">بديل:</span>{" "}
                            {t.alternativeBrand || "—"}
                          </p>
                          <div className="max-h-[190px] overflow-hidden">
                            {t.notes && (
                              <NotesList
                                label="ملاحظات"
                                text={t.notes}
                                maxLines={2}
                                compact
                              />
                            )}
                            {t.usage && (
                              <UsageText
                                label="طريقة الاستخدام"
                                text={t.usage}
                                maxParagraphs={1}
                                compact
                              />
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2 mt-auto">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-9 px-3 text-xs"
                              onClick={() => setDetailsTool({ ...t })}
                              disabled={!t.notes && !t.usage}
                            >
                              التفاصيل
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="gap-1"
                              onClick={() => {
                                setEdit({ ...t });
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              تعديل
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="gap-1 text-rose-600 border-rose-300/50"
                              onClick={() => {
                                if (confirm("حذف المنتج؟")) removeTool(t.id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              حذف
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              );
            })
          : list.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-base">{t.name || "بدون اسم"}</CardTitle>
                      <p className="mt-1 text-xs text-teal-800/55 dark:text-white/45">
                        {categoryLabelAr(t.category)}
                      </p>
                    </div>
                    <Badge variant="outline" className={importanceBadgeClass(t.importance)}>
                      {t.importance === "essential"
                        ? "أساسي"
                        : t.importance === "important"
                          ? "مهم"
                          : "بونص"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 text-sm text-teal-900/70 dark:text-white/65">
                    <p>
                      <span className="font-semibold">العلامة:</span> {t.brand || "—"}
                    </p>
                    <p>
                      <span className="font-semibold">بديل:</span>{" "}
                      {t.alternativeBrand || "—"}
                    </p>
                    <div className="max-h-[190px] overflow-hidden">
                      {t.notes && (
                        <NotesList
                          label="ملاحظات"
                          text={t.notes}
                          maxLines={2}
                          compact
                        />
                      )}
                      {t.usage && (
                        <UsageText
                          label="طريقة الاستخدام"
                          text={t.usage}
                          maxParagraphs={1}
                          compact
                        />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 mt-auto">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-9 px-3 text-xs"
                        onClick={() => setDetailsTool({ ...t })}
                        disabled={!t.notes && !t.usage}
                      >
                        التفاصيل
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="gap-1"
                        onClick={() => {
                          setEdit({ ...t });
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        تعديل
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1 text-rose-600 border-rose-300/50"
                        onClick={() => {
                          if (confirm("حذف المنتج؟")) removeTool(t.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        حذف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      <Dialog
        open={modal === "add"}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
      >
        <DialogContent>
          <div className="hygiene-modal-inner">
            <DialogHeader>
              <DialogTitle>منتج جديد</DialogTitle>
            </DialogHeader>
            <ToolForm
              value={draft}
              onChange={setDraft}
              onSubmit={() => {
                if (!draft.name.trim()) return;
                addTool({ ...draft, id: `custom-${Date.now()}` });
                setModal(null);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(edit)}
        onOpenChange={(open) => {
          if (!open) setEdit(null);
        }}
      >
        <DialogContent>
          <div className="hygiene-modal-inner">
            <DialogHeader>
              <DialogTitle>تعديل منتج</DialogTitle>
            </DialogHeader>
            {edit && (
              <ToolForm
                value={edit}
                onChange={setEdit}
                onSubmit={() => {
                  updateTool(edit.id, edit);
                  setEdit(null);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(detailsTool)}
        onOpenChange={(open) => {
          if (!open) setDetailsTool(null);
        }}
      >
        <DialogContent>
          <div className="hygiene-modal-inner">
            <DialogHeader>
              <DialogTitle>تفاصيل المنتج</DialogTitle>
            </DialogHeader>
            {detailsTool && (
              <div className="space-y-3">
                <p className="text-sm">
                  <span className="font-semibold">العلامة:</span>{" "}
                  {detailsTool.brand || "—"}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">بديل:</span>{" "}
                  {detailsTool.alternativeBrand || "—"}
                </p>
                {detailsTool.notes && (
                  <NotesList label="ملاحظات" text={detailsTool.notes} />
                )}
                {detailsTool.usage && (
                  <UsageText label="طريقة الاستخدام" text={detailsTool.usage} />
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
        active
          ? "bg-linear-to-l from-teal-500 to-cyan-500 text-white shadow"
          : "bg-white/60 text-teal-800 dark:bg-white/10 dark:text-teal-100"
      }`}
    >
      {label}
    </button>
  );
}

function ToolForm({
  value,
  onChange,
  onSubmit,
}: {
  value: Tool;
  onChange: (t: Tool) => void;
  onSubmit: () => void;
}) {
  const noteTexts = (value.notes ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const setNotes = (next: string[]) => onChange({ ...value, notes: next.join("\n") });

  const [draftNote, setDraftNote] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const addNote = () => {
    const t = draftNote.trim();
    if (!t) return;
    setNotes([...noteTexts, t]);
    setDraftNote("");
  };

  const removeNoteAt = (idx: number) => {
    const next = noteTexts.filter((_, i) => i !== idx);
    setNotes(next);
    if (editingIndex === idx) {
      setEditingIndex(null);
      setEditingText("");
    } else if (editingIndex != null && idx < editingIndex) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const startEditing = (idx: number) => {
    setEditingIndex(idx);
    setEditingText(noteTexts[idx] ?? "");
  };

  const saveEditing = () => {
    if (editingIndex == null) return;
    const t = editingText.trim();
    if (!t) {
      removeNoteAt(editingIndex);
      return;
    }
    const next = [...noteTexts];
    next[editingIndex] = t;
    setNotes(next);
    setEditingIndex(null);
    setEditingText("");
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingText("");
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>الاسم</Label>
        <Input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label>سعر افتراضي (جنيه)</Label>
        <Input
          inputMode="decimal"
          value={String(value.price)}
          onChange={(e) =>
            onChange({ ...value, price: Number(e.target.value) || 0 })
          }
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>الفئة</Label>
          <Select
            dir="rtl"
            value={value.category}
            onValueChange={(v) =>
              onChange({ ...value, category: v as ToolCategory })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATS.map((c) => (
                <SelectItem key={c} value={c}>
                  {categoryLabelAr(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>دورة الشراء (بالأيام)</Label>
          <Input
            inputMode="numeric"
            placeholder="مثلاً 30 = شهرياً"
            value={String(value.purchaseFrequencyDays)}
            onChange={(e) =>
              onChange({
                ...value,
                purchaseFrequencyDays: Math.max(1, Number(e.target.value) || 1),
              })
            }
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label>الأهمية</Label>
        <Select
          dir="rtl"
          value={value.importance}
          onValueChange={(v) =>
            onChange({
              ...value,
              importance: v as Tool["importance"],
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {IMP.map((f) => (
              <SelectItem key={f} value={f}>
                {f === "essential" ? "أساسي" : f === "important" ? "مهم" : "بونص"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>الماركة</Label>
        <Input
          value={value.brand}
          onChange={(e) => onChange({ ...value, brand: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label>بديل</Label>
        <Input
          value={value.alternativeBrand}
          onChange={(e) => onChange({ ...value, alternativeBrand: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label>ملاحظات</Label>
        <div className="rounded-2xl border border-teal-200/40 bg-teal-500/5 p-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={draftNote}
                placeholder="اكتب ملاحظة ثم Enter"
                onChange={(e) => setDraftNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addNote();
                  }
                }}
              />
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="button"
                  size="icon"
                  className="rounded-full"
                  onClick={addNote}
                  aria-label="إضافة ملاحظة"
                  disabled={!draftNote.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>

            <AnimatePresence initial={false}>
              {noteTexts.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="flex flex-wrap gap-2"
                >
                  {noteTexts.map((text, idx) => {
                    const isEditing = editingIndex === idx;
                    if (isEditing) {
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.98, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98, y: 4 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="flex items-center gap-2 rounded-full border border-teal-200/50 bg-white/70 px-2 py-1 dark:bg-white/5"
                        >
                          <input
                            className="w-40 bg-transparent px-2 py-1 text-xs text-teal-950 outline-none placeholder:text-teal-900/35 dark:text-white"
                            value={editingText}
                            autoFocus
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveEditing();
                              }
                              if (e.key === "Escape") {
                                e.preventDefault();
                                cancelEditing();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={saveEditing}
                            aria-label="حفظ الملاحظة"
                          >
                            <Check className="h-4 w-4 text-teal-700 dark:text-teal-200" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={cancelEditing}
                            aria-label="إلغاء تعديل الملاحظة"
                          >
                            <X className="h-4 w-4 text-rose-600" />
                          </Button>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.button
                        key={idx}
                        type="button"
                        layout
                        initial={{ opacity: 0, scale: 0.98, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 4 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="group flex items-center gap-2 rounded-full border border-teal-200/50 bg-white/70 px-3 py-1 text-xs text-teal-950 shadow-sm transition-colors hover:bg-teal-50/80 dark:bg-white/5 dark:text-white"
                        onClick={() => startEditing(idx)}
                      >
                        <span className="max-w-[210px] truncate">{text}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="حذف ملاحظة"
                          className="h-6 w-6 rounded-full opacity-70 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNoteAt(idx);
                          }}
                        >
                          <X className="h-4 w-4 text-rose-600" />
                        </Button>
                      </motion.button>
                    );
                  })}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {noteTexts.length === 0 && (
              <p className="text-xs text-teal-900/50 dark:text-white/45">
                مفيش ملاحظات لسه. اكتب واحدة فوق وادوس Enter.
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <Label>طريقة الاستخدام</Label>
        <textarea
          value={value.usage ?? ""}
          onChange={(e) => onChange({ ...value, usage: e.target.value })}
          rows={6}
          className="flex w-full rounded-2xl border border-teal-200/60 bg-white/90 px-4 py-3 text-sm text-teal-950 shadow-inner shadow-teal-900/5 transition-colors placeholder:text-teal-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
          placeholder="اكتب طريقة الاستخدام هنا..."
        />
      </div>
      <Button type="button" className="w-full" onClick={onSubmit}>
        حفظ
      </Button>
    </div>
  );
}
