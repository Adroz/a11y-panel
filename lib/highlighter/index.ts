import type { Impact } from "@/types/scan";

const HIGHLIGHT_CLASS_PREFIX = "a11y-panel-highlight";
const HIGHLIGHT_STYLE_ID = "a11y-panel-highlight-style";
const SINGLE_HIGHLIGHT_ATTR = "data-a11y-single-highlight";
const PERSISTENT_HIGHLIGHT_ATTR = "data-a11y-persistent-highlight";

const IMPACT_COLORS: Record<Impact, string> = {
  critical: "#d32f2f",
  serious: "#e65100",
  moderate: "#f9a825",
  minor: "#1565c0",
};

function highlightClass(impact: Impact): string {
  return `${HIGHLIGHT_CLASS_PREFIX}-${impact}`;
}

function ensureStyles() {
  if (document.getElementById(HIGHLIGHT_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = HIGHLIGHT_STYLE_ID;

  const rules = (Object.keys(IMPACT_COLORS) as Impact[])
    .map((impact) => {
      const color = IMPACT_COLORS[impact];
      return `
    .${highlightClass(impact)} {
      outline: 3px solid ${color} !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 0 6px ${hexToRgba(color, 0.25)} !important;
    }`;
    })
    .join("\n");

  style.textContent = rules;
  document.head.appendChild(style);
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function removeHighlightClasses(el: Element) {
  for (const impact of Object.keys(IMPACT_COLORS) as Impact[]) {
    el.classList.remove(highlightClass(impact));
  }
}

function clearSingleHighlight() {
  document.querySelectorAll(`[${SINGLE_HIGHLIGHT_ATTR}]`).forEach((el) => {
    removeHighlightClasses(el);
    el.removeAttribute(SINGLE_HIGHLIGHT_ATTR);
  });
}

function clearPersistentHighlights() {
  document.querySelectorAll(`[${PERSISTENT_HIGHLIGHT_ATTR}]`).forEach((el) => {
    removeHighlightClasses(el);
    el.removeAttribute(PERSISTENT_HIGHLIGHT_ATTR);
  });
}

export function highlightElement(selector: string, impact: Impact): boolean {
  ensureStyles();
  clearSingleHighlight();

  try {
    const el = document.querySelector(selector);
    if (!el) return false;

    el.classList.add(highlightClass(impact));
    el.setAttribute(SINGLE_HIGHLIGHT_ATTR, "");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    return true;
  } catch {
    return false;
  }
}

export function highlightAll(
  targets: Array<{ selector: string; impact: Impact }>
): number {
  ensureStyles();
  clearPersistentHighlights();

  let count = 0;

  for (const { selector, impact } of targets) {
    try {
      const el = document.querySelector(selector);
      if (!el) continue;

      el.classList.add(highlightClass(impact));
      el.setAttribute(PERSISTENT_HIGHLIGHT_ATTR, "");
      count++;
    } catch {
      // Invalid selector — skip
    }
  }

  return count;
}

export function clearHighlights() {
  clearSingleHighlight();
  clearPersistentHighlights();
}
