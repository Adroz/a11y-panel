import { describe, it, expect, beforeEach } from "vitest";
import "./setup";
import { useChecklistStore } from "@/hooks/use-checklist";
import { ASSESSMENT_CATEGORIES } from "@/lib/checklist/categories";

function resetStore() {
  useChecklistStore.getState().resetAll();
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
