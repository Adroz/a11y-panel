const MAX_NAME_LENGTH = 60;

function truncate(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= MAX_NAME_LENGTH) return trimmed;
  return trimmed.slice(0, MAX_NAME_LENGTH - 1) + "…";
}

export function getAccessibleName(element: Element): string {
  // 1. aria-label
  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel) return truncate(ariaLabel);

  // 2. aria-labelledby
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    const parts = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .filter(Boolean);
    if (parts.length > 0) return truncate(parts.join(" "));
  }

  // 3. alt (for images / inputs with type=image)
  const alt = element.getAttribute("alt");
  if (alt) return truncate(alt);

  // 4. <label> association (for form controls)
  if (element instanceof HTMLElement) {
    const id = element.id;
    if (id) {
      const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
      if (label?.textContent) return truncate(label.textContent);
    }
    // Also check wrapping <label>
    const parentLabel = element.closest("label");
    if (parentLabel?.textContent) return truncate(parentLabel.textContent);
  }

  // 5. title attribute
  const title = element.getAttribute("title");
  if (title) return truncate(title);

  // 6. placeholder (for inputs)
  const placeholder = element.getAttribute("placeholder");
  if (placeholder) return truncate(placeholder);

  // 7. textContent
  const text = element.textContent;
  if (text?.trim()) return truncate(text);

  return "";
}
