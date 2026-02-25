import { create } from "zustand";
import type { ScanViolation, Impact } from "@/types/scan";
import type { HighlightTarget, ResponseMessage } from "@/types/messages";
import type { FilterState, WcagCategory } from "@/lib/filters";
import { applyFilters } from "@/lib/filters";
import { loadHistory, computeDelta, type HistoryEntry, type ScanDelta } from "@/lib/history";

type ScanStatus = "idle" | "scanning" | "complete" | "error";

interface ScanState {
  // Scan
  status: ScanStatus;
  violations: ScanViolation[];
  url: string | null;
  timestamp: number | null;
  error: string | null;

  // Highlight
  highlightedSelector: string | null;
  persistentHighlightOn: boolean;

  // Filters
  filters: FilterState;

  // History
  history: HistoryEntry[];
  delta: ScanDelta | null;

  // Actions
  startScan: () => void;
  handleScanResponse: (response: ResponseMessage) => void;
  setHighlighted: (selector: string | null, impact?: Impact) => void;
  togglePersistentHighlight: () => void;
  toggleImpactFilter: (impact: Impact) => void;
  toggleCategoryFilter: (category: WcagCategory) => void;
  clearFilters: () => void;
  loadScanHistory: () => void;
  reset: () => void;
}

export const useScanStore = create<ScanState>((set, get) => ({
  status: "idle",
  violations: [],
  url: null,
  timestamp: null,
  error: null,
  highlightedSelector: null,
  persistentHighlightOn: false,
  filters: { impacts: new Set(), categories: new Set() },
  history: [],
  delta: null,

  startScan: () => {
    set({ status: "scanning", error: null });
    chrome.runtime.sendMessage({ type: "RUN_AXE_SCAN" }, (response: ResponseMessage) => {
      if (chrome.runtime.lastError) {
        set({
          status: "error",
          error: chrome.runtime.lastError.message ?? "Connection failed",
        });
        return;
      }
      get().handleScanResponse(response);
    });
  },

  handleScanResponse: (response) => {
    switch (response.type) {
      case "SCAN_COMPLETE": {
        const { history } = get();
        const lastEntry = history[history.length - 1];
        const delta = lastEntry
          ? computeDelta(response.violations, lastEntry.violations)
          : null;

        set({
          status: "complete",
          violations: response.violations,
          url: response.url,
          timestamp: response.timestamp,
          error: null,
          delta,
          persistentHighlightOn: false,
          highlightedSelector: null,
        });

        // Reload history after background persists the new result
        setTimeout(() => get().loadScanHistory(), 500);
        break;
      }
      case "SCAN_ERROR":
        set({ status: "error", error: response.error });
        break;
    }
  },

  setHighlighted: (selector, impact) => {
    if (selector && impact) {
      chrome.runtime.sendMessage({ type: "HIGHLIGHT_ELEMENT", selector, impact }).catch(() => {});
    } else {
      chrome.runtime.sendMessage({ type: "CLEAR_HIGHLIGHTS" }).catch(() => {});
    }
    set({ highlightedSelector: selector });
  },

  togglePersistentHighlight: () => {
    const { persistentHighlightOn, violations, filters } = get();
    const newState = !persistentHighlightOn;

    if (newState) {
      const filtered = applyFilters(violations, filters);
      const targets: HighlightTarget[] = filtered.flatMap((v) =>
        v.nodes.map((n) => ({ selector: n.target[0], impact: v.impact })),
      );
      chrome.runtime.sendMessage({ type: "HIGHLIGHT_ALL", targets }).catch(() => {});
    } else {
      chrome.runtime.sendMessage({ type: "CLEAR_HIGHLIGHTS" }).catch(() => {});
    }

    set({ persistentHighlightOn: newState, highlightedSelector: null });
  },

  toggleImpactFilter: (impact) => {
    const { filters } = get();
    const next = new Set(filters.impacts);
    if (next.has(impact)) next.delete(impact);
    else next.add(impact);
    set({ filters: { ...filters, impacts: next } });
  },

  toggleCategoryFilter: (category) => {
    const { filters } = get();
    const next = new Set(filters.categories);
    if (next.has(category)) next.delete(category);
    else next.add(category);
    set({ filters: { ...filters, categories: next } });
  },

  clearFilters: () => {
    set({ filters: { impacts: new Set(), categories: new Set() } });
  },

  loadScanHistory: () => {
    loadHistory().then((history) => set({ history }));
  },

  reset: () => {
    chrome.runtime.sendMessage({ type: "CLEAR_HIGHLIGHTS" }).catch(() => {});
    set({
      status: "idle",
      violations: [],
      url: null,
      timestamp: null,
      error: null,
      highlightedSelector: null,
      persistentHighlightOn: false,
      filters: { impacts: new Set(), categories: new Set() },
      delta: null,
    });
  },
}));

// Derived data hooks
export function useFilteredViolations() {
  const violations = useScanStore((s) => s.violations);
  const filters = useScanStore((s) => s.filters);
  return applyFilters(violations, filters);
}

export function useScanSummary() {
  const violations = useScanStore((s) => s.violations);
  const counts: Record<Impact, number> = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  let totalNodes = 0;

  for (const v of violations) {
    counts[v.impact] += v.nodes.length;
    totalNodes += v.nodes.length;
  }

  return { counts, totalNodes, ruleCount: violations.length };
}
