import { create } from "zustand";
import { WCAG_CRITERIA, type WcagPrinciple } from "@/lib/checklist";
import { getAutoPopulatedResults } from "@/lib/checklist";
import type { ScanViolation } from "@/types/scan";

export type CheckStatus = "untested" | "pass" | "fail" | "not-applicable";

interface ChecklistState {
  /** criterion ID → status */
  statuses: Record<string, CheckStatus>;
  /** criterion IDs that were auto-populated from scan results */
  autoPopulated: Set<string>;

  setStatus: (criterionId: string, status: CheckStatus) => void;
  autoPopulateFromScan: (violations: ScanViolation[]) => void;
  resetAll: () => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = "checklistStatuses";

export const useChecklistStore = create<ChecklistState>((set, get) => ({
  statuses: Object.fromEntries(WCAG_CRITERIA.map((c) => [c.id, "untested" as CheckStatus])),
  autoPopulated: new Set(),

  setStatus: (criterionId, status) => {
    const next = { ...get().statuses, [criterionId]: status };
    set({ statuses: next });
    chrome.storage.local.set({ [STORAGE_KEY]: next });
  },

  autoPopulateFromScan: (violations) => {
    const results = getAutoPopulatedResults(violations);
    const { statuses } = get();
    const next = { ...statuses };
    const autoIds = new Set<string>();

    for (const [criterionId, status] of results) {
      // Only auto-populate if not already manually set
      if (next[criterionId] === "untested") {
        next[criterionId] = status;
        autoIds.add(criterionId);
      }
    }

    set({ statuses: next, autoPopulated: autoIds });
    chrome.storage.local.set({ [STORAGE_KEY]: next });
  },

  resetAll: () => {
    const fresh = Object.fromEntries(
      WCAG_CRITERIA.map((c) => [c.id, "untested" as CheckStatus]),
    );
    set({ statuses: fresh, autoPopulated: new Set() });
    chrome.storage.local.set({ [STORAGE_KEY]: fresh });
  },

  loadFromStorage: () => {
    chrome.storage.local.get(STORAGE_KEY).then((data) => {
      const saved = data[STORAGE_KEY] as Record<string, CheckStatus> | undefined;
      if (saved) {
        set({ statuses: saved });
      }
    });
  },
}));

// Derived helpers
export function useChecklistProgress() {
  const statuses = useChecklistStore((s) => s.statuses);
  const total = WCAG_CRITERIA.length;
  let pass = 0, fail = 0, na = 0, untested = 0;

  for (const status of Object.values(statuses)) {
    switch (status) {
      case "pass": pass++; break;
      case "fail": fail++; break;
      case "not-applicable": na++; break;
      default: untested++; break;
    }
  }

  return { total, pass, fail, na, untested, tested: total - untested };
}

export function usePrincipleProgress(principle: WcagPrinciple) {
  const statuses = useChecklistStore((s) => s.statuses);
  const criteria = WCAG_CRITERIA.filter((c) => c.principle === principle);
  let pass = 0, fail = 0, na = 0, untested = 0;

  for (const c of criteria) {
    switch (statuses[c.id]) {
      case "pass": pass++; break;
      case "fail": fail++; break;
      case "not-applicable": na++; break;
      default: untested++; break;
    }
  }

  return { total: criteria.length, pass, fail, na, untested };
}
