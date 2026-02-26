import { useContrastStore } from "@/hooks/use-contrast";

export function ContrastActions() {
  const mode = useContrastStore((s) => s.mode);
  const runAudit = useContrastStore((s) => s.runAudit);
  const togglePicker = useContrastStore((s) => s.togglePicker);

  const isLoading = mode === "audit-loading";
  const isPickerActive = mode === "picker-active";

  return (
    <div className="flex gap-2">
      <button
        onClick={runAudit}
        disabled={isLoading}
        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
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
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        {isLoading ? "Checking\u2026" : "Check contrast"}
      </button>

      <button
        onClick={togglePicker}
        disabled={isLoading}
        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          isPickerActive
            ? "border-blue-300 bg-blue-50 text-blue-700"
            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
        }`}
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
          <path d="m2 2 8 3-1 1" />
          <path d="m22 22-8-3 1-1" />
          <path d="m7 7 1.5 1.5" />
          <path d="m15.5 15.5 1.5 1.5" />
          <path d="m18 4-4 4" />
          <path d="m10 14-4 4" />
        </svg>
        {isPickerActive ? "Stop picker" : "Pick element"}
      </button>
    </div>
  );
}
