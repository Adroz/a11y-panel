import { useScanStore } from "@/hooks/use-scan";

export function ScanDeltaCard() {
  const delta = useScanStore((s) => s.delta);

  if (!delta) return null;

  const hasChanges = delta.newViolations.length > 0 || delta.fixedViolations.length > 0;

  if (!hasChanges) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
        No changes since last scan.
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {delta.fixedViolations.length > 0 && (
        <div className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center">
          <div className="text-lg font-bold text-emerald-700">
            -{delta.fixedViolations.length}
          </div>
          <div className="text-xs text-emerald-600">
            fixed ({delta.fixedNodeCount} elements)
          </div>
        </div>
      )}
      {delta.newViolations.length > 0 && (
        <div className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center">
          <div className="text-lg font-bold text-red-700">
            +{delta.newViolations.length}
          </div>
          <div className="text-xs text-red-600">
            new ({delta.newNodeCount} elements)
          </div>
        </div>
      )}
    </div>
  );
}
