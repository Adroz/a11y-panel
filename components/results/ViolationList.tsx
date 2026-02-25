import { useScanStore } from "@/hooks/use-scan";
import { ViolationCard } from "./ViolationCard";

export function ViolationList() {
  const violations = useScanStore((s) => s.violations);
  const status = useScanStore((s) => s.status);

  if (status !== "complete" || violations.length === 0) return null;

  return (
    <div className="space-y-2">
      {violations.map((v) => (
        <ViolationCard key={v.id} violation={v} />
      ))}
    </div>
  );
}
