import { describe, it, expect, beforeEach } from "vitest";
import "./setup";
import { useChecklistStore } from "@/hooks/use-checklist";
import { WCAG_CRITERIA } from "@/lib/checklist/criteria";

function resetStore() {
  useChecklistStore.getState().resetAll();
}

// Direct progress calculation (mirrors useCategoryProgress / useChecklistProgress logic)
function calculateProgress(criteriaIds: string[]) {
  const statuses = useChecklistStore.getState().statuses;
  let pass = 0, fail = 0, na = 0, untested = 0;
  for (const id of criteriaIds) {
    switch (statuses[id]) {
      case "pass": pass++; break;
      case "fail": fail++; break;
      case "not-applicable": na++; break;
      default: untested++; break;
    }
  }
  return { total: criteriaIds.length, pass, fail, na, untested, tested: pass + fail + na };
}

describe("Progress calculation — overall", () => {
  beforeEach(resetStore);

  it("starts with all 50 untested", () => {
    const allIds = WCAG_CRITERIA.map((c) => c.id);
    const progress = calculateProgress(allIds);
    expect(progress.total).toBe(50);
    expect(progress.untested).toBe(50);
    expect(progress.tested).toBe(0);
  });

  it("counts pass correctly", () => {
    useChecklistStore.getState().setStatus("1.1.1", "pass");
    useChecklistStore.getState().setStatus("1.4.3", "pass");
    const allIds = WCAG_CRITERIA.map((c) => c.id);
    const progress = calculateProgress(allIds);
    expect(progress.pass).toBe(2);
    expect(progress.tested).toBe(2);
    expect(progress.untested).toBe(48);
  });

  it("counts mixed statuses correctly", () => {
    useChecklistStore.getState().setStatus("1.1.1", "pass");
    useChecklistStore.getState().setStatus("1.4.3", "fail");
    useChecklistStore.getState().setStatus("2.1.1", "not-applicable");
    const allIds = WCAG_CRITERIA.map((c) => c.id);
    const progress = calculateProgress(allIds);
    expect(progress.pass).toBe(1);
    expect(progress.fail).toBe(1);
    expect(progress.na).toBe(1);
    expect(progress.tested).toBe(3);
    expect(progress.untested).toBe(47);
  });
});

describe("Progress calculation — per-category", () => {
  beforeEach(resetStore);

  it("calculates progress for a subset of criteria", () => {
    const categoryIds = ["2.1.1", "2.1.2", "2.1.4"]; // Keyboard category
    useChecklistStore.getState().setStatus("2.1.1", "pass");
    useChecklistStore.getState().setStatus("2.1.2", "fail");

    const progress = calculateProgress(categoryIds);
    expect(progress.total).toBe(3);
    expect(progress.pass).toBe(1);
    expect(progress.fail).toBe(1);
    expect(progress.untested).toBe(1);
    expect(progress.tested).toBe(2);
  });

  it("returns all untested for an untouched category", () => {
    const categoryIds = ["2.4.3", "2.4.7"]; // Focus category
    const progress = calculateProgress(categoryIds);
    expect(progress.total).toBe(2);
    expect(progress.untested).toBe(2);
    expect(progress.tested).toBe(0);
  });
});
