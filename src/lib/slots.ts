import type { TimeOfDay } from "@/types";

export function slotLabelAr(slot: TimeOfDay): string {
  switch (slot) {
    case "morning":
      return "صباحاً";
    case "evening":
      return "مساءً";
    case "anytime":
      return "أي وقت";
  }

  const _exhaustive: never = slot;
  return _exhaustive;
}

export function slotTimeAr(slot: TimeOfDay, morningTime: string, eveningTime: string): string {
  switch (slot) {
    case "morning":
      return morningTime;
    case "evening":
      return eveningTime;
    case "anytime":
      return "—";
  }

  const _exhaustive: never = slot;
  return _exhaustive;
}
