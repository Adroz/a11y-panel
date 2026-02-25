import { create } from "zustand";
import type { ScanViolation, ScanResult, Impact } from "@/types/scan";
import type { ResponseMessage } from "@/types/messages";

type ScanStatus = "idle" | "scanning" | "complete" | "error";

interface ScanState {
  status: ScanStatus;
  violations: ScanViolation[];
  url: string | null;
  timestamp: number | null;
  error: string | null;
  highlightedSelector: string | null;

  startScan: () => void;
  handleScanResponse: (response: ResponseMessage) => void;
  setHighlighted: (selector: string | null) => void;
  reset: () => void;
}

export const useScanStore = create<ScanState>((set) => ({
  status: "idle",
  violations: [],
  url: null,
  timestamp: null,
  error: null,
  highlightedSelector: null,

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
      useScanStore.getState().handleScanResponse(response);
    });
  },

  handleScanResponse: (response) => {
    switch (response.type) {
      case "SCAN_COMPLETE":
        set({
          status: "complete",
          violations: response.violations,
          url: response.url,
          timestamp: response.timestamp,
          error: null,
        });
        break;
      case "SCAN_ERROR":
        set({ status: "error", error: response.error });
        break;
    }
  },

  setHighlighted: (selector) => {
    if (selector) {
      chrome.runtime.sendMessage({ type: "HIGHLIGHT_ELEMENT", selector });
    } else {
      chrome.runtime.sendMessage({ type: "CLEAR_HIGHLIGHTS" });
    }
    set({ highlightedSelector: selector });
  },

  reset: () =>
    set({
      status: "idle",
      violations: [],
      url: null,
      timestamp: null,
      error: null,
      highlightedSelector: null,
    }),
}));

// Summary helpers
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
