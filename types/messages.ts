import type { ScanViolation } from "./scan";

// Side Panel → Background → Content Script
export type RequestMessage =
  | { type: "RUN_AXE_SCAN" }
  | { type: "HIGHLIGHT_ELEMENT"; selector: string }
  | { type: "CLEAR_HIGHLIGHTS" };

// Content Script → Background → Side Panel
export type ResponseMessage =
  | { type: "SCAN_STARTED" }
  | { type: "SCAN_COMPLETE"; violations: ScanViolation[]; url: string; timestamp: number }
  | { type: "SCAN_ERROR"; error: string }
  | { type: "HIGHLIGHT_APPLIED"; selector: string }
  | { type: "HIGHLIGHTS_CLEARED" };

export type Message = RequestMessage | ResponseMessage;
