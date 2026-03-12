/**
 * WCAG 2.4.7 Focus Visible check.
 *
 * For a sample of interactive elements, snapshots visual properties
 * at rest, focuses the element, re-snapshots, and checks if any
 * visual change occurred (outline, box-shadow, border, background).
 */

import type { TabStop } from "@/lib/tabstops";

const MAX_ELEMENTS = 50;

interface VisualSnapshot {
  outline: string;
  outlineOffset: string;
  boxShadow: string;
  borderTop: string;
  borderRight: string;
  borderBottom: string;
  borderLeft: string;
  backgroundColor: string;
}

function snapshot(el: Element): VisualSnapshot {
  const s = getComputedStyle(el);
  return {
    outline: s.outline,
    outlineOffset: s.outlineOffset,
    boxShadow: s.boxShadow,
    borderTop: s.borderTopColor + s.borderTopWidth + s.borderTopStyle,
    borderRight: s.borderRightColor + s.borderRightWidth + s.borderRightStyle,
    borderBottom: s.borderBottomColor + s.borderBottomWidth + s.borderBottomStyle,
    borderLeft: s.borderLeftColor + s.borderLeftWidth + s.borderLeftStyle,
    backgroundColor: s.backgroundColor,
  };
}

function snapshotsEqual(a: VisualSnapshot, b: VisualSnapshot): boolean {
  return (
    a.outline === b.outline &&
    a.outlineOffset === b.outlineOffset &&
    a.boxShadow === b.boxShadow &&
    a.borderTop === b.borderTop &&
    a.borderRight === b.borderRight &&
    a.borderBottom === b.borderBottom &&
    a.borderLeft === b.borderLeft &&
    a.backgroundColor === b.backgroundColor
  );
}

export function checkFocusVisible(tabStops: TabStop[]): { missingCount: number; failingElements: Element[] } {
  const elements = tabStops.slice(0, MAX_ELEMENTS);
  if (elements.length === 0) return { missingCount: 0, failingElements: [] };

  // Save current active element to restore later
  const originalFocus = document.activeElement;
  const failingElements: Element[] = [];

  for (const stop of elements) {
    const el = stop.element;
    if (!(el instanceof HTMLElement)) continue;

    const before = snapshot(el);
    el.focus({ preventScroll: true });
    const after = snapshot(el);
    el.blur();

    if (snapshotsEqual(before, after)) {
      failingElements.push(el);
    }
  }

  // Restore original focus
  if (originalFocus instanceof HTMLElement) {
    originalFocus.focus({ preventScroll: true });
  }

  return { missingCount: failingElements.length, failingElements };
}
