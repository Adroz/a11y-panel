import type { AccessibleNameInfo, AriaProperty, InspectorResult } from "@/types/inspector";
import { generateSelector } from "@/lib/tabstops/traps";
import { REQUIRED_ARIA_PROPS } from "./aria-roles";

const MAX_NAME_LENGTH = 60;

function truncate(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= MAX_NAME_LENGTH) return trimmed;
  return trimmed.slice(0, MAX_NAME_LENGTH - 1) + "\u2026";
}

export function getAccessibleNameWithSource(element: Element): AccessibleNameInfo {
  // 1. aria-label
  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel) return { name: truncate(ariaLabel), source: "aria-label" };

  // 2. aria-labelledby
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    const parts = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .filter(Boolean);
    if (parts.length > 0) return { name: truncate(parts.join(" ")), source: "aria-labelledby" };
  }

  // 3. alt (for images / inputs with type=image)
  const alt = element.getAttribute("alt");
  if (alt) return { name: truncate(alt), source: "alt" };

  // 4. <label> association (for form controls)
  if (element instanceof HTMLElement) {
    const id = element.id;
    if (id) {
      const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
      if (label?.textContent) return { name: truncate(label.textContent), source: "label-for" };
    }
    const parentLabel = element.closest("label");
    if (parentLabel?.textContent) return { name: truncate(parentLabel.textContent), source: "label-wrap" };
  }

  // 5. title attribute
  const title = element.getAttribute("title");
  if (title) return { name: truncate(title), source: "title" };

  // 6. placeholder (for inputs)
  const placeholder = element.getAttribute("placeholder");
  if (placeholder) return { name: truncate(placeholder), source: "placeholder" };

  // 7. textContent
  const text = element.textContent;
  if (text?.trim()) return { name: truncate(text), source: "contents" };

  return { name: "", source: "none" };
}

export function getImplicitRole(element: Element): string {
  const tag = element.tagName.toLowerCase();
  const type = element.getAttribute("type")?.toLowerCase();

  switch (tag) {
    case "a": return element.hasAttribute("href") ? "link" : "";
    case "button": return "button";
    case "input":
      if (!type || type === "text") return "textbox";
      if (type === "checkbox") return "checkbox";
      if (type === "radio") return "radio";
      if (type === "submit" || type === "reset" || type === "button") return "button";
      if (type === "search") return "searchbox";
      if (type === "range") return "slider";
      if (type === "number") return "spinbutton";
      return type;
    case "select": return "combobox";
    case "textarea": return "textbox";
    case "img": return "img";
    case "nav": return "navigation";
    case "main": return "main";
    case "header": return "banner";
    case "footer": return "contentinfo";
    default: return "";
  }
}

function getElementRole(element: Element): { role: string; roleSource: "explicit" | "implicit" | "none" } {
  const explicitRole = element.getAttribute("role");
  if (explicitRole) return { role: explicitRole, roleSource: "explicit" };

  const implicit = getImplicitRole(element);
  if (implicit) return { role: implicit, roleSource: "implicit" };

  return { role: "", roleSource: "none" };
}

function getAriaProperties(element: Element): AriaProperty[] {
  const props: AriaProperty[] = [];
  for (const attr of Array.from(element.attributes)) {
    if (
      attr.name.startsWith("aria-") &&
      attr.name !== "aria-label" &&
      attr.name !== "aria-labelledby"
    ) {
      props.push({ name: attr.name, value: attr.value });
    }
  }
  return props;
}

const FOCUSABLE_TAGS = new Set(["a", "button", "input", "select", "textarea"]);

function isFocusable(element: Element): boolean {
  const tag = element.tagName.toLowerCase();

  // Disabled elements are not focusable
  if (element.hasAttribute("disabled")) return false;

  // Elements with tabindex are focusable
  if (element.hasAttribute("tabindex")) {
    const ti = parseInt(element.getAttribute("tabindex")!, 10);
    return !isNaN(ti) && ti >= -1;
  }

  // Naturally focusable elements
  if (tag === "a") return element.hasAttribute("href");
  if (FOCUSABLE_TAGS.has(tag)) return true;

  // contenteditable
  const ce = element.getAttribute("contenteditable");
  if (ce !== null && ce !== "false") return true;

  return false;
}

function isInTabOrder(element: Element): boolean {
  if (!isFocusable(element)) return false;
  const attr = element.getAttribute("tabindex");
  if (attr !== null) {
    const ti = parseInt(attr, 10);
    return !isNaN(ti) && ti >= 0;
  }
  return true; // naturally focusable elements are in tab order
}

function getTabIndex(element: Element): number | null {
  const attr = element.getAttribute("tabindex");
  if (attr === null) return null;
  const parsed = parseInt(attr, 10);
  return isNaN(parsed) ? null : parsed;
}

function getMissingRequired(element: Element, role: string, roleSource: "explicit" | "implicit" | "none"): string[] {
  // Only check for explicit roles
  if (roleSource !== "explicit") return [];

  const required = REQUIRED_ARIA_PROPS[role];
  if (!required) return [];

  return required.filter((prop) => !element.hasAttribute(prop));
}

export function analyzeElementForInspector(element: Element): InspectorResult {
  const accessibleName = getAccessibleNameWithSource(element);
  const { role, roleSource } = getElementRole(element);
  const ariaProperties = getAriaProperties(element);
  const focusable = isFocusable(element);
  const tabOrder = isInTabOrder(element);
  const tabIndex = getTabIndex(element);
  const missingRequired = getMissingRequired(element, role, roleSource);

  return {
    selector: generateSelector(element),
    tagName: element.tagName.toLowerCase(),
    accessibleName,
    role,
    roleSource,
    ariaProperties,
    focusable,
    inTabOrder: tabOrder,
    tabIndex,
    missingRequired,
  };
}
