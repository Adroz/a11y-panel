import { describe, it, expect, beforeEach, vi } from "vitest";
import "./setup";
import { useChecklistStore } from "@/hooks/use-checklist";
import { ASSESSMENT_CATEGORIES } from "@/lib/checklist/categories";
import { WCAG_CRITERIA } from "@/lib/checklist/criteria";
import type { CustomCheckCounts } from "@/types/scan";

const DEFAULT_CUSTOM_CHECKS: CustomCheckCounts = {
  trapCount: 0,
  textSpacingFailCount: 0,
  focusOrderInversionCount: 0,
  focusVisibleMissingCount: 0,
  captionFailCount: null,
  keyboardFailCount: null,
  hasMedia: false,
  hasFormFields: false,
};

function resetStore() {
  useChecklistStore.setState({
    currentUrl: null,
    statuses: Object.fromEntries(WCAG_CRITERIA.map((c) => [c.id, "untested" as const])),
    autoPopulated: new Set(),
    autoDetails: {},
    activeCategoryKey: null,
    activeCriterionIndex: 0,
  });
  vi.mocked(chrome.storage.local.get).mockResolvedValue({});
  vi.mocked(chrome.storage.local.set).mockResolvedValue(undefined);
  vi.mocked(chrome.storage.local.remove).mockResolvedValue(undefined);
}

describe("Checklist store — navigation", () => {
  beforeEach(resetStore);

  it("starts with no active category", () => {
    const { activeCategoryKey, activeCriterionIndex } = useChecklistStore.getState();
    expect(activeCategoryKey).toBeNull();
    expect(activeCriterionIndex).toBe(0);
  });

  it("enterCategory opens a category", () => {
    useChecklistStore.getState().enterCategory("keyboard");
    const { activeCategoryKey, activeCriterionIndex } = useChecklistStore.getState();
    expect(activeCategoryKey).toBe("keyboard");
    expect(activeCriterionIndex).toBe(0);
  });

  it("enterCategory toggles off when called with the same key", () => {
    useChecklistStore.getState().enterCategory("keyboard");
    useChecklistStore.getState().enterCategory("keyboard");
    expect(useChecklistStore.getState().activeCategoryKey).toBeNull();
  });

  it("enterCategory switches to a different category", () => {
    useChecklistStore.getState().enterCategory("keyboard");
    useChecklistStore.getState().enterCategory("focus");
    expect(useChecklistStore.getState().activeCategoryKey).toBe("focus");
    expect(useChecklistStore.getState().activeCriterionIndex).toBe(0);
  });

  it("exitCategory clears active state", () => {
    useChecklistStore.getState().enterCategory("keyboard");
    useChecklistStore.getState().exitCategory();
    expect(useChecklistStore.getState().activeCategoryKey).toBeNull();
  });

  it("nextCriterion advances within a category", () => {
    useChecklistStore.getState().enterCategory("keyboard"); // 3 criteria
    useChecklistStore.getState().nextCriterion();
    expect(useChecklistStore.getState().activeCriterionIndex).toBe(1);
  });

  it("prevCriterion goes back within a category", () => {
    useChecklistStore.getState().enterCategory("keyboard");
    useChecklistStore.getState().nextCriterion();
    useChecklistStore.getState().prevCriterion();
    expect(useChecklistStore.getState().activeCriterionIndex).toBe(0);
  });

  it("prevCriterion does not go below 0", () => {
    useChecklistStore.getState().enterCategory("keyboard");
    useChecklistStore.getState().prevCriterion();
    expect(useChecklistStore.getState().activeCriterionIndex).toBe(0);
  });

  it("goToCriterion jumps to a specific index", () => {
    useChecklistStore.getState().enterCategory("keyboard");
    useChecklistStore.getState().goToCriterion(2);
    expect(useChecklistStore.getState().activeCriterionIndex).toBe(2);
  });
});

describe("Checklist store — auto-advance", () => {
  beforeEach(resetStore);

  it("nextCriterion past last criterion auto-opens next category", () => {
    const firstCategory = ASSESSMENT_CATEGORIES[0];
    const secondCategory = ASSESSMENT_CATEGORIES[1];

    useChecklistStore.getState().enterCategory(firstCategory.key);
    // Navigate to last criterion
    for (let i = 0; i < firstCategory.criteriaIds.length - 1; i++) {
      useChecklistStore.getState().nextCriterion();
    }
    // One more should open the next category
    useChecklistStore.getState().nextCriterion();

    expect(useChecklistStore.getState().activeCategoryKey).toBe(secondCategory.key);
    expect(useChecklistStore.getState().activeCriterionIndex).toBe(0);
  });

  it("nextCriterion past last criterion of last category collapses", () => {
    const lastCategory = ASSESSMENT_CATEGORIES[ASSESSMENT_CATEGORIES.length - 1];

    useChecklistStore.getState().enterCategory(lastCategory.key);
    // Navigate past all criteria
    for (let i = 0; i < lastCategory.criteriaIds.length; i++) {
      useChecklistStore.getState().nextCriterion();
    }

    expect(useChecklistStore.getState().activeCategoryKey).toBeNull();
  });

  it("advanceOnStatus sets status and advances", () => {
    const firstCategory = ASSESSMENT_CATEGORIES[0];
    const criterionId = firstCategory.criteriaIds[0];

    useChecklistStore.getState().enterCategory(firstCategory.key);
    useChecklistStore.getState().advanceOnStatus(criterionId, "pass");

    expect(useChecklistStore.getState().statuses[criterionId]).toBe("pass");
    expect(useChecklistStore.getState().activeCriterionIndex).toBe(1);
  });

  it("advanceOnStatus with untested does not advance", () => {
    const firstCategory = ASSESSMENT_CATEGORIES[0];
    const criterionId = firstCategory.criteriaIds[0];

    useChecklistStore.getState().enterCategory(firstCategory.key);
    useChecklistStore.getState().advanceOnStatus(criterionId, "untested");

    expect(useChecklistStore.getState().statuses[criterionId]).toBe("untested");
    expect(useChecklistStore.getState().activeCriterionIndex).toBe(0);
  });

  it("advanceOnStatus with fail advances", () => {
    const firstCategory = ASSESSMENT_CATEGORIES[0];
    const criterionId = firstCategory.criteriaIds[0];

    useChecklistStore.getState().enterCategory(firstCategory.key);
    useChecklistStore.getState().advanceOnStatus(criterionId, "fail");

    expect(useChecklistStore.getState().statuses[criterionId]).toBe("fail");
    expect(useChecklistStore.getState().activeCriterionIndex).toBe(1);
  });

  it("advanceOnStatus with not-applicable advances", () => {
    const firstCategory = ASSESSMENT_CATEGORIES[0];
    const criterionId = firstCategory.criteriaIds[0];

    useChecklistStore.getState().enterCategory(firstCategory.key);
    useChecklistStore.getState().advanceOnStatus(criterionId, "not-applicable");

    expect(useChecklistStore.getState().statuses[criterionId]).toBe("not-applicable");
    expect(useChecklistStore.getState().activeCriterionIndex).toBe(1);
  });
});

describe("Checklist store — status management", () => {
  beforeEach(resetStore);

  it("all statuses start as untested", () => {
    const { statuses } = useChecklistStore.getState();
    for (const status of Object.values(statuses)) {
      expect(status).toBe("untested");
    }
  });

  it("setStatus updates a single criterion", () => {
    useChecklistStore.getState().setStatus("1.1.1", "pass");
    expect(useChecklistStore.getState().statuses["1.1.1"]).toBe("pass");
  });

  it("resetAll clears all statuses back to untested", () => {
    useChecklistStore.getState().setStatus("1.1.1", "pass");
    useChecklistStore.getState().setStatus("1.4.3", "fail");
    useChecklistStore.getState().resetAll();

    const { statuses } = useChecklistStore.getState();
    expect(statuses["1.1.1"]).toBe("untested");
    expect(statuses["1.4.3"]).toBe("untested");
  });

  it("resetAll clears navigation state", () => {
    useChecklistStore.getState().enterCategory("keyboard");
    useChecklistStore.getState().nextCriterion();
    useChecklistStore.getState().resetAll();

    expect(useChecklistStore.getState().activeCategoryKey).toBeNull();
    expect(useChecklistStore.getState().activeCriterionIndex).toBe(0);
  });
});

describe("Checklist store — per-URL state", () => {
  beforeEach(resetStore);

  it("loadForUrl sets currentUrl", async () => {
    useChecklistStore.getState().loadForUrl("https://example.com/about");
    expect(useChecklistStore.getState().currentUrl).toBe("https://example.com/about");
  });

  it("loadForUrl is a no-op for the same URL", () => {
    useChecklistStore.getState().loadForUrl("https://example.com/about");
    useChecklistStore.getState().setStatus("1.1.1", "pass");
    useChecklistStore.getState().loadForUrl("https://example.com/about");
    // Status should not be reset
    expect(useChecklistStore.getState().statuses["1.1.1"]).toBe("pass");
  });

  it("loadForUrl loads persisted per-URL state", async () => {
    const savedData = {
      statuses: { ...Object.fromEntries(WCAG_CRITERIA.map((c) => [c.id, "untested" as const])), "1.1.1": "pass" as const },
      autoPopulated: ["1.4.3"],
    };
    vi.mocked(chrome.storage.local.get).mockResolvedValueOnce({
      "checklist:https://example.com/about": savedData,
    });

    useChecklistStore.getState().loadForUrl("https://example.com/about");
    // Wait for async storage load
    await vi.waitFor(() => {
      expect(useChecklistStore.getState().statuses["1.1.1"]).toBe("pass");
    });
    expect(useChecklistStore.getState().autoPopulated.has("1.4.3")).toBe(true);
  });

  it("switching URLs saves current state and loads new one", async () => {
    // Start on page A
    useChecklistStore.getState().loadForUrl("https://a.com/");
    useChecklistStore.getState().setStatus("1.1.1", "pass");

    // Switch to page B (no saved state)
    vi.mocked(chrome.storage.local.get).mockResolvedValueOnce({});
    useChecklistStore.getState().loadForUrl("https://b.com/");

    // Should have saved page A's state
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        "checklist:https://a.com/": expect.objectContaining({
          statuses: expect.objectContaining({ "1.1.1": "pass" }),
        }),
      }),
    );

    // Page B should be fresh
    expect(useChecklistStore.getState().statuses["1.1.1"]).toBe("untested");
    expect(useChecklistStore.getState().currentUrl).toBe("https://b.com/");
  });

  it("fresh URL gets blank state", () => {
    vi.mocked(chrome.storage.local.get).mockResolvedValueOnce({});
    useChecklistStore.getState().loadForUrl("https://new-page.com/");

    const { statuses } = useChecklistStore.getState();
    for (const status of Object.values(statuses)) {
      expect(status).toBe("untested");
    }
  });

  it("loadForUrl resets navigation state", () => {
    useChecklistStore.getState().loadForUrl("https://a.com/");
    useChecklistStore.getState().enterCategory("keyboard");
    useChecklistStore.getState().nextCriterion();

    vi.mocked(chrome.storage.local.get).mockResolvedValueOnce({});
    useChecklistStore.getState().loadForUrl("https://b.com/");

    expect(useChecklistStore.getState().activeCategoryKey).toBeNull();
    expect(useChecklistStore.getState().activeCriterionIndex).toBe(0);
  });

  it("migrates legacy checklistStatuses key on first load", async () => {
    const legacyStatuses = {
      ...Object.fromEntries(WCAG_CRITERIA.map((c) => [c.id, "untested" as const])),
      "1.1.1": "fail" as const,
      "1.4.3": "pass" as const,
    };
    vi.mocked(chrome.storage.local.get).mockResolvedValueOnce({
      checklistStatuses: legacyStatuses,
    });

    useChecklistStore.getState().loadForUrl("https://example.com/");
    await vi.waitFor(() => {
      expect(useChecklistStore.getState().statuses["1.1.1"]).toBe("fail");
    });
    expect(useChecklistStore.getState().statuses["1.4.3"]).toBe("pass");

    // Should have removed the legacy key
    expect(chrome.storage.local.remove).toHaveBeenCalledWith("checklistStatuses");
  });
});

describe("Checklist store — autoPopulated accumulation", () => {
  beforeEach(resetStore);

  it("autoPopulated accumulates across re-scans", () => {
    const violations1 = [
      {
        id: "image-alt",
        impact: "critical" as const,
        description: "desc",
        help: "help",
        helpUrl: "https://example.com",
        tags: ["wcag111"],
        nodes: [{ target: ["img"], html: "<img>", failureSummary: "Fix" }],
      },
    ];
    useChecklistStore.getState().autoPopulateFromScan(violations1, [], DEFAULT_CUSTOM_CHECKS);
    expect(useChecklistStore.getState().autoPopulated.has("1.1.1")).toBe(true);

    // Re-scan with same + new violation
    const violations2 = [
      ...violations1,
      {
        id: "color-contrast",
        impact: "serious" as const,
        description: "desc",
        help: "help",
        helpUrl: "https://example.com",
        tags: ["wcag143"],
        nodes: [{ target: ["p"], html: "<p>", failureSummary: "Fix" }],
      },
    ];
    useChecklistStore.getState().autoPopulateFromScan(violations2, [], DEFAULT_CUSTOM_CHECKS);

    // Both should be in autoPopulated
    expect(useChecklistStore.getState().autoPopulated.has("1.1.1")).toBe(true);
    expect(useChecklistStore.getState().autoPopulated.has("1.4.3")).toBe(true);
  });
});
