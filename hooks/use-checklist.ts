import { create } from "zustand";
import { WCAG_CRITERIA, ASSESSMENT_CATEGORIES, type WcagPrinciple } from "@/lib/checklist";
import { getAutoPopulatedResults } from "@/lib/checklist";
import type { ScanViolation } from "@/types/scan";

export type CheckStatus = "untested" | "pass" | "fail" | "not-applicable";

interface ChecklistState {
  /** criterion ID → status */
  statuses: Record<string, CheckStatus>;
  /** criterion IDs that were auto-populated from scan results */
  autoPopulated: Set<string>;

  /** Transient navigation state (not persisted) */
  activeCategoryKey: string | null;
  activeCriterionIndex: number;

  setStatus: (criterionId: string, status: CheckStatus) => void;
  advanceOnStatus: (criterionId: string, status: CheckStatus) => void;
  autoPopulateFromScan: (violations: ScanViolation[]) => void;
  resetAll: () => void;
  loadFromStorage: () => void;

  enterCategory: (key: string) => void;
  exitCategory: () => void;
  nextCriterion: () => void;
  prevCriterion: () => void;
  goToCriterion: (index: number) => void;
}

const STORAGE_KEY = "checklistStatuses";

export const useChecklistStore = create<ChecklistState>((set, get) => ({
  statuses: Object.fromEntries(WCAG_CRITERIA.map((c) => [c.id, "untested" as CheckStatus])),
  autoPopulated: new Set(),
  activeCategoryKey: null,
  activeCriterionIndex: 0,

  setStatus: (criterionId, status) => {
    const next = { ...get().statuses, [criterionId]: status };
    set({ statuses: next });
    chrome.storage.local.set({ [STORAGE_KEY]: next });
  },

  advanceOnStatus: (criterionId, status) => {
    get().setStatus(criterionId, status);
    if (status !== "untested") {
      get().nextCriterion();
    }
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
    set({ statuses: fresh, autoPopulated: new Set(), activeCategoryKey: null, activeCriterionIndex: 0 });
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

  enterCategory: (key) => {
    if (get().activeCategoryKey === key) {
      set({ activeCategoryKey: null, activeCriterionIndex: 0 });
    } else {
      set({ activeCategoryKey: key, activeCriterionIndex: 0 });
    }
  },

  exitCategory: () => {
    set({ activeCategoryKey: null, activeCriterionIndex: 0 });
  },

  nextCriterion: () => {
    const { activeCategoryKey, activeCriterionIndex } = get();
    if (!activeCategoryKey) return;

    const category = ASSESSMENT_CATEGORIES.find((c) => c.key === activeCategoryKey);
    if (!category) return;

    if (activeCriterionIndex >= category.criteriaIds.length - 1) {
      // Past last criterion — auto-open next category, or collapse if last
      const currentIndex = ASSESSMENT_CATEGORIES.findIndex((c) => c.key === activeCategoryKey);
      if (currentIndex < ASSESSMENT_CATEGORIES.length - 1) {
        const nextCategory = ASSESSMENT_CATEGORIES[currentIndex + 1];
        set({ activeCategoryKey: nextCategory.key, activeCriterionIndex: 0 });
      } else {
        get().exitCategory();
      }
    } else {
      set({ activeCriterionIndex: activeCriterionIndex + 1 });
    }
  },

  prevCriterion: () => {
    const { activeCriterionIndex } = get();
    if (activeCriterionIndex > 0) {
      set({ activeCriterionIndex: activeCriterionIndex - 1 });
    }
  },

  goToCriterion: (index) => {
    set({ activeCriterionIndex: index });
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

export function useCategoryProgress(criteriaIds: string[]) {
  const statuses = useChecklistStore((s) => s.statuses);
  let pass = 0, fail = 0, na = 0, untested = 0;

  for (const id of criteriaIds) {
    switch (statuses[id]) {
      case "pass": pass++; break;
      case "fail": fail++; break;
      case "not-applicable": na++; break;
      default: untested++; break;
    }
  }

  return { total: criteriaIds.length, pass, fail, na, untested };
}
