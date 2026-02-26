import { analyzeElementForPicker } from "./analyzer";
import { contrastRatio, parseColor, alphaComposite, colorToHex } from "./wcag";
import { getEffectiveBackgroundColor, getEffectiveForegroundColor } from "./color";
import type { ContrastPickerResult } from "@/types/contrast";

const OVERLAY_ID = "a11y-contrast-picker-overlay";
const TOOLTIP_ID = "a11y-contrast-picker-tooltip";
const STYLE_ID = "a11y-contrast-picker-style";

let overlay: HTMLDivElement | null = null;
let tooltip: HTMLDivElement | null = null;
let locked = false;
let active = false;
let callback: ((result: ContrastPickerResult) => void) | null = null;
let onDisableCallback: (() => void) | null = null;

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${OVERLAY_ID} {
      position: fixed;
      pointer-events: none;
      border: 2px solid #3b82f6;
      border-radius: 2px;
      background: rgba(59, 130, 246, 0.08);
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
      gap: 4px;
    }
    #${TOOLTIP_ID} .a11y-picker-swatches {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    #${TOOLTIP_ID} .a11y-picker-swatch {
      width: 16px;
      height: 16px;
      border-radius: 3px;
      border: 1px solid rgba(255,255,255,0.3);
      flex-shrink: 0;
    }
    #${TOOLTIP_ID} .a11y-picker-ratio {
      font-weight: 600;
      font-size: 13px;
    }
    #${TOOLTIP_ID} .a11y-picker-pass {
      color: #4ade80;
    }
    #${TOOLTIP_ID} .a11y-picker-fail {
      color: #f87171;
    }
    #${TOOLTIP_ID} .a11y-picker-label {
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
  if (top + 80 > window.innerHeight) {
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

  const fg = getEffectiveForegroundColor(element);
  const bg = getEffectiveBackgroundColor(element);
  const compositedFg = fg.a < 1 ? alphaComposite(fg, bg.color) : fg;
  const ratio = contrastRatio(compositedFg, bg.color);
  const style = getComputedStyle(element);
  const fontSize = parseFloat(style.fontSize);
  const fontWeight = parseInt(style.fontWeight, 10) || 400;
  const large = fontSize >= 24 || (fontSize >= 18.67 && fontWeight >= 700);
  const aaRequired = large ? 3.0 : 4.5;
  const aaPass = ratio >= aaRequired;

  const fgHex = colorToHex(compositedFg);
  const bgHex = colorToHex(bg.color);

  tooltip.innerHTML = `
    <div class="a11y-picker-swatches">
      <div class="a11y-picker-swatch" style="background:${fgHex}"></div>
      <span class="a11y-picker-label">${fgHex}</span>
      <span class="a11y-picker-label">/</span>
      <div class="a11y-picker-swatch" style="background:${bgHex}"></div>
      <span class="a11y-picker-label">${bgHex}</span>
    </div>
    <div>
      <span class="a11y-picker-ratio ${aaPass ? "a11y-picker-pass" : "a11y-picker-fail"}">${ratio}:1</span>
      <span class="a11y-picker-label"> AA ${aaPass ? "Pass" : "Fail"}${large ? " (large text)" : ""}</span>
    </div>
    ${bg.undetermined ? '<div class="a11y-picker-label">Background image detected</div>' : ""}
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

  const result = analyzeElementForPicker(el);
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
      disablePicker();
      cb?.();
    }
    e.preventDefault();
    e.stopPropagation();
  }
}

export function enablePicker(cb: (result: ContrastPickerResult) => void, onDisable?: () => void) {
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

export function disablePicker() {
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
