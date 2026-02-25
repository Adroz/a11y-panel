import { useScanStore, useFilteredViolations } from "@/hooks/use-scan";
import { ViolationCard } from "./ViolationCard";

export function ViolationList() {
  const status = useScanStore((s) => s.status);
  const allViolations = useScanStore((s) => s.violations);
  const filtered = useFilteredViolations();

  if (status !== "complete" || allViolations.length === 0) return null;

  return (
    <div className="space-y-2">
      <span className="text-xs text-zinc-500">
        {filtered.length} of {allViolations.length} rule{allViolations.length !== 1 && "s"}
      </span>

      {filtered.map((v) => (
        <ViolationCard key={v.id} violation={v} />
      ))}
    </div>
  );
}
