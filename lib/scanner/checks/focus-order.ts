/**
 * WCAG 2.4.3 Focus Order check.
 *
 * Compares consecutive tab stops' visual positions. Counts inversions
 * where stop N+1 is positioned significantly above stop N (more than
 * one line height back), indicating a focus order that doesn't match
 * the visual layout.
 */

import type { TabStop } from "@/lib/tabstops";

/** Vertical tolerance — allow same-row elements to be reordered freely. */
const ROW_TOLERANCE = 5; // px

export function checkFocusOrder(tabStops: TabStop[]): { inversions: number; inversionIndices: number[] } {
  if (tabStops.length < 2) return { inversions: 0, inversionIndices: [] };

  const inversionIndices: number[] = [];

  for (let i = 0; i < tabStops.length - 1; i++) {
    const current = tabStops[i].rect;
    const next = tabStops[i + 1].rect;

    // Same row (within tolerance) — allow any horizontal order
    if (Math.abs(next.top - current.top) <= ROW_TOLERANCE) {
      continue;
    }

    // Next element is significantly above current — focus goes backward visually
    if (next.top < current.top - ROW_TOLERANCE) {
      inversionIndices.push(i + 1);
    }
  }

  return { inversions: inversionIndices.length, inversionIndices };
}
