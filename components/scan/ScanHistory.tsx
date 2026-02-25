import { useEffect } from "react";
import { useScanStore } from "@/hooks/use-scan";

export function ScanHistory() {
  const history = useScanStore((s) => s.history);
  const loadHistory = useScanStore((s) => s.loadScanHistory);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  if (history.length === 0) return null;

  return (
    <details className="rounded-lg border border-zinc-200 bg-white">
      <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-50">
        Scan history ({history.length})
      </summary>
      <div className="max-h-48 overflow-y-auto border-t border-zinc-100">
        {[...history].reverse().map((entry, i) => (
          <div
            key={entry.timestamp}
            className={`flex items-center justify-between px-3 py-1.5 text-xs ${
              i === 0 ? "bg-zinc-50 font-medium" : ""
            }`}
          >
            <span className="truncate text-zinc-600" title={entry.url}>
              {new URL(entry.url).hostname}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-zinc-500">
                {entry.totalNodes} issue{entry.totalNodes !== 1 && "s"}
              </span>
              <span className="text-zinc-400">
                {formatTime(entry.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}
