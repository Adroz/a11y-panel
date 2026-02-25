import { useScanStore, useScanSummary } from "@/hooks/use-scan";
import { ImpactBadge } from "@/components/results/ImpactBadge";
import type { Impact } from "@/types/scan";

const IMPACTS: Impact[] = ["critical", "serious", "moderate", "minor"];

export function ScanSummary() {
  const status = useScanStore((s) => s.status);
  const url = useScanStore((s) => s.url);
  const { counts, totalNodes, ruleCount } = useScanSummary();

  if (status !== "complete") return null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="mb-3 text-xs text-zinc-500 truncate" title={url ?? undefined}>
        {url}
      </div>

      {totalNodes === 0 ? (
        <p className="text-sm font-medium text-emerald-700">
          No violations found!
        </p>
      ) : (
        <>
          <p className="mb-3 text-sm text-zinc-700">
            <span className="font-semibold">{totalNodes}</span> issue{totalNodes !== 1 && "s"} across{" "}
            <span className="font-semibold">{ruleCount}</span> rule{ruleCount !== 1 && "s"}
          </p>
          <div className="flex flex-wrap gap-2">
            {IMPACTS.map(
              (impact) =>
                counts[impact] > 0 && (
                  <ImpactBadge key={impact} impact={impact} count={counts[impact]} />
                ),
            )}
          </div>
        </>
      )}
    </div>
  );
}
