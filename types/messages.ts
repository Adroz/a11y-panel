import type { Impact, ScanViolation } from "./scan";

export interface HighlightTarget {
  selector: string;
  impact: Impact;
}

// Side Panel → Background → Content Script
export type RequestMessage =
  | { type: "RUN_AXE_SCAN" }
  | { type: "HIGHLIGHT_ELEMENT"; selector: string; impact: Impact }
  | { type: "HIGHLIGHT_ALL"; targets: HighlightTarget[] }
  | { type: "CLEAR_HIGHLIGHTS" };

// Content Script → Background → Side Panel
export type ResponseMessage =
  | { type: "SCAN_STARTED" }
  | { type: "SCAN_COMPLETE"; violations: ScanViolation[]; url: string; timestamp: number }
  | { type: "SCAN_ERROR"; error: string }
  | { type: "HIGHLIGHT_APPLIED"; selector: string }
  | { type: "HIGHLIGHTS_APPLIED"; count: number }
  | { type: "HIGHLIGHTS_CLEARED" };

export type Message = RequestMessage | ResponseMessage;
