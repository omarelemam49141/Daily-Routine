import type { DueRoutineInstance, Routine, TimeOfDay } from "@/types";

function dayOfWeek(d: Date): number {
  return d.getDay();
}

function expandSlots(
  routine: Routine,
  slot: TimeOfDay,
): DueRoutineInstance | null {
  return {
    instanceKey: `${routine.id}:${slot}`,
    routineId: routine.id,
    name: routine.name,
    slot,
    importance: routine.importance,
    estimatedMinutes: routine.estimatedMinutes,
    area: routine.area,
  };
}

/**
 * Returns routine instances due on `date`.
 * `day` is JS: 0=Sunday ... 6=Saturday
 */
export function getDueInstancesForDate(
  date: Date,
  routines: Routine[],
): DueRoutineInstance[] {
  const dow = dayOfWeek(date);
  const out: DueRoutineInstance[] = [];

  const shampooDays = new Set<number>();
  for (const r of routines) {
    if (r.id === "hair-wash-day" && r.schedule.kind === "weeklyPattern") {
      r.schedule.daysOfWeek.forEach((d) => shampooDays.add(d));
    }
  }

  for (const r of routines) {
    if (r.id === "hair-rinse-days" && shampooDays.has(dow)) {
      continue;
    }
    const s = r.schedule;
    if (s.kind === "daily") {
      for (const slot of s.slots) {
        const inst = expandSlots(r, slot);
        if (inst) out.push(inst);
      }
      continue;
    }
    if (s.kind === "weekly" || s.kind === "weeklyPattern") {
      if (!s.daysOfWeek.includes(dow)) continue;
      for (const slot of s.slots) {
        const inst = expandSlots(r, slot);
        if (inst) out.push(inst);
      }
    }
  }

  return out;
}

export function sortInstancesBySlot(
  instances: DueRoutineInstance[],
): DueRoutineInstance[] {
  const order: Record<TimeOfDay, number> = {
    morning: 0,
    anytime: 1,
    evening: 2,
  };
  return [...instances].sort((a, b) => order[a.slot] - order[b.slot]);
}

const AR_DAY_SHORT = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

export function arabicDayName(d: Date): string {
  return AR_DAY_SHORT[d.getDay()];
}
