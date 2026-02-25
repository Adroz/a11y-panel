export interface TabStop {
  element: Element;
  index: number;
  rect: DOMRect;
  tabIndex: number;
}

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  '[tabindex]',
  '[contenteditable]',
  '[contenteditable="true"]',
].join(',');

function isVisible(element: Element): boolean {
  const style = getComputedStyle(element);

  if (style.display === 'none') return false;
  if (style.visibility === 'hidden') return false;

  // Walk up ancestors for inherited visibility/display:none
  let parent = element.parentElement;
  while (parent) {
    const parentStyle = getComputedStyle(parent);
    if (parentStyle.display === 'none') return false;
    if (parentStyle.visibility === 'hidden') return false;
    parent = parent.parentElement;
  }

  return true;
}

function hasZeroDimensions(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width === 0 || rect.height === 0;
}

function isDisabled(element: Element): boolean {
  return element.hasAttribute('disabled');
}

function isAriaHidden(element: Element): boolean {
  if (element.getAttribute('aria-hidden') === 'true') return true;

  let parent = element.parentElement;
  while (parent) {
    if (parent.getAttribute('aria-hidden') === 'true') return true;
    parent = parent.parentElement;
  }

  return false;
}

function getEffectiveTabIndex(element: Element): number {
  const attr = element.getAttribute('tabindex');
  if (attr !== null) {
    const parsed = parseInt(attr, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Naturally focusable elements have an implicit tabindex of 0
  const tag = element.tagName.toLowerCase();
  if (
    (tag === 'a' && element.hasAttribute('href')) ||
    tag === 'button' ||
    tag === 'input' ||
    tag === 'select' ||
    tag === 'textarea'
  ) {
    return 0;
  }

  // contenteditable elements are naturally focusable
  const ce = element.getAttribute('contenteditable');
  if (ce !== null && ce !== 'false') {
    return 0;
  }

  return 0;
}

function isTabbable(element: Element): boolean {
  const tabIndex = getEffectiveTabIndex(element);

  // tabindex="-1" means focusable but not tabbable
  if (element.getAttribute('tabindex') !== null && tabIndex < 0) return false;

  if (!isVisible(element)) return false;
  if (hasZeroDimensions(element)) return false;
  if (isDisabled(element)) return false;
  if (isAriaHidden(element)) return false;

  return true;
}

export function getTabStops(): TabStop[] {
  const candidates = Array.from(document.querySelectorAll(FOCUSABLE_SELECTORS));

  const tabbable = candidates.filter(isTabbable);

  // Separate into positive tabindex and zero/natural tabindex groups
  const positiveTabIndex: { element: Element; tabIndex: number }[] = [];
  const zeroTabIndex: { element: Element; tabIndex: number }[] = [];

  for (const element of tabbable) {
    const ti = getEffectiveTabIndex(element);
    if (ti > 0) {
      positiveTabIndex.push({ element, tabIndex: ti });
    } else {
      zeroTabIndex.push({ element, tabIndex: ti });
    }
  }

  // Sort positive tabindex by value (stable sort preserves DOM order for equal values)
  positiveTabIndex.sort((a, b) => a.tabIndex - b.tabIndex);

  // Zero tabindex elements stay in DOM order (already in DOM order from querySelectorAll)
  const ordered = [...positiveTabIndex, ...zeroTabIndex];

  return ordered.map((item, index) => ({
    element: item.element,
    index: index + 1,
    rect: item.element.getBoundingClientRect(),
    tabIndex: item.tabIndex,
  }));
}
