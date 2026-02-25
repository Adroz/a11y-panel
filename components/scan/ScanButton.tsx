import { useScanStore } from "@/hooks/use-scan";

export function ScanButton() {
  const status = useScanStore((s) => s.status);
  const startScan = useScanStore((s) => s.startScan);
  const isScanning = status === "scanning";

  return (
    <button
      onClick={startScan}
      disabled={isScanning}
      className="w-full cursor-pointer rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isScanning ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Scanning…
        </span>
      ) : (
        "Scan Page"
      )}
    </button>
  );
}
