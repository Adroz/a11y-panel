import type { Impact, ScanViolation } from "@/types/scan";

export type WcagCategory =
  | "wcag2a"
  | "wcag2aa"
  | "wcag21aa"
  | "wcag22aa"
  | "best-practice";

export interface FilterState {
  impacts: Set<Impact>;
  categories: Set<WcagCategory>;
}

export const WCAG_CATEGORIES: { value: WcagCategory; label: string }[] = [
  { value: "wcag2a", label: "WCAG 2.0 A" },
  { value: "wcag2aa", label: "WCAG 2.0 AA" },
  { value: "wcag21aa", label: "WCAG 2.1 AA" },
  { value: "wcag22aa", label: "WCAG 2.2 AA" },
  { value: "best-practice", label: "Best Practice" },
];

/**
 * Returns only violations whose impact is in the given set.
 * If the set is empty, returns all violations.
 */
export function filterByImpact(
  violations: ScanViolation[],
  impacts: Set<Impact>,
): ScanViolation[] {
  if (impacts.size === 0) return violations;
  return violations.filter((v) => impacts.has(v.impact));
}

/**
 * Filters violations by WCAG category derived from axe-core tags.
 * A violation matches if any of its tags contains a matching category.
 * If the set is empty, returns all violations.
 */
export function filterByWcagCategory(
  violations: ScanViolation[],
  categories: Set<WcagCategory>,
): ScanViolation[] {
  if (categories.size === 0) return violations;
  return violations.filter((v) =>
    v.tags.some((tag) => categories.has(tag as WcagCategory)),
  );
}

/**
 * Applies both impact and WCAG category filters sequentially.
 */
export function applyFilters(
  violations: ScanViolation[],
  filters: FilterState,
): ScanViolation[] {
  const afterImpact = filterByImpact(violations, filters.impacts);
  return filterByWcagCategory(afterImpact, filters.categories);
}

