const HIGHLIGHT_CLASS = "a11y-panel-highlight";
const HIGHLIGHT_STYLE_ID = "a11y-panel-highlight-style";

function ensureStyles() {
  if (document.getElementById(HIGHLIGHT_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = HIGHLIGHT_STYLE_ID;
  style.textContent = `
    .${HIGHLIGHT_CLASS} {
      outline: 3px solid #d32f2f !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 0 6px rgba(211, 47, 47, 0.25) !important;
    }
  `;
  document.head.appendChild(style);
}

export function highlightElement(selector: string): boolean {
  ensureStyles();
  clearHighlights();

  try {
    const el = document.querySelector(selector);
    if (!el) return false;

    el.classList.add(HIGHLIGHT_CLASS);
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    return true;
  } catch {
    return false;
  }
}

export function clearHighlights() {
  document
    .querySelectorAll(`.${HIGHLIGHT_CLASS}`)
    .forEach((el) => el.classList.remove(HIGHLIGHT_CLASS));
}
