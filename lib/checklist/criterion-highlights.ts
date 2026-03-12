import type { ScanViolation, Impact, CustomCheckCounts } from "@/types/scan";
import type { HighlightTarget } from "@/types/messages";
import { AXE_TO_WCAG } from "./auto-populate";

/**
 * Parses a WCAG tag from an axe-core violation's tags array.
 * Tags follow patterns like "wcag111" (WCAG 1.1.1) or "wcag143" (WCAG 1.4.3).
 */
function parseWcagTag(tag: string): string | null {
  const match = tag.match(/^wcag(\d)(\d)(\d{1,2})$/);
  if (!match) return null;
  return `${match[1]}.${match[2]}.${match[3]}`;
}

function addCustomTargets(
  map: Map<string, HighlightTarget[]>,
  criterionId: string,
  selectors: string[] | undefined,
  impact: Impact,
) {
  if (!selectors?.length) return;
  let targets = map.get(criterionId);
  if (!targets) {
    targets = [];
    map.set(criterionId, targets);
  }
  for (const selector of selectors) {
    targets.push({ selector, impact });
  }
}

/**
 * Inverts scan violation data into a map from WCAG criterion ID → highlight targets.
 * For each violation, determines which criteria it maps to (via AXE_TO_WCAG + tag parsing),
 * then collects each affected node as a highlight target for that criterion.
 * Also merges selectors from custom WCAG checks when provided.
 */
export function buildCriterionHighlightMap(
  violations: ScanViolation[],
  customChecks?: CustomCheckCounts,
): Map<string, HighlightTarget[]> {
  const map = new Map<string, HighlightTarget[]>();

  for (const violation of violations) {
    // Collect all criterion IDs this violation maps to
    const criterionIds = new Set<string>();

    const mapped = AXE_TO_WCAG[violation.id];
    if (mapped) {
      for (const id of mapped) criterionIds.add(id);
    }

    for (const tag of violation.tags) {
      const id = parseWcagTag(tag);
      if (id) criterionIds.add(id);
    }

    // For each criterion, add all violation nodes as highlight targets
    for (const criterionId of criterionIds) {
      let targets = map.get(criterionId);
      if (!targets) {
        targets = [];
        map.set(criterionId, targets);
      }
      for (const node of violation.nodes) {
        targets.push({ selector: node.target[0], impact: violation.impact });
      }
    }
  }

  // Merge custom check selectors
  if (customChecks) {
    addCustomTargets(map, "2.1.2", customChecks.trapSelectors, "critical");
    addCustomTargets(map, "1.4.12", customChecks.textSpacingSelectors, "moderate");
    addCustomTargets(map, "2.4.3", customChecks.focusOrderSelectors, "moderate");
    addCustomTargets(map, "2.4.7", customChecks.focusVisibleSelectors, "serious");
    addCustomTargets(map, "2.1.1", customChecks.keyboardSelectors, "serious");
  }

  return map;
}
