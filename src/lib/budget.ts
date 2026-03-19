import type { Tool } from "@/types";

/** Estimated monthly cost based on price, quantity, and purchase cycle in days. */
export function toolMonthlyCost(
  tool: Tool,
  effectivePrice: number,
  quantity: number,
): number {
  if (effectivePrice <= 0) return 0;
  const days = tool.purchaseFrequencyDays;
  if (days <= 0) return 0;
  return (effectivePrice * quantity * 30) / days;
}

export function frequencyLabelAr(days: number): string {
  if (days <= 0) return "—";
  if (days === 1) return "يومياً";
  if (days <= 7) return `كل ${days} أيام`;
  if (days <= 30) return `كل ${days} يوم (~${Math.round(days / 7)} أسابيع)`;
  if (days <= 365) return `كل ${days} يوم (~${Math.round(days / 30)} شهور)`;
  return `كل ${days} يوم (~${Math.round(days / 365)} سنة)`;
}

export function categoryLabelAr(cat: Tool["category"]): string {
  const m: Record<Tool["category"], string> = {
    cleansing: "تنظيف",
    hairCare: "الشعر",
    skinCare: "البشرة",
    grooming: "الحلاقة والتهذيب",
    oralCare: "الفم",
    intimateCare: "مناطق حساسة",
    nailCare: "الأظافر",
    underwear: "ملابس داخلية",
    extra: "إضافي",
  };
  return m[cat];
}
