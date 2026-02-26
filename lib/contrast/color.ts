import { parseColor, alphaComposite, type RGBAColor } from "./wcag";

interface EffectiveBackground {
  color: RGBAColor;
  undetermined: boolean;
}

const WHITE: RGBAColor = { r: 255, g: 255, b: 255, a: 1 };

/**
 * Walk up the ancestor chain to resolve the effective background color,
 * compositing semi-transparent layers and flagging background-image ancestors.
 */
export function getEffectiveBackgroundColor(element: Element): EffectiveBackground {
  let undetermined = false;
  const layers: RGBAColor[] = [];

  let current: Element | null = element;
  while (current) {
    const style = getComputedStyle(current);

    // Check for background-image (gradients, images)
    if (style.backgroundImage && style.backgroundImage !== "none") {
      undetermined = true;
    }

    const bgColor = parseColor(style.backgroundColor);

    // Factor in opacity — multiply alpha by computed opacity
    const opacity = parseFloat(style.opacity);
    if (!isNaN(opacity) && opacity < 1) {
      bgColor.a *= opacity;
    }

    // Skip fully transparent layers
    if (bgColor.a > 0) {
      layers.push(bgColor);
      // Fully opaque layer means we can stop walking
      if (bgColor.a >= 1) break;
    }

    current = current.parentElement;
  }

  // Composite from back (last in array) to front (first) over white canvas
  let composited = WHITE;
  for (let i = layers.length - 1; i >= 0; i--) {
    composited = alphaComposite(layers[i], composited);
  }

  return { color: composited, undetermined };
}

/**
 * Get the effective foreground (text) color, factoring in opacity inheritance.
 */
export function getEffectiveForegroundColor(element: Element): RGBAColor {
  const style = getComputedStyle(element);
  const fg = parseColor(style.color);

  // Walk up to accumulate opacity
  let cumulativeOpacity = 1;
  let current: Element | null = element;
  while (current) {
    const opacity = parseFloat(getComputedStyle(current).opacity);
    if (!isNaN(opacity)) {
      cumulativeOpacity *= opacity;
    }
    current = current.parentElement;
  }

  fg.a *= cumulativeOpacity;
  return fg;
}
