import type { ScanViolation, ScanPass, CustomCheckCounts } from "@/types/scan";
import { WCAG_CRITERIA } from "./criteria";

/**
 * Maps axe-core rule IDs to their corresponding WCAG 2.1 success criterion IDs.
 * This allows automated scan results to pre-populate the manual checklist.
 */
export const AXE_TO_WCAG: Record<string, string[]> = {
  // 1.1.1 Non-text Content
  "image-alt": ["1.1.1"],
  "input-image-alt": ["1.1.1"],
  "area-alt": ["1.1.1"],
  "object-alt": ["1.1.1"],
  "svg-img-alt": ["1.1.1"],
  "role-img-alt": ["1.1.1"],

  // 1.2.2 Captions (Prerecorded)
  "video-caption": ["1.2.2"],

  // 1.2.3 Audio Description or Media Alternative
  "video-description": ["1.2.3", "1.2.5"],

  // 1.3.1 Info and Relationships
  "aria-required-parent": ["1.3.1"],
  "aria-required-children": ["1.3.1"],
  "definition-list": ["1.3.1"],
  "dlitem": ["1.3.1"],
  "list": ["1.3.1"],
  "listitem": ["1.3.1"],
  "th-has-data-cells": ["1.3.1"],
  "td-headers-attr": ["1.3.1"],
  "td-has-header": ["1.3.1"],
  "table-fake-caption": ["1.3.1"],
  "p-as-heading": ["1.3.1"],
  label: ["1.3.1", "4.1.2"],
  "input-button-name": ["1.3.1", "4.1.2"],

  // 1.3.4 Orientation
  "css-orientation-lock": ["1.3.4"],

  // 1.3.5 Identify Input Purpose
  "autocomplete-valid": ["1.3.5"],

  // 1.4.1 Use of Color
  "link-in-text-block": ["1.4.1"],

  // 1.4.3 Contrast (Minimum)
  "color-contrast": ["1.4.3"],

  // 1.4.5 Images of Text
  "text-in-image": ["1.4.5"],

  // 1.4.4 Resize Text
  "meta-viewport": ["1.4.4"],

  // 1.4.10 Reflow
  "meta-viewport-large": ["1.4.10"],

  // 1.4.12 Text Spacing
  // (no standard axe rule — manual check required)

  // 2.1.1 Keyboard
  "scrollable-region-focusable": ["2.1.1"],

  // 2.1.2 No Keyboard Trap — no axe rule exists; detected via tab stop trap analysis

  // 2.2.1 Timing Adjustable
  "meta-refresh": ["2.2.1"],

  // 2.2.2 Pause, Stop, Hide
  blink: ["2.2.2"],
  marquee: ["2.2.2"],

  // 2.3.1 Three Flashes or Below Threshold
  // (no standard axe rule — requires visual/tool inspection)

  // 2.4.1 Bypass Blocks
  "bypass": ["2.4.1"],
  "skip-link": ["2.4.1"],
  region: ["2.4.1"],

  // 2.4.2 Page Titled
  "document-title": ["2.4.2"],

  // 2.4.4 Link Purpose (In Context)
  "link-name": ["2.4.4", "4.1.2"],

  // 2.4.6 Headings and Labels
  "empty-heading": ["2.4.6"],

  // 2.4.7 Focus Visible
  "focus-order-semantics": ["2.4.7"],

  // 2.5.3 Label in Name
  "label-content-name-mismatch": ["2.5.3"],

  // 3.1.1 Language of Page
  "html-has-lang": ["3.1.1"],
  "html-lang-valid": ["3.1.1"],

  // 3.1.2 Language of Parts
  "valid-lang": ["3.1.2"],

  // 3.3.1 Error Identification
  "aria-input-field-name": ["3.3.1", "4.1.2"],

  // 3.3.2 Labels or Instructions
  "select-name": ["3.3.2", "4.1.2"],

  // 4.1.1 Parsing — obsolete in WCAG 2.2; axe deprecated its rules

  // 4.1.2 Name, Role, Value (duplicate-id-aria remapped from deprecated 4.1.1)
  "duplicate-id-aria": ["4.1.2"],

  // 4.1.2 Name, Role, Value
  "aria-allowed-attr": ["4.1.2"],
  "aria-allowed-role": ["4.1.2"],
  "aria-hidden-body": ["4.1.2"],
  "aria-hidden-focus": ["4.1.2"],
  "aria-roles": ["4.1.2"],
  "aria-valid-attr": ["4.1.2"],
  "aria-valid-attr-value": ["4.1.2"],
  "button-name": ["4.1.2"],
  "frame-title": ["4.1.2"],
  "image-redundant-alt": ["4.1.2"],

  // 4.1.3 Status Messages — no meaningful axe coverage; aria-progressbar-name is really 1.1.1
};

/**
 * Parses a WCAG tag from an axe-core violation's tags array.
 * Tags follow patterns like "wcag111" (WCAG 1.1.1) or "wcag143" (WCAG 1.4.3).
 * Returns the criterion ID (e.g. "1.1.1") or null if not a WCAG tag.
 */
function parseWcagTag(tag: string): string | null {
  // Match tags like "wcag111", "wcag1413", etc.
  const match = tag.match(/^wcag(\d)(\d)(\d{1,2})$/);
  if (!match) return null;
  return `${match[1]}.${match[2]}.${match[3]}`;
}

const AUTO_DETECT_IDS = new Set(
  WCAG_CRITERIA.filter((c) => c.canAutoDetect).map((c) => c.id),
);

export interface AutoPopulateResult {
  status: "fail" | "pass" | "not-applicable";
  detail?: string;
}

function plural(n: number, singular: string, pluralForm?: string): string {
  return n === 1 ? singular : (pluralForm ?? singular + "s");
}

/**
 * Takes scan violations and passes from axe-core and returns a Map of WCAG
 * criterion IDs that should be auto-populated in the manual checklist.
 *
 * Violations are always mapped to "fail". Passes are mapped to "pass" only for
 * criteria with `canAutoDetect: true` and only if no violation already failed
 * that criterion.
 *
 * Uses two strategies for both violations and passes:
 * 1. Looks up the rule ID in the AXE_TO_WCAG mapping.
 * 2. Parses the `tags` array for WCAG criterion references (e.g. "wcag111" → "1.1.1").
 */
export function getAutoPopulatedResults(
  violations: ScanViolation[],
  passes: ScanPass[],
  customChecks?: CustomCheckCounts,
): Map<string, AutoPopulateResult> {
  const results = new Map<string, AutoPopulateResult>();

  // 1. Process custom checks (non-axe detections)
  const checks = customChecks ?? {
    trapCount: 0,
    textSpacingFailCount: 0,
    focusOrderInversionCount: 0,
    focusVisibleMissingCount: 0,
    captionFailCount: null,
    keyboardFailCount: null,
    hasMedia: false,
    hasFormFields: false,
  };

  // 2.1.2 No Keyboard Trap
  if (checks.trapCount > 0) {
    const n = checks.trapCount;
    results.set("2.1.2", { status: "fail", detail: `${n} keyboard ${plural(n, "trap")} detected` });
  } else {
    results.set("2.1.2", { status: "pass" });
  }

  // 1.4.12 Text Spacing
  if (checks.textSpacingFailCount > 0) {
    const n = checks.textSpacingFailCount;
    results.set("1.4.12", { status: "fail", detail: `${n} ${plural(n, "element")} clipped or hidden when text spacing is adjusted` });
  } else {
    results.set("1.4.12", { status: "pass" });
  }

  // 2.4.3 Focus Order
  if (checks.focusOrderInversionCount > 0) {
    const n = checks.focusOrderInversionCount;
    results.set("2.4.3", { status: "fail", detail: `${n} focus order ${plural(n, "inversion")} \u2014 tab stops move backward through the visual layout` });
  } else {
    results.set("2.4.3", { status: "pass" });
  }

  // 2.4.7 Focus Visible
  if (checks.focusVisibleMissingCount > 0) {
    const n = checks.focusVisibleMissingCount;
    results.set("2.4.7", { status: "fail", detail: `${n} interactive ${plural(n, "element")} with no visible focus indicator` });
  } else {
    results.set("2.4.7", { status: "pass" });
  }

  // 1.2.2 Captions — null means inapplicable (no videos), skip
  if (checks.captionFailCount !== null) {
    if (checks.captionFailCount > 0) {
      const n = checks.captionFailCount;
      results.set("1.2.2", { status: "fail", detail: `${n} ${plural(n, "video")} missing caption or subtitle tracks` });
    } else {
      results.set("1.2.2", { status: "pass" });
    }
  }

  // Multimedia — N/A when no <video> or <audio> elements on the page
  if (!checks.hasMedia) {
    for (const id of ["1.2.1", "1.2.2", "1.2.3", "1.2.4", "1.2.5"]) {
      if (!results.has(id)) {
        results.set(id, { status: "not-applicable", detail: "No audio or video elements found on page" });
      }
    }
  }

  // Forms & Errors — N/A when no form fields on the page
  if (!checks.hasFormFields) {
    for (const id of ["1.3.5", "3.3.1", "3.3.2", "3.3.3", "3.3.4"]) {
      results.set(id, { status: "not-applicable", detail: "No form fields found on page" });
    }
  }

  // 2.1.1 Keyboard — null means inapplicable (no candidates), skip
  if (checks.keyboardFailCount !== null) {
    if (checks.keyboardFailCount > 0) {
      const n = checks.keyboardFailCount;
      results.set("2.1.1", { status: "fail", detail: `${n} interactive ${plural(n, "element")} not keyboard-accessible` });
    } else {
      results.set("2.1.1", { status: "pass" });
    }
  }

  // 2. Process violations → "fail" (always takes precedence)
  // Collect per-criterion violation summaries for detail text
  const criterionViolations = new Map<string, { help: string; nodeCount: number }[]>();

  for (const violation of violations) {
    const criteriaIds = new Set<string>();

    const mappedCriteria = AXE_TO_WCAG[violation.id];
    if (mappedCriteria) {
      for (const id of mappedCriteria) criteriaIds.add(id);
    }
    for (const tag of violation.tags) {
      const id = parseWcagTag(tag);
      if (id) criteriaIds.add(id);
    }

    for (const criterionId of criteriaIds) {
      results.set(criterionId, { status: "fail" });
      const list = criterionViolations.get(criterionId) ?? [];
      list.push({ help: violation.help, nodeCount: violation.nodes.length });
      criterionViolations.set(criterionId, list);
    }
  }

  // Attach detail text to axe violation failures
  for (const [criterionId, violationList] of criterionViolations) {
    const parts = violationList.map(
      (v) => `${v.nodeCount} ${plural(v.nodeCount, "element")}: ${v.help}`,
    );
    const existing = results.get(criterionId);
    if (existing) {
      existing.detail = parts.join("; ");
    }
  }

  // 3. Process passes → "pass" (only canAutoDetect, only if not already "fail")
  for (const pass of passes) {
    const mappedCriteria = AXE_TO_WCAG[pass.id];
    if (mappedCriteria) {
      for (const criterionId of mappedCriteria) {
        if (AUTO_DETECT_IDS.has(criterionId) && !results.has(criterionId)) {
          results.set(criterionId, { status: "pass" });
        }
      }
    }

    for (const tag of pass.tags) {
      const criterionId = parseWcagTag(tag);
      if (criterionId && AUTO_DETECT_IDS.has(criterionId) && !results.has(criterionId)) {
        results.set(criterionId, { status: "pass" });
      }
    }
  }

  return results;
}
