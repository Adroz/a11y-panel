import { useState, useEffect } from "react";
import { PanelHeader } from "@/components/layout/PanelHeader";
import { PanelNav, type Tab } from "@/components/layout/PanelNav";
import { ScanSummary } from "@/components/scan/ScanSummary";
import { ScanDeltaCard } from "@/components/scan/ScanDelta";
import { FilterBar } from "@/components/scan/FilterBar";
import { HighlightToggle } from "@/components/scan/HighlightToggle";
import { ScanHistory } from "@/components/scan/ScanHistory";
import { ViolationList } from "@/components/results/ViolationList";
import { TabStopsToggle } from "@/components/scan/TabStopsToggle";
import { TabStopList } from "@/components/tabstops/TabStopList";
import { ChecklistView } from "@/components/checklist/ChecklistView";
import { ExportButtons } from "@/components/scan/ExportButtons";
import { ContrastActions } from "@/components/contrast/ContrastActions";
import { ContrastSummary } from "@/components/contrast/ContrastSummary";
import { ContrastFailureList } from "@/components/contrast/ContrastFailureList";
import { ContrastPickerDetail } from "@/components/contrast/ContrastPickerDetail";
import { useScanStore } from "@/hooks/use-scan";
import { useSettingsStore } from "@/hooks/use-settings";
import { useTabStopsStore } from "@/hooks/use-tab-stops";
import { useContrastStore } from "@/hooks/use-contrast";

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>("scan");
  const status = useScanStore((s) => s.status);
  const error = useScanStore((s) => s.error);
  const tabStopsStatus = useTabStopsStore((s) => s.status);
  const loadSettings = useSettingsStore((s) => s.loadFromStorage);
  const contrastMode = useContrastStore((s) => s.mode);
  const contrastAuditResult = useContrastStore((s) => s.auditResult);
  const contrastError = useContrastStore((s) => s.error);
  const contrastReset = useContrastStore((s) => s.reset);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Disable contrast picker when navigating away from the Contrast tab
  useEffect(() => {
    if (activeTab !== "contrast" && contrastMode === "picker-active") {
      contrastReset();
    }
  }, [activeTab, contrastMode, contrastReset]);

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
            {tabStopsStatus === "on" && <TabStopList />}
            {tabStopsStatus !== "on" && (
              <p className="text-xs text-zinc-400">
                Visualises the keyboard tab order on the current page. Numbered
                circles show each focusable element, connected by lines showing
                the navigation sequence.
              </p>
            )}
          </>
        )}

        {activeTab === "contrast" && (
          <>
            <ContrastActions />
            <ContrastPickerDetail />

            {contrastError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {contrastError}
              </div>
            )}

            {contrastMode === "audit-complete" && contrastAuditResult && (
              <>
                <ContrastSummary result={contrastAuditResult} />
                <ContrastFailureList result={contrastAuditResult} />
              </>
            )}

            {contrastMode === "idle" && (
              <p className="text-center text-sm text-zinc-400 pt-8">
                Check page contrast or pick an element to inspect its colors.
              </p>
            )}
          </>
        )}

        {activeTab === "checklist" && <ChecklistView />}
      </main>
    </div>
  );
}
