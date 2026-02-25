import { useEffect } from "react";
import { WCAG_CRITERIA, PRINCIPLES, type WcagPrinciple } from "@/lib/checklist";
import {
  useChecklistStore,
  useChecklistProgress,
  usePrincipleProgress,
} from "@/hooks/use-checklist";
import { useScanStore } from "@/hooks/use-scan";
import { ChecklistItem } from "./ChecklistItem";

export function ChecklistView() {
  const loadFromStorage = useChecklistStore((s) => s.loadFromStorage);
  const autoPopulate = useChecklistStore((s) => s.autoPopulateFromScan);
  const resetAll = useChecklistStore((s) => s.resetAll);
  const violations = useScanStore((s) => s.violations);
  const scanStatus = useScanStore((s) => s.status);
  const progress = useChecklistProgress();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="rounded-lg border border-zinc-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700">
            {progress.tested} of {progress.total} tested
          </span>
          <div className="flex gap-3 text-xs text-zinc-500">
            {progress.pass > 0 && <span className="text-emerald-600">{progress.pass} pass</span>}
            {progress.fail > 0 && <span className="text-red-600">{progress.fail} fail</span>}
            {progress.na > 0 && <span className="text-zinc-500">{progress.na} N/A</span>}
          </div>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-zinc-100">
          {progress.pass > 0 && (
            <div
              className="bg-emerald-500"
              style={{ width: `${(progress.pass / progress.total) * 100}%` }}
            />
          )}
          {progress.fail > 0 && (
            <div
              className="bg-red-500"
              style={{ width: `${(progress.fail / progress.total) * 100}%` }}
            />
          )}
          {progress.na > 0 && (
            <div
              className="bg-zinc-300"
              style={{ width: `${(progress.na / progress.total) * 100}%` }}
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {scanStatus === "complete" && (
          <button
            onClick={() => autoPopulate(violations)}
            className="cursor-pointer rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
          >
            Auto-populate from scan
          </button>
        )}
        <button
          onClick={resetAll}
          className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
        >
          Reset all
        </button>
      </div>

      {/* Principles */}
      {PRINCIPLES.map((principle) => (
        <PrincipleSection key={principle.value} principle={principle.value} label={principle.label} />
      ))}
    </div>
  );
}

function PrincipleSection({ principle, label }: { principle: WcagPrinciple; label: string }) {
  const progress = usePrincipleProgress(principle);
  const criteria = WCAG_CRITERIA.filter((c) => c.principle === principle);

  return (
    <details className="rounded-lg border border-zinc-200 bg-zinc-50" open>
      <summary className="cursor-pointer px-3 py-2 hover:bg-zinc-100">
        <span className="text-sm font-medium text-zinc-800">{label}</span>
        <span className="ml-2 text-xs text-zinc-500">
          {progress.pass + progress.fail + progress.na}/{progress.total}
        </span>
        {progress.fail > 0 && (
          <span className="ml-1 text-xs text-red-600">{progress.fail} fail</span>
        )}
      </summary>
      <div className="space-y-1 px-2 pb-2">
        {criteria.map((c) => (
          <ChecklistItem key={c.id} criterion={c} />
        ))}
      </div>
    </details>
  );
}
