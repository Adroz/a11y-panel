import type { ScanViolation } from "@/types/scan";

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

  // 1.4.4 Resize Text
  "meta-viewport": ["1.4.4"],

  // 1.4.10 Reflow
  "meta-viewport-large": ["1.4.10"],

  // 1.4.12 Text Spacing
  // (no standard axe rule — manual check required)

  // 2.1.1 Keyboard
  "scrollable-region-focusable": ["2.1.1"],

  // 2.1.2 No Keyboard Trap
  "no-trap-tabindex": ["2.1.2"],

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

  // 4.1.1 Parsing
  "duplicate-id": ["4.1.1"],
  "duplicate-id-active": ["4.1.1"],
  "duplicate-id-aria": ["4.1.1"],

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

  // 4.1.3 Status Messages
  "aria-progressbar-name": ["4.1.3"],
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

/**
 * Takes scan violations from axe-core and returns a Map of WCAG criterion IDs
 * that should be auto-marked as "fail" in the manual checklist.
 *
 * Uses two strategies:
 * 1. Looks up the violation's rule ID in the AXE_TO_WCAG mapping.
 * 2. Parses the violation's own `tags` array for WCAG criterion references
 *    (e.g. "wcag111" → "1.1.1").
 */
export function getAutoPopulatedResults(
  violations: ScanViolation[],
): Map<string, "fail"> {
  const results = new Map<string, "fail">();

  for (const violation of violations) {
    // Strategy 1: Use the AXE_TO_WCAG mapping
    const mappedCriteria = AXE_TO_WCAG[violation.id];
    if (mappedCriteria) {
      for (const criterionId of mappedCriteria) {
        results.set(criterionId, "fail");
      }
    }

    // Strategy 2: Parse WCAG tags from the violation's tags array
    for (const tag of violation.tags) {
      const criterionId = parseWcagTag(tag);
      if (criterionId) {
        results.set(criterionId, "fail");
      }
    }
  }

  return results;
}
