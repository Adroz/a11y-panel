import type { ContrastAuditResult } from "@/types/contrast";
import { ContrastFailureRow } from "./ContrastFailureRow";

interface ContrastFailureListProps {
  result: ContrastAuditResult;
}

export function ContrastFailureList({ result }: ContrastFailureListProps) {
  const { failures, undetermined } = result;

  if (failures.length === 0 && undetermined.length === 0) return null;

  return (
    <div className="space-y-3">
      {failures.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Failures ({failures.length})
          </h3>
          {failures.map((r, i) => (
            <ContrastFailureRow key={`${r.selector}-${i}`} result={r} />
          ))}
        </div>
      )}

      {undetermined.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Unable to determine ({undetermined.length})
          </h3>
          <p className="text-xs text-zinc-400">
            These elements have a background image that may affect contrast.
          </p>
          {undetermined.map((r, i) => (
            <ContrastFailureRow key={`${r.selector}-${i}`} result={r} />
          ))}
        </div>
      )}
    </div>
  );
}
