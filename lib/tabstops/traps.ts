import type { TabStop } from './walker';

export interface FocusTrap {
  container: Element;
  selector: string;
  tabStopIndices: number[];
}

const FOCUS_TRAP_DATA_ATTRS = ['data-focus-trap', 'data-focus-lock'];

const FOCUS_TRAP_CLASS_PATTERNS = ['focus-trap', 'focus-lock'];

export function generateSelector(element: Element): string {
  if (element.id) {
    return `#${CSS.escape(element.id)}`;
  }

  const tag = element.tagName.toLowerCase();
  const parent = element.parentElement;

  if (!parent) return tag;

  const siblings = Array.from(parent.children);
  const sameTagSiblings = siblings.filter(
    (s) => s.tagName === element.tagName
  );

  if (sameTagSiblings.length === 1) {
    return `${generateSelector(parent)} > ${tag}`;
  }

  const nthIndex = siblings.indexOf(element) + 1;
  return `${generateSelector(parent)} > ${tag}:nth-child(${nthIndex})`;
}

function hasFocusTrapMarkers(element: Element): boolean {
  // Check role-based indicators
  const role = element.getAttribute('role');
  if (role === 'dialog' || role === 'alertdialog') return true;

  // Check aria-modal
  if (element.getAttribute('aria-modal') === 'true') return true;

  // Check data attributes used by common focus trap libraries
  for (const attr of FOCUS_TRAP_DATA_ATTRS) {
    if (element.hasAttribute(attr)) return true;
  }

  // Check class names for focus trap patterns
  const classList = element.className;
  if (typeof classList === 'string') {
    const lowerClass = classList.toLowerCase();
    for (const pattern of FOCUS_TRAP_CLASS_PATTERNS) {
      if (lowerClass.includes(pattern)) return true;
    }
  }

  return false;
}

export function detectFocusTraps(tabStops: TabStop[]): FocusTrap[] {
  if (tabStops.length === 0) return [];

  // Collect all candidate trap containers from the document
  const candidateSelectors = [
    '[role="dialog"]',
    '[role="alertdialog"]',
    '[aria-modal="true"]',
    ...FOCUS_TRAP_DATA_ATTRS.map((attr) => `[${attr}]`),
  ];

  const candidates = new Set<Element>();

  for (const selector of candidateSelectors) {
    for (const el of Array.from(document.querySelectorAll(selector))) {
      candidates.add(el);
    }
  }

  // Also check for class-based markers: query all elements and filter
  // This is more targeted than querying '*' -- walk up from each tab stop
  for (const tabStop of tabStops) {
    let ancestor: Element | null = tabStop.element.parentElement;
    while (ancestor) {
      if (hasFocusTrapMarkers(ancestor)) {
        candidates.add(ancestor);
      }
      ancestor = ancestor.parentElement;
    }
  }

  const traps: FocusTrap[] = [];

  for (const container of candidates) {
    const containedIndices: number[] = [];

    for (const tabStop of tabStops) {
      if (container.contains(tabStop.element)) {
        containedIndices.push(tabStop.index);
      }
    }

    // Only flag as a trap if it contains 2 or more tab stops
    if (containedIndices.length >= 2) {
      traps.push({
        container,
        selector: generateSelector(container),
        tabStopIndices: containedIndices,
      });
    }
  }

  return traps;
}
