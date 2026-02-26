const CANVAS_ID = "a11y-pixel-picker-canvas";
const MAGNIFIER_ID = "a11y-pixel-picker-magnifier";
const STYLE_ID = "a11y-pixel-picker-style";

const MAGNIFIER_SIZE = 120; // CSS px
const GRID_COUNT = 15; // pixels shown in magnifier grid
const ZOOM = MAGNIFIER_SIZE / GRID_COUNT; // 8px per grid cell

let canvas: HTMLCanvasElement | null = null;
let magnifier: HTMLCanvasElement | null = null;
let hexLabel: HTMLDivElement | null = null;
let imageData: ImageData | null = null;
let active = false;
let onPickCallback: ((hex: string) => void) | null = null;
let onDisableCallback: (() => void) | null = null;

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0")
  );
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${CANVAS_ID} {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 2147483646;
      cursor: crosshair;
    }
    #${MAGNIFIER_ID} {
      position: fixed;
      pointer-events: none;
      z-index: 2147483647;
      width: ${MAGNIFIER_SIZE}px;
      height: ${MAGNIFIER_SIZE}px;
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgba(255,255,255,0.9), 0 4px 16px rgba(0,0,0,0.4);
      overflow: hidden;
    }
    .a11y-pixel-picker-hex-label {
      position: fixed;
      pointer-events: none;
      z-index: 2147483647;
      background: #18181b;
      color: #fafafa;
      border-radius: 4px;
      padding: 2px 6px;
      font: 11px/1.4 ui-monospace, monospace;
      text-align: center;
      white-space: nowrap;
    }
  `;
  document.head.appendChild(style);
}

function samplePixel(cssX: number, cssY: number): { r: number; g: number; b: number } | null {
  if (!imageData) return null;
  const dpr = window.devicePixelRatio || 1;
  const px = Math.round(cssX * dpr);
  const py = Math.round(cssY * dpr);
  if (px < 0 || py < 0 || px >= imageData.width || py >= imageData.height) return null;
  const i = (py * imageData.width + px) * 4;
  return { r: imageData.data[i], g: imageData.data[i + 1], b: imageData.data[i + 2] };
}

function drawMagnifier(cssX: number, cssY: number) {
  if (!magnifier || !imageData) return;
  const ctx = magnifier.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const half = Math.floor(GRID_COUNT / 2);

  ctx.clearRect(0, 0, magnifier.width, magnifier.height);

  // Draw zoomed pixel grid
  for (let gy = 0; gy < GRID_COUNT; gy++) {
    for (let gx = 0; gx < GRID_COUNT; gx++) {
      const sx = Math.round((cssX + gx - half) * dpr);
      const sy = Math.round((cssY + gy - half) * dpr);

      if (sx >= 0 && sy >= 0 && sx < imageData.width && sy < imageData.height) {
        const i = (sy * imageData.width + sx) * 4;
        ctx.fillStyle = `rgb(${imageData.data[i]},${imageData.data[i + 1]},${imageData.data[i + 2]})`;
      } else {
        ctx.fillStyle = "#808080";
      }
      ctx.fillRect(gx * ZOOM, gy * ZOOM, ZOOM, ZOOM);
    }
  }

  // Draw grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= GRID_COUNT; i++) {
    ctx.beginPath();
    ctx.moveTo(i * ZOOM, 0);
    ctx.lineTo(i * ZOOM, MAGNIFIER_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * ZOOM);
    ctx.lineTo(MAGNIFIER_SIZE, i * ZOOM);
    ctx.stroke();
  }

  // Highlight center pixel
  const cx = half * ZOOM;
  const cy = half * ZOOM;
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 2;
  ctx.strokeRect(cx + 1, cy + 1, ZOOM - 2, ZOOM - 2);
  ctx.strokeStyle = "rgba(0,0,0,0.6)";
  ctx.lineWidth = 1;
  ctx.strokeRect(cx, cy, ZOOM, ZOOM);
}

function positionMagnifier(cssX: number, cssY: number) {
  if (!magnifier || !hexLabel) return;
  const gap = 20;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Position magnifier offset from cursor
  let mx = cssX + gap;
  let my = cssY - MAGNIFIER_SIZE - gap;

  // Keep within viewport
  if (mx + MAGNIFIER_SIZE > vw) mx = cssX - MAGNIFIER_SIZE - gap;
  if (my < 0) my = cssY + gap;
  if (mx < 0) mx = gap;
  if (my + MAGNIFIER_SIZE > vh) my = vh - MAGNIFIER_SIZE - gap;

  magnifier.style.left = `${mx}px`;
  magnifier.style.top = `${my}px`;

  // Position hex label below magnifier
  const labelW = 70;
  hexLabel.style.left = `${mx + (MAGNIFIER_SIZE - labelW) / 2}px`;
  hexLabel.style.top = `${my + MAGNIFIER_SIZE + 4}px`;
  hexLabel.style.width = `${labelW}px`;

  // Update hex label text
  const color = samplePixel(cssX, cssY);
  if (color) {
    hexLabel.textContent = rgbToHex(color.r, color.g, color.b);
  }
}

function showMagnifier() {
  if (magnifier) magnifier.style.display = "";
  if (hexLabel) hexLabel.style.display = "";
}

function hideMagnifier() {
  if (magnifier) magnifier.style.display = "none";
  if (hexLabel) hexLabel.style.display = "none";
}

function handleMouseMove(e: MouseEvent) {
  if (!active) return;
  showMagnifier();
  drawMagnifier(e.clientX, e.clientY);
  positionMagnifier(e.clientX, e.clientY);
}

function handleMouseLeave() {
  if (!active) return;
  hideMagnifier();
}

function handleClick(e: MouseEvent) {
  if (!active) return;
  e.preventDefault();
  e.stopPropagation();

  const color = samplePixel(e.clientX, e.clientY);
  if (color && onPickCallback) {
    onPickCallback(rgbToHex(color.r, color.g, color.b));
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (!active) return;
  if (e.key === "Escape") {
    e.preventDefault();
    e.stopPropagation();
    const cb = onDisableCallback;
    disablePixelPicker();
    cb?.();
  }
}

export function enablePixelPicker(
  screenshotDataUrl: string,
  onPick: (hex: string) => void,
  onDisable: () => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (active) {
      resolve();
      return;
    }

    const img = new Image();
    img.onload = () => {
      active = true;
      onPickCallback = onPick;
      onDisableCallback = onDisable;

      ensureStyles();

      // Create canvas at image native resolution, CSS-sized to viewport
      canvas = document.createElement("canvas");
      canvas.id = CANVAS_ID;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to create canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      imageData = ctx.getImageData(0, 0, img.width, img.height);
      document.body.appendChild(canvas);

      // Create magnifier canvas
      magnifier = document.createElement("canvas");
      magnifier.id = MAGNIFIER_ID;
      magnifier.width = MAGNIFIER_SIZE;
      magnifier.height = MAGNIFIER_SIZE;
      document.body.appendChild(magnifier);

      // Create hex label
      hexLabel = document.createElement("div");
      hexLabel.className = "a11y-pixel-picker-hex-label";
      document.body.appendChild(hexLabel);

      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseleave", handleMouseLeave);
      canvas.addEventListener("click", handleClick);
      document.addEventListener("keydown", handleKeyDown, true);

      // Start with magnifier hidden until first mouse move
      hideMagnifier();

      resolve();
    };
    img.onerror = () => reject(new Error("Failed to load screenshot"));
    img.src = screenshotDataUrl;
  });
}

export function disablePixelPicker() {
  active = false;
  onPickCallback = null;
  onDisableCallback = null;

  canvas?.removeEventListener("mousemove", handleMouseMove);
  canvas?.removeEventListener("mouseleave", handleMouseLeave);
  canvas?.removeEventListener("click", handleClick);
  document.removeEventListener("keydown", handleKeyDown, true);

  canvas?.remove();
  magnifier?.remove();
  hexLabel?.remove();
  document.getElementById(STYLE_ID)?.remove();

  canvas = null;
  magnifier = null;
  hexLabel = null;
  imageData = null;
}
