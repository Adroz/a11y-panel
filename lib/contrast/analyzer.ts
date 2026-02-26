import { contrastRatio, isLargeText, alphaComposite, colorToHex, parseColor } from "./wcag";
import { getEffectiveBackgroundColor, getEffectiveForegroundColor } from "./color";
import { generateSelector, getAccessibleName } from "@/lib/tabstops";
import type { ContrastResult, ContrastAuditResult, ContrastPickerResult } from "@/types/contrast";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"]);

function isExtensionElement(el: Element): boolean {
  return !!el.closest('[id^="a11y-"]');
}
const MAX_SNIPPET_LENGTH = 60;

function getTextSnippet(element: Element): string {
  let text = "";
  for (const child of element.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      text += child.textContent ?? "";
    }
  }
  text = text.trim().replace(/\s+/g, " ");
  if (text.length > MAX_SNIPPET_LENGTH) {
    return text.slice(0, MAX_SNIPPET_LENGTH - 1) + "\u2026";
  }
  return text;
}

function hasDirectTextContent(element: Element): boolean {
  for (const child of element.childNodes) {
    if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      return true;
    }
  }
  return false;
}

function colorToRgbString(color: { r: number; g: number; b: number }): string {
  return `rgb(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)})`;
}

export function analyzeElement(element: Element): ContrastResult | null {
  if (!hasDirectTextContent(element)) return null;

  const style = getComputedStyle(element);
  const fontSize = parseFloat(style.fontSize);
  const fontWeight = parseInt(style.fontWeight, 10) || 400;
  const largeText = isLargeText(fontSize, fontWeight);

  const fg = getEffectiveForegroundColor(element);
  const bg = getEffectiveBackgroundColor(element);

  // Composite semi-transparent foreground over resolved background
  const compositedFg = fg.a < 1 ? alphaComposite(fg, bg.color) : fg;

  const ratio = contrastRatio(compositedFg, bg.color);
  const requiredAA = largeText ? 3.0 : 4.5;
  const requiredAAA = largeText ? 4.5 : 7.0;

  return {
    selector: generateSelector(element),
    textSnippet: getTextSnippet(element),
    fontSize,
    fontWeight,
    isLargeText: largeText,
    fgColor: colorToRgbString(compositedFg),
    bgColor: colorToRgbString(bg.color),
    contrastRatio: ratio,
    requiredRatio: requiredAA,
    aaPass: ratio >= requiredAA,
    aaaPass: ratio >= requiredAAA,
    bgUndetermined: bg.undetermined,
  };
}

export function analyzeElementForPicker(element: Element): ContrastPickerResult {
  const style = getComputedStyle(element);
  const fontSize = parseFloat(style.fontSize);
  const fontWeight = parseInt(style.fontWeight, 10) || 400;
  const largeText = isLargeText(fontSize, fontWeight);

  const fg = getEffectiveForegroundColor(element);
  const bg = getEffectiveBackgroundColor(element);
  const compositedFg = fg.a < 1 ? alphaComposite(fg, bg.color) : fg;

  const ratio = contrastRatio(compositedFg, bg.color);
  const requiredAA = largeText ? 3.0 : 4.5;
  const requiredAAA = largeText ? 4.5 : 7.0;

  return {
    selector: generateSelector(element),
    textSnippet: getTextSnippet(element),
    fontSize,
    fontWeight,
    isLargeText: largeText,
    fgColor: colorToRgbString(compositedFg),
    bgColor: colorToRgbString(bg.color),
    contrastRatio: ratio,
    requiredRatio: requiredAA,
    aaPass: ratio >= requiredAA,
    aaaPass: ratio >= requiredAAA,
    bgUndetermined: bg.undetermined,
    tagName: element.tagName.toLowerCase(),
    accessibleName: getAccessibleName(element),
  };
}

export function runContrastAudit(): ContrastAuditResult {
  const failures: ContrastResult[] = [];
  const undetermined: ContrastResult[] = [];
  let total = 0;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      const el = node as Element;

      // Skip entire subtree for non-visual or extension-injected elements
      if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT;
      if (el.id?.startsWith("a11y-")) return NodeFilter.FILTER_REJECT;

      const style = getComputedStyle(el);
      if (style.display === "none") return NodeFilter.FILTER_REJECT;
      if (style.visibility === "hidden") return NodeFilter.FILTER_REJECT;

      // Only accept elements with direct text node children
      if (hasDirectTextContent(el)) return NodeFilter.FILTER_ACCEPT;

      return NodeFilter.FILTER_SKIP;
    },
  });

  let node: Node | null;
  while ((node = walker.nextNode())) {
    const el = node as Element;
    const result = analyzeElement(el);
    if (!result) continue;

    total++;

    if (result.bgUndetermined && !result.aaPass) {
      undetermined.push(result);
    } else if (!result.aaPass) {
      failures.push(result);
    }
  }

  // Sort failures by ratio ascending (worst first)
  failures.sort((a, b) => a.contrastRatio - b.contrastRatio);

  return { total, failures, undetermined };
}
