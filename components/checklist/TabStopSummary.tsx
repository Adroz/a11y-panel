import { useTabStopsStore } from "@/hooks/use-tab-stops";

interface TabStopSummaryProps {
  onNavigateToTabStops: () => void;
}

export function TabStopSummary({ onNavigateToTabStops }: TabStopSummaryProps) {
  const status = useTabStopsStore((s) => s.status);
  const stops = useTabStopsStore((s) => s.stops);
  const order = useTabStopsStore((s) => s.order);
  const traps = useTabStopsStore((s) => s.traps);

  const hasData = status === "on" || status === "hidden";

  if (!hasData || stops.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
        <p className="text-xs text-zinc-500">
          Tab stop order not captured.{" "}
          <button
            onClick={onNavigateToTabStops}
            className="cursor-pointer font-medium text-blue-600 hover:text-blue-800"
          >
            Go to Tab Stops
          </button>
        </p>
      </div>
    );
  }

  // Build ordered stops for display
  const selectorToStop = new Map(stops.map((s) => [s.selector, s]));
  const orderedStops = order.map((sel) => selectorToStop.get(sel)!).filter(Boolean);
  const preview = orderedStops.slice(0, 5);
  const remaining = orderedStops.length - preview.length;
  const trapCount = traps.length;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-blue-700">
          {orderedStops.length} tab stop{orderedStops.length !== 1 && "s"}
          {trapCount > 0 && (
            <span className="ml-1 text-red-600">
              ({trapCount} trap{trapCount !== 1 && "s"})
            </span>
          )}
        </p>
        <button
          onClick={onNavigateToTabStops}
          className="cursor-pointer text-[10px] font-medium text-blue-600 hover:text-blue-800"
        >
          View all
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {preview.map((stop) => {
          const label = stop.role || stop.tagName;
          return (
            <span
              key={stop.selector}
              className="inline-flex items-center gap-1 rounded bg-white/70 px-1.5 py-0.5"
            >
              <span className={`font-mono text-[10px] ${
                stop.role ? "text-violet-600" : "text-zinc-500"
              }`}>
                {label}
              </span>
              {stop.accessibleName && (
                <span className="max-w-[100px] truncate text-[10px] text-zinc-500">
                  {stop.accessibleName}
                </span>
              )}
            </span>
          );
        })}
        {remaining > 0 && (
          <span className="inline-flex items-center rounded bg-white/70 px-1.5 py-0.5 text-[10px] text-zinc-400">
            + {remaining} more
          </span>
        )}
      </div>
    </div>
  );
}
