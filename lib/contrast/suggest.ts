import { contrastRatio, relativeLuminance, type RGBAColor } from "./wcag";
import { hexToRgba } from "./hex";
import type { ColorSuggestion } from "@/types/contrast";

interface HSL {
  h: number;
  s: number;
  l: number;
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): RGBAColor {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: 1,
  };
}

function rgbaToHex(color: RGBAColor): string {
  return (
    "#" +
    Math.round(color.r).toString(16).padStart(2, "0") +
    Math.round(color.g).toString(16).padStart(2, "0") +
    Math.round(color.b).toString(16).padStart(2, "0")
  );
}

/**
 * Binary search for the lightness closest to `originalL` that meets the target
 * contrast ratio against `bg`. Searches in `[lo, hi]`.
 */
function findClosestPassingLightness(
  h: number,
  s: number,
  bg: RGBAColor,
  targetRatio: number,
  lo: number,
  hi: number,
  originalL: number,
): RGBAColor | null {
  const ITERATIONS = 20;
  let best: RGBAColor | null = null;

  for (let i = 0; i < ITERATIONS; i++) {
    const mid = (lo + hi) / 2;
    const candidate = hslToRgb(h, s, mid);
    const ratio = contrastRatio(candidate, bg);

    if (ratio >= targetRatio) {
      best = candidate;
      // Move toward original lightness to minimize the color change
      if (mid < originalL) {
        lo = mid; // search higher (closer to original)
      } else {
        hi = mid; // search lower (closer to original)
      }
    } else {
      // Move away from original lightness to find a passing value
      if (mid < originalL) {
        hi = mid; // search lower (further from original)
      } else {
        lo = mid; // search higher (further from original)
      }
    }
  }

  return best;
}

export function suggestColorFix(
  fgHex: string,
  bgHex: string,
  targetRatio: number,
): ColorSuggestion[] {
  const fg = hexToRgba(fgHex);
  const bg = hexToRgba(bgHex);
  const { h, s, l } = rgbToHsl(fg.r, fg.g, fg.b);

  const suggestions: ColorSuggestion[] = [];

  // Try darker (reduce lightness)
  const darker = findClosestPassingLightness(h, s, bg, targetRatio, 0, l, l);
  if (darker) {
    const darkerHex = rgbaToHex(darker);
    const achieved = contrastRatio(darker, bg);
    if (darkerHex.toLowerCase() !== fgHex.toLowerCase()) {
      suggestions.push({
        originalHex: fgHex,
        suggestedHex: darkerHex,
        targetRatio,
        achievedRatio: achieved,
        direction: "darker",
      });
    }
  }

  // Try lighter (increase lightness)
  const lighter = findClosestPassingLightness(h, s, bg, targetRatio, l, 1, l);
  if (lighter) {
    const lighterHex = rgbaToHex(lighter);
    const achieved = contrastRatio(lighter, bg);
    if (lighterHex.toLowerCase() !== fgHex.toLowerCase()) {
      suggestions.push({
        originalHex: fgHex,
        suggestedHex: lighterHex,
        targetRatio,
        achievedRatio: achieved,
        direction: "lighter",
      });
    }
  }

  return suggestions;
}
