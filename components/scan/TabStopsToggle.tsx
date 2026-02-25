import { useTabStopsStore } from "@/hooks/use-tab-stops";

export function TabStopsToggle() {
  const status = useTabStopsStore((s) => s.status);
  const count = useTabStopsStore((s) => s.count);
  const error = useTabStopsStore((s) => s.error);
  const toggle = useTabStopsStore((s) => s.toggle);

  const isOn = status === "on";
  const isLoading = status === "loading";

  return (
    <div className="space-y-2">
      <button
        onClick={toggle}
        disabled={isLoading}
        className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
          isOn
            ? "border-blue-300 bg-blue-50 text-blue-700"
            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        {isLoading ? "Loading…" : isOn ? "Hide tab stops" : "Show tab stops"}
      </button>

      {isOn && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">{count}</span> tab stop{count !== 1 && "s"} found
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
