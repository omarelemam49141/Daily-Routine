export type ToolCategory =
  | "cleansing"
  | "hairCare"
  | "skinCare"
  | "grooming"
  | "oralCare"
  | "intimateCare"
  | "nailCare"
  | "underwear"
  | "extra";

export type Importance = "essential" | "important" | "bonus";

/** Number of days between purchases (e.g. 30 = monthly, 90 = quarterly). */
export type PurchaseFrequencyDays = number;

export type RoutineArea =
  | "shower"
  | "hands"
  | "hair"
  | "intimateAreas"
  | "face"
  | "oral"
  | "grooming"
  | "nails";

export type TimeOfDay = "morning" | "evening" | "anytime";

export type RoutineSchedule =
  | {
      kind: "daily";
      slots: TimeOfDay[];
    }
  | {
      kind: "weekly";
      daysOfWeek: number[];
      slots: TimeOfDay[];
    }
  | {
      kind: "weeklyPattern";
      /** e.g. shampoo 3x on Sat(6), Mon(1), Wed(3) */
      daysOfWeek: number[];
      slots: TimeOfDay[];
    };

export interface RoutineStep {
  order: number;
  title: string;
  description: string;
  durationMinutes?: number;
  warning?: string;
}

export interface Routine {
  id: string;
  name: string;
  area: RoutineArea;
  schedule: RoutineSchedule;
  importance: Importance;
  estimatedMinutes: number;
  steps: RoutineStep[];
  toolIds: string[];
  warnings: string[];
  tips: string[];
}

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  brand: string;
  alternativeBrand: string;
  price: number;
  purchaseFrequencyDays: PurchaseFrequencyDays;
  importance: Importance;
  notes: string;
  usage?: string;
}

export interface ToolPriceOverride {
  toolId: string;
  price: number;
  quantity: number;
  lastUpdated: string;
}

export interface CompletionEntry {
  key: string;
  routineId: string;
  slot?: TimeOfDay;
  date: string;
  completed: boolean;
  completedAt?: string;
}

/** Expanded instance for a specific day + slot */
export interface DueRoutineInstance {
  instanceKey: string;
  routineId: string;
  name: string;
  slot: TimeOfDay;
  importance: Importance;
  estimatedMinutes: number;
  area: RoutineArea;
}
