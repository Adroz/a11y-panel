export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Parse a CSS color string like "rgb(r, g, b)" or "rgba(r, g, b, a)" into components.
 */
export function parseColor(color: string): RGBAColor {
  const match = color.match(
    /rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
  );
  if (!match) return { r: 0, g: 0, b: 0, a: 1 };

  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] !== undefined ? Number(match[4]) : 1,
  };
}

/**
 * Linearize a single sRGB channel value (0–255) for luminance calculation.
 */
function linearize(channel: number): number {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * Compute the relative luminance of a color per WCAG 2.x.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function relativeLuminance(color: RGBAColor): number {
  return 0.2126 * linearize(color.r) + 0.7152 * linearize(color.g) + 0.0722 * linearize(color.b);
}

/**
 * Compute the contrast ratio between two colors.
 * Returns a value >= 1, with higher values indicating more contrast.
 */
export function contrastRatio(fg: RGBAColor, bg: RGBAColor): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

/**
 * Alpha-composite a semi-transparent foreground color over an opaque background.
 */
export function alphaComposite(fg: RGBAColor, bg: RGBAColor): RGBAColor {
  const a = fg.a;
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
    a: 1,
  };
}

/**
 * Determine if text qualifies as "large text" per WCAG.
 * Large text: >= 24px, or >= 18.67px (14pt) and bold (weight >= 700).
 */
export function isLargeText(fontSize: number, fontWeight: number): boolean {
  if (fontSize >= 24) return true;
  if (fontSize >= 18.67 && fontWeight >= 700) return true;
  return false;
}

/**
 * Convert an RGBA color to a hex string for display.
 */
export function colorToHex(color: RGBAColor): string {
  const r = Math.round(color.r).toString(16).padStart(2, "0");
  const g = Math.round(color.g).toString(16).padStart(2, "0");
  const b = Math.round(color.b).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}
