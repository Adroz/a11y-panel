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

export interface ScanResult {
  violations: ScanViolation[];
  url: string;
  timestamp: number;
}

export const IMPACT_ORDER: Record<Impact, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};
