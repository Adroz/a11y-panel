import { PanelHeader } from "@/components/layout/PanelHeader";
import { ScanButton } from "@/components/scan/ScanButton";
import { ScanSummary } from "@/components/scan/ScanSummary";
import { ViolationList } from "@/components/results/ViolationList";
import { useScanStore } from "@/hooks/use-scan";

export function App() {
  const status = useScanStore((s) => s.status);
  const error = useScanStore((s) => s.error);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <PanelHeader />

      <main className="flex-1 space-y-3 p-4">
        <ScanButton />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <ScanSummary />
        <ViolationList />

        {status === "idle" && (
          <p className="text-center text-sm text-zinc-400 pt-8">
            Click "Scan Page" to check for accessibility issues.
          </p>
        )}
      </main>
    </div>
  );
}
