import { useScanStore } from "@/hooks/use-scan";
import { SettingsMenu } from "./SettingsMenu";

export function PanelHeader() {
  const status = useScanStore((s) => s.status);
  const startScan = useScanStore((s) => s.startScan);
  const isScanning = status === "scanning";

  return (
    <header className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-3">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-zinc-700"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m16 10-5.12 6-2.88-3" />
      </svg>
      <h1 className="text-base font-semibold text-zinc-900">A11y Checker</h1>

      <div className="ml-auto flex items-center gap-2">
        <SettingsMenu />
        <button
          onClick={startScan}
          disabled={isScanning}
          className="flex cursor-pointer items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Scanning…
            </>
          ) : (
            <>
              Scan
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
