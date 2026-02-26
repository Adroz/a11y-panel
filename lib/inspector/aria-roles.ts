/**
 * Static mapping of ARIA roles to their required properties.
 * Only used for explicit `role` attributes — native HTML elements
 * satisfy ARIA contracts implicitly through browser semantics.
 *
 * Source: WAI-ARIA 1.2 specification
 */
export const REQUIRED_ARIA_PROPS: Record<string, string[]> = {
  checkbox: ["aria-checked"],
  combobox: ["aria-expanded"],
  heading: ["aria-level"],
  meter: ["aria-valuenow"],
  option: ["aria-selected"],
  radio: ["aria-checked"],
  scrollbar: ["aria-controls", "aria-valuenow"],
  separator: [], // interactive separator requires aria-valuenow, but static does not
  slider: ["aria-valuenow"],
  spinbutton: ["aria-valuenow"],
  switch: ["aria-checked"],
};
