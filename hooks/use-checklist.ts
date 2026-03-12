import { create } from "zustand";
import { WCAG_CRITERIA, ASSESSMENT_CATEGORIES, type WcagPrinciple } from "@/lib/checklist";
import { getAutoPopulatedResults } from "@/lib/checklist";
import { checklistStorageKey } from "@/lib/checklist/url";
import type { ScanViolation, ScanPass, CustomCheckCounts } from "@/types/scan";

export type CheckStatus = "untested" | "pass" | "fail" | "not-applicable";

/** Shape persisted per URL in chrome.storage. */
interface PersistedChecklistData {
  statuses: Record<string, CheckStatus>;
  autoPopulated: string[];
  autoDetails?: Record<string, string>;
}

interface ChecklistState {
  /** The URL whose state is currently loaded (null before first load). */
  currentUrl: string | null;
  /** criterion ID → status */
  statuses: Record<string, CheckStatus>;
  /** criterion IDs that were auto-populated from scan results */
  autoPopulated: Set<string>;
  /** criterion ID → detail text explaining why it was auto-populated */
  autoDetails: Record<string, string>;

  /** Transient navigation state (not persisted) */
  activeCategoryKey: string | null;
  activeCriterionIndex: number;

  setStatus: (criterionId: string, status: CheckStatus) => void;
  advanceOnStatus: (criterionId: string, status: CheckStatus) => void;
  autoPopulateFromScan: (violations: ScanViolation[], passes: ScanPass[], customChecks: CustomCheckCounts) => void;
  resetAll: () => void;
  loadForUrl: (url: string) => void;

  enterCategory: (key: string) => void;
  exitCategory: () => void;
  nextCriterion: () => void;
  prevCriterion: () => void;
  goToCriterion: (index: number) => void;
}

const LEGACY_STORAGE_KEY = "checklistStatuses";

function freshStatuses(): Record<string, CheckStatus> {
  return Object.fromEntries(WCAG_CRITERIA.map((c) => [c.id, "untested" as CheckStatus]));
}

function persistForCurrentUrl(state: ChecklistState) {
  if (!state.currentUrl) return;
  const key = checklistStorageKey(state.currentUrl);
  const data: PersistedChecklistData = {
    statuses: state.statuses,
    autoPopulated: [...state.autoPopulated],
    autoDetails: state.autoDetails,
  };
  chrome.storage.local.set({ [key]: data });
}

export const useChecklistStore = create<ChecklistState>((set, get) => ({
  currentUrl: null,
  statuses: freshStatuses(),
  autoPopulated: new Set(),
  autoDetails: {},
  activeCategoryKey: null,
  activeCriterionIndex: 0,

  setStatus: (criterionId, status) => {
    const next = { ...get().statuses, [criterionId]: status };
    set({ statuses: next });
    persistForCurrentUrl({ ...get(), statuses: next });
  },

  advanceOnStatus: (criterionId, status) => {
    get().setStatus(criterionId, status);
    if (status !== "untested") {
      get().nextCriterion();
    }
  },

  autoPopulateFromScan: (violations, passes, customChecks) => {
    const results = getAutoPopulatedResults(violations, passes, customChecks);
    const { statuses, autoPopulated: existing, autoDetails: existingDetails } = get();
    const next = { ...statuses };
    const accumulated = new Set(existing);
    const details = { ...existingDetails };

    for (const [criterionId, result] of results) {
      // Only auto-populate if not already manually set
      if (next[criterionId] === "untested") {
        next[criterionId] = result.status;
        accumulated.add(criterionId);
        if (result.detail) {
          details[criterionId] = result.detail;
        }
      }
    }

    set({ statuses: next, autoPopulated: accumulated, autoDetails: details });
    persistForCurrentUrl({ ...get(), statuses: next, autoPopulated: accumulated, autoDetails: details });
  },

  resetAll: () => {
    set({
      statuses: freshStatuses(),
      autoPopulated: new Set(),
      autoDetails: {},
      activeCategoryKey: null,
      activeCriterionIndex: 0,
    });
    persistForCurrentUrl({ ...get(), statuses: freshStatuses(), autoPopulated: new Set(), autoDetails: {} });
  },

  loadForUrl: (url) => {
    const { currentUrl } = get();
    if (url === currentUrl) return;

    // Save current URL's state before switching
    persistForCurrentUrl(get());

    // Optimistically reset to fresh while loading
    set({
      currentUrl: url,
      statuses: freshStatuses(),
      autoPopulated: new Set(),
      autoDetails: {},
      activeCategoryKey: null,
      activeCriterionIndex: 0,
    });

    const key = checklistStorageKey(url);
    chrome.storage.local.get([key, LEGACY_STORAGE_KEY]).then((data) => {
      // Only apply if we're still on the same URL
      if (get().currentUrl !== url) return;

      const saved = data[key] as PersistedChecklistData | undefined;
      if (saved) {
        set({
          statuses: saved.statuses,
          autoPopulated: new Set(saved.autoPopulated),
          autoDetails: saved.autoDetails ?? {},
        });
        return;
      }

      // Migration: adopt legacy flat key for this URL
      const legacy = data[LEGACY_STORAGE_KEY] as Record<string, CheckStatus> | undefined;
      if (legacy) {
        set({ statuses: legacy });
        // Persist under new key and remove legacy
        persistForCurrentUrl({ ...get(), statuses: legacy });
        chrome.storage.local.remove(LEGACY_STORAGE_KEY);
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
