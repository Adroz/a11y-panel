/**
 * WCAG 2.1.1 Keyboard check.
 *
 * Detects interactive elements that aren't keyboard-accessible:
 * elements with click handlers (via attributes), cursor: pointer,
 * or interactive ARIA roles that are not natively focusable and
 * lack tabindex >= 0. Returns null if no candidates found (inapplicable).
 */

const INTERACTIVE_ROLES = new Set([
  "button",
  "link",
  "tab",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "switch",
  "treeitem",
  "checkbox",
  "radio",
  "slider",
  "spinbutton",
  "combobox",
  "searchbox",
  "textbox",
  "gridcell",
]);

const NATIVELY_FOCUSABLE_TAGS = new Set([
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "summary",
]);

function isVisible(el: Element): boolean {
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function isNativelyFocusable(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  if (tag === "a") return el.hasAttribute("href");
  return NATIVELY_FOCUSABLE_TAGS.has(tag);
}

function hasTabbableTabindex(el: Element): boolean {
  const attr = el.getAttribute("tabindex");
  if (attr === null) return false;
  const val = parseInt(attr, 10);
  return !isNaN(val) && val >= 0;
}

export function checkKeyboard(): { failCount: number; failingElements: Element[] } | null {
  const candidates: Element[] = [];

  // 1. Elements with mouse event handler attributes
  const mouseHandlerSelector = "[onclick], [onmousedown], [onmouseup]";
  for (const el of document.querySelectorAll(mouseHandlerSelector)) {
    if (isVisible(el)) candidates.push(el);
  }

  // 2. Elements with interactive ARIA roles
  for (const role of INTERACTIVE_ROLES) {
    for (const el of document.querySelectorAll(`[role="${role}"]`)) {
      if (isVisible(el) && !candidates.includes(el)) {
        candidates.push(el);
      }
    }
  }

  // 3. Elements with cursor: pointer (limited to common interactive containers)
  const pointerCandidateSelector = "div, span, li, td, img, svg, label";
  for (const el of document.querySelectorAll(pointerCandidateSelector)) {
    if (!isVisible(el)) continue;
    if (candidates.includes(el)) continue;
    const style = getComputedStyle(el);
    if (style.cursor === "pointer") {
      candidates.push(el);
    }
  }

  if (candidates.length === 0) return null;

  const failingElements: Element[] = [];

  for (const el of candidates) {
    if (!isNativelyFocusable(el) && !hasTabbableTabindex(el)) {
      failingElements.push(el);
    }
  }

  return { failCount: failingElements.length, failingElements };
}
