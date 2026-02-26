import { analyzeElementForInspector } from "./analyze";
import type { InspectorResult } from "@/types/inspector";

const OVERLAY_ID = "a11y-inspector-overlay";
const TOOLTIP_ID = "a11y-inspector-tooltip";
const STYLE_ID = "a11y-inspector-style";

let overlay: HTMLDivElement | null = null;
let tooltip: HTMLDivElement | null = null;
let locked = false;
let active = false;
let callback: ((result: InspectorResult) => void) | null = null;
let onDisableCallback: (() => void) | null = null;

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${OVERLAY_ID} {
      position: fixed;
      pointer-events: none;
      border: 2px solid #8b5cf6;
      border-radius: 2px;
      background: rgba(139, 92, 246, 0.08);
      z-index: 2147483646;
      transition: top 0.05s, left 0.05s, width 0.05s, height 0.05s;
    }
    #${TOOLTIP_ID} {
      position: fixed;
      pointer-events: none;
      z-index: 2147483647;
      background: #18181b;
      color: #fafafa;
      border-radius: 6px;
      padding: 8px 10px;
      font: 12px/1.4 system-ui, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      max-width: 280px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    #${TOOLTIP_ID} .a11y-inspector-role {
      font-weight: 600;
      font-size: 13px;
      color: #c4b5fd;
    }
    #${TOOLTIP_ID} .a11y-inspector-name {
      color: #e2e8f0;
    }
    #${TOOLTIP_ID} .a11y-inspector-tag {
      color: #a1a1aa;
      font-size: 11px;
    }
  `;
  document.head.appendChild(style);
}

function createOverlayElements() {
  overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  document.body.appendChild(overlay);

  tooltip = document.createElement("div");
  tooltip.id = TOOLTIP_ID;
  document.body.appendChild(tooltip);
}

function positionOverlay(rect: DOMRect) {
  if (!overlay) return;
  overlay.style.top = `${rect.top}px`;
  overlay.style.left = `${rect.left}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
}

function positionTooltip(rect: DOMRect) {
  if (!tooltip) return;
  const gap = 8;
  let top = rect.bottom + gap;
  let left = rect.left;

  // Flip above if near bottom
  if (top + 60 > window.innerHeight) {
    top = rect.top - tooltip.offsetHeight - gap;
  }
  // Keep within viewport horizontally
  if (left + 280 > window.innerWidth) {
    left = window.innerWidth - 290;
  }
  if (left < 4) left = 4;

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

function updateTooltip(element: Element) {
  if (!tooltip) return;

  const tag = element.tagName.toLowerCase();
  const explicitRole = element.getAttribute("role");
  const role = explicitRole || "";
  const ariaLabel = element.getAttribute("aria-label") || "";
  const name = ariaLabel || element.textContent?.trim().slice(0, 40) || "";

  const roleLabel = role ? `role="${role}"` : tag;
  const nameHtml = name
    ? `<div class="a11y-inspector-name">"${name.length > 40 ? name.slice(0, 39) + "\u2026" : name}"</div>`
    : "";

  tooltip.innerHTML = `
    <div class="a11y-inspector-role">${roleLabel}</div>
    ${nameHtml}
    <div class="a11y-inspector-tag">&lt;${tag}&gt;</div>
  `;
}

function handleMouseMove(e: MouseEvent) {
  if (locked || !active) return;

  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el || el.closest('[id^="a11y-"]')) return;

  const rect = el.getBoundingClientRect();
  positionOverlay(rect);
  updateTooltip(el);
  positionTooltip(rect);
}

function handleClick(e: MouseEvent) {
  if (!active) return;

  e.preventDefault();
  e.stopPropagation();

  if (locked) {
    // Unlock on second click
    locked = false;
    return;
  }

  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el || el.closest('[id^="a11y-"]')) return;

  locked = true;

  const result = analyzeElementForInspector(el);
  if (callback) {
    callback(result);
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (!active) return;
  if (e.key === "Escape") {
    if (locked) {
      locked = false;
    } else {
      const cb = onDisableCallback;
      disableInspectorPicker();
      cb?.();
    }
    e.preventDefault();
    e.stopPropagation();
  }
}

export function enableInspectorPicker(cb: (result: InspectorResult) => void, onDisable?: () => void) {
  if (active) return;
  active = true;
  locked = false;
  callback = cb;
  onDisableCallback = onDisable ?? null;

  ensureStyles();
  createOverlayElements();

  document.addEventListener("mousemove", handleMouseMove, true);
  document.addEventListener("click", handleClick, true);
  document.addEventListener("keydown", handleKeyDown, true);
}

export function disableInspectorPicker() {
  active = false;
  locked = false;
  callback = null;
  onDisableCallback = null;

  document.removeEventListener("mousemove", handleMouseMove, true);
  document.removeEventListener("click", handleClick, true);
  document.removeEventListener("keydown", handleKeyDown, true);

  overlay?.remove();
  tooltip?.remove();
  overlay = null;
  tooltip = null;
}
