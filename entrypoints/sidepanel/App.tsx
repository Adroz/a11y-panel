import { useState } from "react";
import { PanelHeader } from "@/components/layout/PanelHeader";
import { PanelNav, type Tab } from "@/components/layout/PanelNav";
import { ScanSummary } from "@/components/scan/ScanSummary";
import { ScanDeltaCard } from "@/components/scan/ScanDelta";
import { FilterBar } from "@/components/scan/FilterBar";
import { HighlightToggle } from "@/components/scan/HighlightToggle";
import { ScanHistory } from "@/components/scan/ScanHistory";
import { ViolationList } from "@/components/results/ViolationList";
import { TabStopsToggle } from "@/components/scan/TabStopsToggle";
import { ChecklistView } from "@/components/checklist/ChecklistView";
import { ExportButtons } from "@/components/scan/ExportButtons";
import { useScanStore } from "@/hooks/use-scan";

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>("scan");
  const status = useScanStore((s) => s.status);
  const error = useScanStore((s) => s.error);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <PanelHeader />
      <PanelNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 space-y-3 p-4">
        {activeTab === "scan" && (
          <>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <ScanSummary />
            <ScanDeltaCard />
            <HighlightToggle />

            {status === "complete" && <FilterBar />}

            <ViolationList />
            <ExportButtons />
            <ScanHistory />

            {status === "idle" && (
              <p className="text-center text-sm text-zinc-400 pt-8">
                Run a scan to check for accessibility issues.
              </p>
            )}
          </>
        )}

        {activeTab === "tabstops" && (
          <>
            <TabStopsToggle />
            <p className="text-xs text-zinc-400">
              Visualises the keyboard tab order on the current page. Numbered
              circles show each focusable element, connected by lines showing
              the navigation sequence.
            </p>
          </>
        )}

        {activeTab === "checklist" && <ChecklistView />}
      </main>
    </div>
  );
}
