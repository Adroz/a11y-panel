import { useScanStore } from "@/hooks/use-scan";
import { useChecklistStore } from "@/hooks/use-checklist";
import { exportJSON, exportHTML } from "@/lib/export";

export function ExportButtons() {
  const status = useScanStore((s) => s.status);
  const violations = useScanStore((s) => s.violations);
  const url = useScanStore((s) => s.url);
  const timestamp = useScanStore((s) => s.timestamp);
  const checklistStatuses = useChecklistStore((s) => s.statuses);

  if (status !== "complete") return null;

  const data = {
    url: url!,
    timestamp: timestamp!,
    violations,
    checklistStatuses,
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => exportHTML(data)}
        className="flex-1 cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
      >
        Export HTML
      </button>
      <button
        onClick={() => exportJSON(data)}
        className="flex-1 cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
      >
        Export JSON
      </button>
    </div>
  );
}
