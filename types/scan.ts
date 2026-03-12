export type Impact = "critical" | "serious" | "moderate" | "minor";

export interface ScanNode {
  target: string[];
  html: string;
  failureSummary: string;
}

export interface ScanViolation {
  id: string;
  impact: Impact;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: ScanNode[];
}

export interface ScanPass {
  id: string;
  tags: string[];
}

export interface ScanResult {
  violations: ScanViolation[];
  passes: ScanPass[];
  url: string;
  timestamp: number;
}

export interface CustomCheckCounts {
  trapCount: number;
  textSpacingFailCount: number;
  focusOrderInversionCount: number;
  focusVisibleMissingCount: number;
  captionFailCount: number | null; // null = no videos on page
  keyboardFailCount: number | null; // null = no candidates found
  // Presence detection for N/A auto-population
  hasMedia: boolean; // true if page has <video> or <audio> elements
  hasFormFields: boolean; // true if page has <input>, <select>, or <textarea> elements
  // Selectors for highlighting (populated in content script, consumed by side panel)
  trapSelectors?: string[];
  textSpacingSelectors?: string[];
  focusOrderSelectors?: string[];
  focusVisibleSelectors?: string[];
  keyboardSelectors?: string[];
}

export const IMPACT_ORDER: Record<Impact, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};
