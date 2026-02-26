import type { Impact, ScanViolation } from "./scan";
import type { ContrastAuditResult, ContrastPickerResult } from "./contrast";

export interface HighlightTarget {
  selector: string;
  impact: Impact;
}

export interface FocusTrapInfo {
  selector: string;
  tabStopIndices: number[];
}

export interface SerializedTabStop {
  index: number;
  selector: string;
  tagName: string;
  accessibleName: string;
  role: string;
  trapSelector: string | null;
}

// Side Panel → Background → Content Script
export type RequestMessage =
  | { type: "RUN_AXE_SCAN" }
  | { type: "HIGHLIGHT_ELEMENT"; selector: string; impact: Impact }
  | { type: "HIGHLIGHT_ALL"; targets: HighlightTarget[] }
  | { type: "CLEAR_HIGHLIGHTS" }
  | { type: "ENABLE_TAB_STOPS" }
  | { type: "DISABLE_TAB_STOPS" }
  | { type: "HIGHLIGHT_TAB_STOP"; selector: string }
  | { type: "CLEAR_TAB_STOP_HIGHLIGHT" }
  | { type: "REORDER_TAB_STOPS"; order: string[] }
  | { type: "RUN_CONTRAST_AUDIT" }
  | { type: "ENABLE_CONTRAST_PICKER" }
  | { type: "DISABLE_CONTRAST_PICKER" }
  | { type: "HIGHLIGHT_CONTRAST_ELEMENT"; selector: string }
  | { type: "CLEAR_CONTRAST_HIGHLIGHT" }
  | { type: "CAPTURE_TAB_SCREENSHOT" }
  | { type: "ENABLE_PIXEL_PICKER"; screenshotDataUrl: string }
  | { type: "DISABLE_PIXEL_PICKER" };

// Content Script → Background → Side Panel
export type ResponseMessage =
  | { type: "SCAN_STARTED" }
  | { type: "SCAN_COMPLETE"; violations: ScanViolation[]; url: string; timestamp: number }
  | { type: "SCAN_ERROR"; error: string }
  | { type: "HIGHLIGHT_APPLIED"; selector: string }
  | { type: "HIGHLIGHTS_APPLIED"; count: number }
  | { type: "HIGHLIGHTS_CLEARED" }
  | { type: "TAB_STOPS_ENABLED"; count: number; traps: FocusTrapInfo[]; stops: SerializedTabStop[] }
  | { type: "TAB_STOPS_DISABLED" }
  | { type: "TAB_STOPS_ERROR"; error: string }
  | { type: "TAB_STOP_HIGHLIGHTED" }
  | { type: "TAB_STOP_HIGHLIGHT_CLEARED" }
  | { type: "TAB_STOPS_REORDERED" }
  | { type: "CONTRAST_AUDIT_COMPLETE"; result: ContrastAuditResult }
  | { type: "CONTRAST_AUDIT_ERROR"; error: string }
  | { type: "CONTRAST_PICKER_ENABLED" }
  | { type: "CONTRAST_PICKER_DISABLED" }
  | { type: "CONTRAST_PICKER_RESULT"; result: ContrastPickerResult }
  | { type: "TAB_SCREENSHOT_CAPTURED"; dataUrl: string }
  | { type: "TAB_SCREENSHOT_ERROR"; error: string }
  | { type: "PIXEL_PICKER_ENABLED" }
  | { type: "PIXEL_PICKER_DISABLED" }
  | { type: "PIXEL_PICKED"; hex: string };

export type Message = RequestMessage | ResponseMessage;
