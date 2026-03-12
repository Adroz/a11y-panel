/** Strip query params and hash — keep origin + pathname only. */
export function normalizePageUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.origin + u.pathname;
  } catch {
    return url;
  }
}

/** Chrome storage key for a page's checklist state. */
export function checklistStorageKey(url: string): string {
  return `checklist:${normalizePageUrl(url)}`;
}
