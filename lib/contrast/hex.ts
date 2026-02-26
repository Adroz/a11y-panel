import type { RGBAColor } from "./wcag";

const HEX3_RE = /^#?([0-9a-f]{3})$/i;
const HEX6_RE = /^#?([0-9a-f]{6})$/i;

export function isValidHex(hex: string): boolean {
  return HEX3_RE.test(hex) || HEX6_RE.test(hex);
}

export function normalizeHex(hex: string): string | null {
  let match = hex.match(HEX6_RE);
  if (match) return `#${match[1].toLowerCase()}`;

  match = hex.match(HEX3_RE);
  if (match) {
    const [r, g, b] = match[1];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return null;
}

export function hexToRgba(hex: string): RGBAColor {
  const normalized = normalizeHex(hex);
  if (!normalized) return { r: 0, g: 0, b: 0, a: 1 };

  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
    a: 1,
  };
}
