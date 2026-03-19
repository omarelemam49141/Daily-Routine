import { SEED_ROUTINES } from "@/data/seed";
import { RoutineDetailPageClient } from "./routine-detail-client";

export function generateStaticParams() {
  return SEED_ROUTINES.map((r) => ({ id: r.id }));
}

export default function RoutineDetailPage() {
  return <RoutineDetailPageClient />;
}
