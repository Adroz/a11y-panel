import { PLAIN_VIOLATIONS } from "./violations";
import { PLAIN_CHECKLIST } from "./checklist";
import type { ScanViolation } from "@/types/scan";
import type { WcagCriterion } from "@/lib/checklist";

export { PLAIN_VIOLATIONS } from "./violations";
export { PLAIN_CHECKLIST } from "./checklist";

export function getViolationText(
  violation: ScanViolation,
  field: "help" | "description",
  plain: boolean,
): string {
  if (!plain) return violation[field];
  return PLAIN_VIOLATIONS[violation.id]?.[field] ?? violation[field];
}

export function getFixText(
  violation: ScanViolation,
  nodeFailureSummary: string,
  plain: boolean,
): string {
  if (!plain) return nodeFailureSummary;
  return PLAIN_VIOLATIONS[violation.id]?.fix ?? nodeFailureSummary;
}

export function getChecklistText(
  criterion: WcagCriterion,
  field: "description",
  plain: boolean,
): string {
  if (!plain) return criterion[field];
  return PLAIN_CHECKLIST[criterion.id]?.[field] ?? criterion[field];
}

export function getChecklistSteps(
  criterion: WcagCriterion,
  plain: boolean,
): string[] {
  if (!plain) return criterion.testingSteps;
  return PLAIN_CHECKLIST[criterion.id]?.testingSteps ?? criterion.testingSteps;
}
