import type { Result } from "axe-core";
import type { ScanViolation, ScanPass } from "@/types/scan";
import { IMPACT_ORDER, type Impact } from "@/types/scan";

export function mapAxeResults(violations: Result[]): ScanViolation[] {
  return violations
    .map((v): ScanViolation => ({
      id: v.id,
      impact: (v.impact as Impact) ?? "minor",
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      tags: v.tags,
      nodes: v.nodes.map((n) => ({
        target: n.target.map(String),
        html: n.html,
        failureSummary: n.failureSummary ?? "",
      })),
    }))
    .sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]);
}

export function mapAxePasses(passes: Result[]): ScanPass[] {
  return passes.map((p) => ({ id: p.id, tags: p.tags }));
}
