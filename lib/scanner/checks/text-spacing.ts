/**
 * WCAG 1.4.12 Text Spacing check.
 *
 * Injects CSS overrides (line-height 1.5, paragraph spacing 2em,
 * letter-spacing 0.12em, word-spacing 0.16em), then counts visible
 * text elements whose content overflows their container.
 */

const TEXT_SPACING_CSS = `
  * {
    line-height: 1.5 !important;
    letter-spacing: 0.12em !important;
    word-spacing: 0.16em !important;
  }
  p {
    margin-bottom: 2em !important;
  }
`;

function isVisible(el: Element): boolean {
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
    return false;
  }
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function hasTextContent(el: Element): boolean {
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      return true;
    }
  }
  return false;
}

function isOverflowClipped(el: Element): boolean {
  const style = getComputedStyle(el);
  const overflow = `${style.overflow} ${style.overflowX} ${style.overflowY}`;
  return overflow.includes("hidden") || overflow.includes("clip");
}

function isOverflowing(el: Element): boolean {
  return el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
}

export function checkTextSpacing(): { failCount: number; failingElements: Element[] } {
  const style = document.createElement("style");
  style.setAttribute("data-a11y-panel-check", "text-spacing");
  style.textContent = TEXT_SPACING_CSS;
  document.head.appendChild(style);

  const failingElements: Element[] = [];

  try {
    const candidates = document.querySelectorAll(
      "p, span, div, li, td, th, h1, h2, h3, h4, h5, h6, label, a, button, blockquote, figcaption, cite, dd, dt",
    );

    for (const el of candidates) {
      if (!isVisible(el) || !hasTextContent(el)) continue;
      if (isOverflowClipped(el) && isOverflowing(el)) {
        failingElements.push(el);
      }
    }
  } finally {
    style.remove();
  }

  return { failCount: failingElements.length, failingElements };
}
