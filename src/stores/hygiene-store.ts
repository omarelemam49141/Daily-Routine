"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { format, subDays, parseISO, isValid } from "date-fns";
import { SEED_ROUTINES, SEED_TOOLS } from "@/data/seed";
import {
  getDueInstancesForDate,
  sortInstancesBySlot,
} from "@/lib/schedule";
import type {
  DueRoutineInstance,
  Importance,
  Routine,
  Tool,
  ToolPriceOverride,
} from "@/types";

const STORAGE_KEY = "hygiene-routine-v2";

const FREQ_TO_DAYS: Record<string, number> = {
  monthly: 30,
  quarterly: 90,
  biannual: 180,
  annual: 365,
  oneTime: 730,
};

/** Migrate tools that still carry the old string `purchaseFrequency` field,
 *  and inject any new seed tools that don't exist in localStorage yet. */
function migrateTools(tools: Tool[]): Tool[] {
  const migrated = tools.map((t) => {
    const asAny = t as unknown as { purchaseFrequency?: unknown; purchaseFrequencyDays?: number };
    const legacy = asAny.purchaseFrequency;
    if (typeof legacy === "string" && !asAny.purchaseFrequencyDays) {
      const days = FREQ_TO_DAYS[legacy] ?? 30;
      return { ...t, purchaseFrequencyDays: days } as Tool;
    }
    return t;
  });

  const existingIds = new Set(migrated.map((t) => t.id));
  const newFromSeed = SEED_TOOLS.filter((st) => !existingIds.has(st.id));
  if (newFromSeed.length > 0) {
    return [...migrated, ...newFromSeed];
  }
  return migrated;
}

export function toDateKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/** Stable key for `completions` map — use in UI selectors so toggles re-render. */
export function completionMapKey(dateKey: string, instanceKey: string): string {
  return `${dateKey}::${instanceKey}`;
}

function completionStorageKey(dateKey: string, instanceKey: string): string {
  return completionMapKey(dateKey, instanceKey);
}

interface HygieneState {
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  tools: Tool[];
  routines: Routine[];
  priceOverrides: Record<string, ToolPriceOverride>;
  /** completion keys: date::instanceKey */
  completions: Record<string, boolean>;
  resetToSeed: () => void;
  isCompleted: (dateKey: string, instanceKey: string) => boolean;
  toggleCompletion: (dateKey: string, instanceKey: string) => void;
  updateTool: (id: string, patch: Partial<Tool>) => void;
  addTool: (tool: Tool) => void;
  removeTool: (id: string) => void;
  setPriceOverride: (
    toolId: string,
    price: number,
    quantity: number,
  ) => void;
  getEffectivePrice: (toolId: string) => number;
  getDueToday: (date?: Date) => DueRoutineInstance[];
  getProgressToday: (date?: Date) => { done: number; total: number; ratio: number };
  getStreak: () => number;
  getNextIncomplete: (date?: Date) => DueRoutineInstance | null;
}

function onlyEssentialDue(date: Date, routines: HygieneState["routines"]) {
  return getDueInstancesForDate(date, routines).filter(
    (i) => i.importance === "essential",
  );
}

function dayFullyCompleteEssential(
  dateKey: string,
  routines: HygieneState["routines"],
  completions: Record<string, boolean>,
): boolean {
  const d = parseISO(dateKey);
  if (!isValid(d)) return false;
  const essential = onlyEssentialDue(d, routines);
  if (essential.length === 0) return false;
  return essential.every((inst) =>
    Boolean(completions[completionStorageKey(dateKey, inst.instanceKey)]),
  );
}

export const useHygieneStore = create<HygieneState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),

      tools: SEED_TOOLS,
      routines: SEED_ROUTINES,
      priceOverrides: {},
      completions: {},

      resetToSeed: () =>
        set({
          tools: SEED_TOOLS.map((t) => ({ ...t })),
          routines: SEED_ROUTINES.map((r) => ({
            ...r,
            steps: r.steps.map((s) => ({ ...s })),
          })),
          priceOverrides: {},
          completions: {},
        }),

      isCompleted: (dateKey, instanceKey) =>
        Boolean(get().completions[completionStorageKey(dateKey, instanceKey)]),

      toggleCompletion: (dateKey, instanceKey) => {
        const k = completionStorageKey(dateKey, instanceKey);
        set((s) => ({
          completions: {
            ...s.completions,
            [k]: !s.completions[k],
          },
        }));
      },

      updateTool: (id, patch) =>
        set((s) => ({
          tools: s.tools.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      addTool: (tool) =>
        set((s) => ({
          tools: [...s.tools, tool],
        })),

      removeTool: (id) =>
        set((s) => ({
          tools: s.tools.filter((t) => t.id !== id),
        })),

      setPriceOverride: (toolId, price, quantity) =>
        set((s) => ({
          priceOverrides: {
            ...s.priceOverrides,
            [toolId]: {
              toolId,
              price,
              quantity,
              lastUpdated: new Date().toISOString(),
            },
          },
        })),

      getEffectivePrice: (toolId) => {
        const t = get().tools.find((x) => x.id === toolId);
        const o = get().priceOverrides[toolId];
        if (o) return o.price;
        return t?.price ?? 0;
      },

      getDueToday: (date = new Date()) => {
        return getDueInstancesForDate(date, get().routines);
      },

      getProgressToday: (date = new Date()) => {
        const dateKey = toDateKey(date);
        const due = get().getDueToday(date);
        const done = due.filter((i) =>
          get().isCompleted(dateKey, i.instanceKey),
        ).length;
        const total = due.length;
        return {
          done,
          total,
          ratio: total === 0 ? 0 : done / total,
        };
      },

      getStreak: () => {
        const routines = get().routines;
        const completions = get().completions;
        let streak = 0;
        for (let i = 0; i < 365; i++) {
          const d = subDays(new Date(), i);
          const dk = toDateKey(d);
          if (dayFullyCompleteEssential(dk, routines, completions)) {
            streak += 1;
          } else {
            break;
          }
        }
        return streak;
      },

      getNextIncomplete: (date = new Date()) => {
        const dateKey = toDateKey(date);
        const sorted = getDueInstancesForDate(date, get().routines);
        const ordered = sortInstancesBySlot(sorted);
        return (
          ordered.find(
            (i) => !get().isCompleted(dateKey, i.instanceKey),
          ) ?? null
        );
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        tools: s.tools,
        routines: s.routines,
        priceOverrides: s.priceOverrides,
        completions: s.completions,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.tools = migrateTools(state.tools);
        }
        state?.setHydrated(true);
      },
    },
  ),
);

export function importanceLabel(i: Importance): string {
  switch (i) {
    case "essential":
      return "أساسي";
    case "important":
      return "مهم";
    case "bonus":
      return "بونص";
    default:
      return i;
  }
}

export function importanceBadgeClass(i: Importance): string {
  switch (i) {
    case "essential":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
    case "important":
      return "bg-sky-500/15 text-sky-800 dark:text-sky-200 border-sky-500/30";
    case "bonus":
      return "bg-violet-500/15 text-violet-800 dark:text-violet-200 border-violet-500/30";
    default:
      return "";
  }
}
