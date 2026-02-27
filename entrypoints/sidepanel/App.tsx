import { useState, useEffect, useRef, useCallback } from "react";
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
import { ContrastActions, type ContrastView } from "@/components/contrast/ContrastActions";
import { ContrastSummary } from "@/components/contrast/ContrastSummary";
import { ContrastFailureList } from "@/components/contrast/ContrastFailureList";
import { ContrastPickerDetail } from "@/components/contrast/ContrastPickerDetail";
import { SwatchGrid } from "@/components/contrast/SwatchGrid";
import { SwatchComparison } from "@/components/contrast/SwatchComparison";
import { InspectorToggle } from "@/components/inspector/InspectorToggle";
import { InspectorDetail } from "@/components/inspector/InspectorDetail";
import { useScanStore } from "@/hooks/use-scan";
import { useSettingsStore } from "@/hooks/use-settings";
import { useTabStopsStore } from "@/hooks/use-tab-stops";
import { useContrastStore } from "@/hooks/use-contrast";
import { useColorPickerStore } from "@/hooks/use-color-picker";
import { useInspectorStore } from "@/hooks/use-inspector";

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>("scan");
  const [contrastView, setContrastView] = useState<ContrastView>("checker");
  const prevTabRef = useRef<Tab>("scan");
  const status = useScanStore((s) => s.status);
  const startScan = useScanStore((s) => s.startScan);
  const error = useScanStore((s) => s.error);
  const tabStopsStatus = useTabStopsStore((s) => s.status);
  const tabStopsHide = useTabStopsStore((s) => s.hide);
  const tabStopsShow = useTabStopsStore((s) => s.show);
  const tabStopsEnable = useTabStopsStore((s) => s.enable);
  const tabStopsAutoShow = useTabStopsStore((s) => s.autoShowPreference);
  const loadTabStopsPreference = useTabStopsStore((s) => s.loadPreference);
  const loadSettings = useSettingsStore((s) => s.loadFromStorage);
  const showInspector = useSettingsStore((s) => s.showInspector);
  const contrastMode = useContrastStore((s) => s.mode);
  const contrastAuditResult = useContrastStore((s) => s.auditResult);
  const contrastError = useContrastStore((s) => s.error);
  const contrastReset = useContrastStore((s) => s.reset);
  const runAudit = useContrastStore((s) => s.runAudit);
  const pixelPickerMode = useColorPickerStore((s) => s.pickerMode);
  const pixelPickerError = useColorPickerStore((s) => s.pickerError);
  const pixelPickerReset = useColorPickerStore((s) => s.reset);
  const swatches = useColorPickerStore((s) => s.swatches);
  const comparisonPairs = useColorPickerStore((s) => s.comparisonPairs);
  const pickerResult = useContrastStore((s) => s.pickerResult);
  const inspectorMode = useInspectorStore((s) => s.mode);
  const inspectorResult = useInspectorStore((s) => s.result);
  const inspectorToggle = useInspectorStore((s) => s.toggle);
  const inspectorReset = useInspectorStore((s) => s.reset);

  useEffect(() => {
    loadSettings();
    loadTabStopsPreference();
  }, [loadSettings, loadTabStopsPreference]);

  // Handle tab switches
  useEffect(() => {
    const prevTab = prevTabRef.current;
    prevTabRef.current = activeTab;

    if (prevTab === activeTab) return;

    // Hide tab stop overlay when leaving Tab Stops tab (preserve data)
    if (prevTab === "tabstops" && tabStopsStatus === "on") {
      tabStopsHide();
    }

    // Clean up pickers when leaving Contrast tab
    if (prevTab === "contrast") {
      if (contrastMode === "picker-active") contrastReset();
      if (pixelPickerMode === "active") pixelPickerReset();
    }

    // Clean up inspector when leaving Inspect tab
    if (prevTab === "inspect" && inspectorMode === "active") {
      inspectorReset();
    }

    // Clear checklist highlights when leaving Checklist tab
    if (prevTab === "checklist") {
      chrome.runtime.sendMessage({ type: "CLEAR_HIGHLIGHTS" }).catch(() => {});
    }

    // Auto-show/enable tab stops when entering Tab Stops tab
    if (activeTab === "tabstops") {
      if (tabStopsStatus === "hidden") {
        tabStopsShow();
      } else if (tabStopsStatus === "off" && tabStopsAutoShow) {
        tabStopsEnable();
      }
    }

    // Auto-run contrast checker when entering Contrast tab for the first time
    if (activeTab === "contrast" && contrastView === "checker" && !contrastAuditResult) {
      runAudit();
    }

    // Auto-start inspector when entering Inspect tab
    if (activeTab === "inspect" && inspectorMode === "idle") {
      inspectorToggle();
    }
  }, [activeTab, tabStopsStatus, tabStopsHide, tabStopsShow, tabStopsEnable, tabStopsAutoShow, contrastMode, contrastReset, pixelPickerMode, pixelPickerReset, contrastView, contrastAuditResult, runAudit, inspectorMode, inspectorReset, inspectorToggle]);

  const navigateToTabStops = useCallback(() => setActiveTab("tabstops"), []);

  const activeError =
    (contrastView === "checker" && contrastError) ||
    (contrastView === "color-picker" && pixelPickerError);

  return (
    <div className="flex h-screen flex-col bg-zinc-50">
      <PanelHeader />
      <PanelNav activeTab={activeTab} onTabChange={setActiveTab} hiddenTabs={showInspector ? [] : ["inspect"]} />

      <main className="flex-1 space-y-3 overflow-y-auto p-4">
        {activeTab === "scan" && (
          <>
            <button
              onClick={startScan}
              disabled={status === "scanning"}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "scanning" ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Scanning…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Scan page
                </>
              )}
            </button>

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
            {(tabStopsStatus === "on" || tabStopsStatus === "hidden") && <TabStopList />}
            {tabStopsStatus !== "on" && tabStopsStatus !== "hidden" && (
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
            <ContrastActions activeView={contrastView} onViewChange={setContrastView} />

            {activeError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {activeError}
              </div>
            )}

            {contrastView === "checker" && contrastAuditResult && (
              <>
                <ContrastSummary result={contrastAuditResult} />
                <ContrastFailureList result={contrastAuditResult} />
              </>
            )}

            {contrastView === "element-picker" && (
              <>
                <ContrastPickerDetail />
                {!pickerResult && (
                  <p className="text-center text-sm text-zinc-400 pt-8">
                    Click an element on the page to inspect its colours.
                  </p>
                )}
              </>
            )}

            {contrastView === "color-picker" && (
              <>
                {swatches.length > 0 && <SwatchGrid />}
                {comparisonPairs.length > 0 && <SwatchComparison />}
                {swatches.length === 0 && (
                  <p className="text-center text-sm text-zinc-400 pt-8">
                    Click colours on the page to add them as swatches.
                  </p>
                )}
              </>
            )}
          </>
        )}

        {activeTab === "inspect" && (
          <>
            <InspectorToggle />
            <InspectorDetail />
            {inspectorMode === "active" && !inspectorResult && (
              <p className="text-center text-sm text-zinc-400 pt-8">
                Click an element on the page to inspect its accessibility properties.
              </p>
            )}
          </>
        )}

        {activeTab === "checklist" && <ChecklistView onNavigateToTabStops={navigateToTabStops} />}
      </main>
    </div>
  );
}
