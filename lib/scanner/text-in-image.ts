import type { ScanViolation, ScanNode } from "@/types/scan";
import { generateSelector } from "@/lib/tabstops/traps";

/** Alt text keywords that suggest the image contains text content. */
const ALT_TEXT_KEYWORDS = [
  "screenshot",
  "document",
  "email",
  "menu",
  "heading",
  "text",
  "letter",
  "sign",
  "label",
  "receipt",
  "invoice",
  "form",
  "certificate",
  "ticket",
  "poster",
  "flyer",
  "slide",
  "presentation",
  "spreadsheet",
  "table",
  "chart",
  "diagram",
  "caption",
  "subtitle",
  "transcript",
  "article",
  "newspaper",
  "page",
  "pdf",
  "note",
  "message",
];

/** Filename keywords that suggest the image contains text content. */
const FILENAME_KEYWORDS = [
  "text",
  "banner",
  "screenshot",
  "heading",
  "title",
  "caption",
  "label",
  "menu",
  "document",
  "email",
  "slide",
  "poster",
  "flyer",
  "certificate",
  "receipt",
  "invoice",
];

/** Max images to run canvas/TextDetector analysis on. */
const MAX_ANALYSIS_COUNT = 30;

/** Min natural dimensions (px) to consider an image. */
const MIN_SIZE = 50;

/** Max canvas width for edge-density downscale. */
const MAX_CANVAS_WIDTH = 200;

/**
 * Row-variance threshold — rows with variance above this are "high-variance"
 * (likely text edges). Empirically tuned to distinguish text banding from
 * smooth gradients.
 */
const ROW_VARIANCE_THRESHOLD = 600;

/**
 * Fraction of rows that must be high-variance to flag as text-like banding.
 * Text images typically have alternating bands of high/low variance (text
 * lines and gaps).
 */
const HIGH_VARIANCE_ROW_FRACTION = 0.15;

/**
 * Minimum fraction of row transitions (high→low or low→high) relative to
 * total rows to indicate regular banding rather than uniform noise.
 */
const MIN_BANDING_TRANSITION_FRACTION = 0.08;

function isHidden(el: Element): boolean {
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return true;
  const rect = el.getBoundingClientRect();
  return rect.width === 0 && rect.height === 0;
}

function isExtensionElement(el: Element): boolean {
  if (el.id?.startsWith("a11y-")) return true;
  if (el.closest("[id^='a11y-']")) return true;
  return false;
}

function truncateHtml(el: Element, max = 250): string {
  const html = el.outerHTML;
  return html.length > max ? html.slice(0, max) + "..." : html;
}

function getFilenameFromSrc(src: string): string {
  try {
    const url = new URL(src, window.location.href);
    const path = url.pathname;
    const lastSegment = path.split("/").pop() ?? "";
    return lastSegment.toLowerCase();
  } catch {
    return src.toLowerCase();
  }
}

// ─── Tier 1: Metadata heuristics ───────────────────────────────────────

interface Tier1Result {
  el: Element;
  reasons: string[];
}

function checkSvgTextElements(svg: SVGSVGElement): string | null {
  const textEls = svg.querySelectorAll("text, tspan");
  if (textEls.length > 0) {
    return "Detected: SVG contains <text> element";
  }
  return null;
}

function checkAltTextKeywords(img: HTMLImageElement): string | null {
  const alt = (img.alt ?? "").toLowerCase();
  if (!alt) return null;

  for (const keyword of ALT_TEXT_KEYWORDS) {
    if (alt.includes(keyword)) {
      const snippet = alt.length > 50 ? alt.slice(0, 50) + "..." : alt;
      return `Detected: alt text suggests text content ("${snippet}")`;
    }
  }
  return null;
}

function checkFilenameKeywords(img: HTMLImageElement): string | null {
  const src = img.getAttribute("src");
  if (!src) return null;

  const filename = getFilenameFromSrc(src);
  for (const keyword of FILENAME_KEYWORDS) {
    if (filename.includes(keyword)) {
      return `Detected: filename pattern (${filename})`;
    }
  }
  return null;
}

function runTier1(candidates: Element[]): Map<Element, string[]> {
  const flagged = new Map<Element, string[]>();

  for (const el of candidates) {
    const reasons: string[] = [];

    if (el instanceof SVGSVGElement) {
      const r = checkSvgTextElements(el);
      if (r) reasons.push(r);
    }

    if (el instanceof HTMLImageElement) {
      const altResult = checkAltTextKeywords(el);
      if (altResult) reasons.push(altResult);

      const fnResult = checkFilenameKeywords(el);
      if (fnResult) reasons.push(fnResult);
    }

    if (reasons.length > 0) {
      flagged.set(el, reasons);
    }
  }

  return flagged;
}

// ─── Tier 2: Canvas edge-density analysis ──────────────────────────────

function isSameOrigin(img: HTMLImageElement): boolean {
  try {
    const imgUrl = new URL(img.src, window.location.href);
    return imgUrl.origin === window.location.origin;
  } catch {
    return false;
  }
}

function analyzeEdgeDensity(img: HTMLImageElement): string | null {
  if (img.naturalWidth < MIN_SIZE || img.naturalHeight < MIN_SIZE) return null;
  if (!isSameOrigin(img)) return null;

  try {
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, MAX_CANVAS_WIDTH / img.naturalWidth);
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, w, h);

    let data: ImageData;
    try {
      data = ctx.getImageData(0, 0, w, h);
    } catch {
      // Tainted canvas (cross-origin despite same-origin check)
      return null;
    }

    const pixels = data.data;

    // Convert to grayscale row averages and compute per-row variance
    let highVarianceRows = 0;
    let transitions = 0;
    let prevHigh: boolean | null = null;

    for (let row = 0; row < h; row++) {
      const rowStart = row * w * 4;
      let sum = 0;
      let sumSq = 0;

      for (let col = 0; col < w; col++) {
        const idx = rowStart + col * 4;
        // Luminance approximation
        const gray = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];
        sum += gray;
        sumSq += gray * gray;
      }

      const mean = sum / w;
      const variance = sumSq / w - mean * mean;
      const isHigh = variance > ROW_VARIANCE_THRESHOLD;

      if (isHigh) highVarianceRows++;
      if (prevHigh !== null && isHigh !== prevHigh) transitions++;
      prevHigh = isHigh;
    }

    const highFraction = highVarianceRows / h;
    const transitionFraction = transitions / h;

    if (
      highFraction >= HIGH_VARIANCE_ROW_FRACTION &&
      transitionFraction >= MIN_BANDING_TRANSITION_FRACTION
    ) {
      return "Detected: horizontal text-like edge pattern in image";
    }

    return null;
  } catch {
    return null;
  }
}

async function runTier2(
  candidates: HTMLImageElement[],
): Promise<Map<Element, string[]>> {
  const flagged = new Map<Element, string[]>();

  for (const img of candidates) {
    const result = analyzeEdgeDensity(img);
    if (result) {
      flagged.set(img, [result]);
    }
  }

  return flagged;
}

// ─── Tier 3: TextDetector API ──────────────────────────────────────────

async function runTier3(
  candidates: HTMLImageElement[],
): Promise<Map<Element, string[]>> {
  const flagged = new Map<Element, string[]>();

  if (!("TextDetector" in window)) return flagged;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detector = new (window as any).TextDetector();

    for (const img of candidates) {
      try {
        const bitmap = await createImageBitmap(img);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results: any[] = await detector.detect(bitmap);
        bitmap.close();

        if (results.length > 0) {
          flagged.set(img, ["Detected: TextDetector API found text regions"]);
        }
      } catch {
        // Skip images that fail bitmap creation or detection
      }
    }
  } catch {
    // TextDetector constructor failed
  }

  return flagged;
}

// ─── Orchestration ─────────────────────────────────────────────────────

function gatherCandidates(): Element[] {
  const elements: Element[] = [];

  // <img> elements (including inside <picture>)
  for (const img of Array.from(document.querySelectorAll("img"))) {
    if (isHidden(img) || isExtensionElement(img)) continue;
    if (img.naturalWidth < MIN_SIZE || img.naturalHeight < MIN_SIZE) continue;
    elements.push(img);
  }

  // Inline <svg> elements
  for (const svg of Array.from(document.querySelectorAll("svg"))) {
    if (isHidden(svg) || isExtensionElement(svg)) continue;
    const rect = svg.getBoundingClientRect();
    if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) continue;
    elements.push(svg);
  }

  return elements;
}

function buildNode(el: Element, reasons: string[]): ScanNode {
  return {
    target: [generateSelector(el)],
    html: truncateHtml(el),
    failureSummary: reasons.join("\n"),
  };
}

export async function detectTextInImages(): Promise<ScanViolation | null> {
  const candidates = gatherCandidates();
  if (candidates.length === 0) return null;

  // Tier 1: synchronous metadata heuristics on all candidates
  const tier1Flags = runTier1(candidates);

  // Determine which <img> elements are unflagged by Tier 1 for deeper analysis
  const unflaggedImgs = candidates.filter(
    (el): el is HTMLImageElement =>
      el instanceof HTMLImageElement && !tier1Flags.has(el),
  );

  // Cap canvas/TextDetector analysis
  const analysisImgs = unflaggedImgs.slice(0, MAX_ANALYSIS_COUNT);

  // Tier 2 & 3 run in parallel on unflagged images
  const [tier2Flags, tier3Flags] = await Promise.all([
    runTier2(analysisImgs),
    runTier3(analysisImgs),
  ]);

  // Merge all flags: element → combined reasons
  const allFlags = new Map<Element, string[]>();

  for (const [el, reasons] of tier1Flags) {
    allFlags.set(el, [...(allFlags.get(el) ?? []), ...reasons]);
  }
  for (const [el, reasons] of tier2Flags) {
    allFlags.set(el, [...(allFlags.get(el) ?? []), ...reasons]);
  }
  for (const [el, reasons] of tier3Flags) {
    allFlags.set(el, [...(allFlags.get(el) ?? []), ...reasons]);
  }

  if (allFlags.size === 0) return null;

  const nodes: ScanNode[] = [];
  for (const [el, reasons] of allFlags) {
    nodes.push(buildNode(el, reasons));
  }

  return {
    id: "text-in-image",
    impact: "moderate",
    help: "Avoid using images of text",
    description:
      "Images that appear to contain text should use real text instead, unless the presentation is essential (e.g. logos). Review each flagged image.",
    helpUrl: "https://www.w3.org/WAI/WCAG21/Understanding/images-of-text.html",
    tags: ["wcag2aa", "wcag145"],
    nodes,
  };
}
