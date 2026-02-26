import type { TabStop } from './walker';
import type { FocusTrap } from './traps';

const OVERLAY_ID = 'a11y-panel-tabstop-overlay';
const STYLE_ID = 'a11y-panel-tabstop-overlay-styles';
const SVG_NS = 'http://www.w3.org/2000/svg';

const CIRCLE_SIZE = 24;
const CIRCLE_COLOR = '#1565c0';
const LINE_OPACITY = 0.4;
const LINE_DASH = '6 4';
const LINE_WIDTH = 2;
const TRAP_BORDER_COLOR = 'rgba(211, 47, 47, 0.6)';
const TRAP_LABEL_BG = 'rgba(211, 47, 47, 0.85)';
const ACTIVE_CIRCLE_COLOR = '#bf360c';
const HIGHLIGHT_RING_COLOR = '#1565c0';
const HIGHLIGHT_RING_ID = 'a11y-panel-highlight-ring';

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #${OVERLAY_ID} {
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 2147483640;
    }

    .a11y-tabstop-circle {
      position: absolute;
      width: ${CIRCLE_SIZE}px;
      height: ${CIRCLE_SIZE}px;
      background: ${CIRCLE_COLOR};
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11px;
      font-weight: bold;
      line-height: ${CIRCLE_SIZE}px;
      text-align: center;
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
      z-index: 2147483641;
      pointer-events: none;
      box-sizing: border-box;
    }

    .a11y-tabstop-svg {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 2147483640;
    }

    .a11y-trap-border {
      position: absolute;
      border: 3px solid ${TRAP_BORDER_COLOR};
      border-radius: 4px;
      pointer-events: none;
      z-index: 2147483640;
      box-sizing: border-box;
    }

    .a11y-trap-label {
      position: absolute;
      top: 0;
      left: 0;
      background: ${TRAP_LABEL_BG};
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 10px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 0 0 4px 0;
      pointer-events: none;
      z-index: 2147483642;
      line-height: 1.4;
    }

    .a11y-tabstop-circle-active {
      background: ${ACTIVE_CIRCLE_COLOR} !important;
      transform: scale(1.35);
      box-shadow: 0 0 0 3px rgba(191, 54, 12, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3) !important;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }

    #${HIGHLIGHT_RING_ID} {
      position: absolute;
      border: 3px solid ${HIGHLIGHT_RING_COLOR};
      border-radius: 4px;
      pointer-events: none;
      z-index: 2147483639;
      box-sizing: border-box;
      animation: a11y-highlight-pulse 2s ease-in-out infinite;
    }

    @keyframes a11y-highlight-pulse {
      0%, 100% { border-color: ${HIGHLIGHT_RING_COLOR}; box-shadow: 0 0 0 0 rgba(21, 101, 192, 0.4); }
      50% { border-color: ${HIGHLIGHT_RING_COLOR}; box-shadow: 0 0 0 6px rgba(21, 101, 192, 0); }
    }
  `;

  document.head.appendChild(style);
}

function removeStyles(): void {
  const style = document.getElementById(STYLE_ID);
  if (style) style.remove();
}

function getPageDimensions(): { width: number; height: number } {
  const scrollEl = document.scrollingElement || document.documentElement;
  return {
    width: Math.max(scrollEl.scrollWidth, scrollEl.clientWidth),
    height: Math.max(scrollEl.scrollHeight, scrollEl.clientHeight),
  };
}

function createContainer(): HTMLDivElement {
  const container = document.createElement('div');
  container.id = OVERLAY_ID;

  const page = getPageDimensions();
  container.style.width = `${page.width}px`;
  container.style.height = `${page.height}px`;

  return container;
}

interface CirclePosition {
  x: number;
  y: number;
  cx: number;
  cy: number;
}

function getCirclePosition(rect: DOMRect): CirclePosition {
  const x = rect.left + window.scrollX;
  const y = rect.top + window.scrollY;
  return {
    x,
    y,
    cx: x + CIRCLE_SIZE / 2,
    cy: y + CIRCLE_SIZE / 2,
  };
}

function renderCircles(
  container: HTMLDivElement,
  tabStops: TabStop[]
): CirclePosition[] {
  const positions: CirclePosition[] = [];

  for (const tabStop of tabStops) {
    const pos = getCirclePosition(tabStop.rect);
    positions.push(pos);

    const circle = document.createElement('div');
    circle.className = 'a11y-tabstop-circle';
    circle.setAttribute('data-stop-index', String(tabStop.index));
    circle.style.left = `${pos.x}px`;
    circle.style.top = `${pos.y}px`;
    circle.textContent = String(tabStop.index);

    container.appendChild(circle);
  }

  return positions;
}

function renderLines(
  container: HTMLDivElement,
  positions: CirclePosition[]
): void {
  if (positions.length < 2) return;

  const page = getPageDimensions();

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'a11y-tabstop-svg');
  svg.setAttribute('width', String(page.width));
  svg.setAttribute('height', String(page.height));
  svg.setAttribute('viewBox', `0 0 ${page.width} ${page.height}`);

  for (let i = 0; i < positions.length - 1; i++) {
    const from = positions[i];
    const to = positions[i + 1];

    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', String(from.cx));
    line.setAttribute('y1', String(from.cy));
    line.setAttribute('x2', String(to.cx));
    line.setAttribute('y2', String(to.cy));
    line.setAttribute('stroke', CIRCLE_COLOR);
    line.setAttribute('stroke-width', String(LINE_WIDTH));
    line.setAttribute('stroke-opacity', String(LINE_OPACITY));
    line.setAttribute('stroke-dasharray', LINE_DASH);

    svg.appendChild(line);
  }

  container.appendChild(svg);
}

function renderFocusTraps(
  container: HTMLDivElement,
  traps: FocusTrap[]
): void {
  for (const trap of traps) {
    const rect = trap.container.getBoundingClientRect();
    const x = rect.left + window.scrollX;
    const y = rect.top + window.scrollY;

    const border = document.createElement('div');
    border.className = 'a11y-trap-border';
    border.style.left = `${x}px`;
    border.style.top = `${y}px`;
    border.style.width = `${rect.width}px`;
    border.style.height = `${rect.height}px`;

    const label = document.createElement('div');
    label.className = 'a11y-trap-label';
    label.textContent = 'Focus trap';

    border.appendChild(label);
    container.appendChild(border);
  }
}

export function showTabStopOverlay(
  tabStops: TabStop[],
  traps: FocusTrap[]
): void {
  // Clear any existing overlay first
  hideTabStopOverlay();

  injectStyles();

  const container = createContainer();

  const positions = renderCircles(container, tabStops);
  renderLines(container, positions);
  renderFocusTraps(container, traps);

  document.body.appendChild(container);
}

export function hideTabStopOverlay(): void {
  const existing = document.getElementById(OVERLAY_ID);
  if (existing) existing.remove();
  removeStyles();
}

export function highlightTabStopCircle(index: number | null): void {
  // Clear all active circles
  const overlay = document.getElementById(OVERLAY_ID);
  if (!overlay) return;

  for (const el of Array.from(overlay.querySelectorAll('.a11y-tabstop-circle-active'))) {
    el.classList.remove('a11y-tabstop-circle-active');
  }

  if (index !== null) {
    const circle = overlay.querySelector(`[data-stop-index="${index}"]`);
    if (circle) circle.classList.add('a11y-tabstop-circle-active');
  }
}

export function showHighlightRing(element: Element): void {
  clearHighlightRing();
  const rect = element.getBoundingClientRect();
  const ring = document.createElement('div');
  ring.id = HIGHLIGHT_RING_ID;
  ring.style.left = `${rect.left + window.scrollX - 4}px`;
  ring.style.top = `${rect.top + window.scrollY - 4}px`;
  ring.style.width = `${rect.width + 8}px`;
  ring.style.height = `${rect.height + 8}px`;
  document.body.appendChild(ring);
}

export function clearHighlightRing(): void {
  const existing = document.getElementById(HIGHLIGHT_RING_ID);
  if (existing) existing.remove();
}

export function isOverlayVisible(): boolean {
  return document.getElementById(OVERLAY_ID) !== null;
}
