import { useState } from "react";
import type { WcagCriterion } from "@/lib/checklist";
import { useChecklistStore } from "@/hooks/use-checklist";
import { StatusButton } from "./StatusButton";

interface ChecklistItemProps {
  criterion: WcagCriterion;
}

export function ChecklistItem({ criterion }: ChecklistItemProps) {
  const [expanded, setExpanded] = useState(false);
  const status = useChecklistStore((s) => s.statuses[criterion.id]);
  const autoPopulated = useChecklistStore((s) => s.autoPopulated);
  const setStatus = useChecklistStore((s) => s.setStatus);

  const isAuto = autoPopulated.has(criterion.id);

  return (
    <div className="rounded border border-zinc-200 bg-white">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
        >
          <svg
            className={`h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform ${expanded ? "rotate-90" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="shrink-0 text-xs font-mono text-zinc-400">{criterion.id}</span>
          <span className="truncate text-sm text-zinc-800">{criterion.name}</span>
          <span className="shrink-0 rounded bg-zinc-100 px-1 text-[10px] font-medium text-zinc-500">
            {criterion.level}
          </span>
          {criterion.canAutoDetect && (
            <span className="shrink-0 text-[10px] text-blue-500" title="Can be partially auto-detected by scan">
              auto
            </span>
          )}
        </button>
        <StatusButton
          currentStatus={status}
          onStatusChange={(s) => setStatus(criterion.id, s)}
          isAutoPopulated={isAuto}
        />
      </div>

      {expanded && (
        <div className="border-t border-zinc-100 px-3 pb-3 pt-2">
          <p className="mb-2 text-xs text-zinc-600">{criterion.description}</p>

          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-500">Testing steps:</p>
            <ol className="list-inside list-decimal space-y-1">
              {criterion.testingSteps.map((step, i) => (
                <li key={i} className="text-xs text-zinc-600">{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
