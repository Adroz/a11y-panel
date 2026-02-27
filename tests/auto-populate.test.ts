import { describe, it, expect, beforeEach } from "vitest";
import "./setup";
import { useChecklistStore } from "@/hooks/use-checklist";
import { getAutoPopulatedResults, AXE_TO_WCAG } from "@/lib/checklist/auto-populate";
import { WCAG_CRITERIA } from "@/lib/checklist/criteria";
import type { ScanViolation } from "@/types/scan";

function resetStore() {
  useChecklistStore.getState().resetAll();
}

function makeViolation(overrides: Partial<ScanViolation> = {}): ScanViolation {
  return {
    id: "image-alt",
    impact: "critical",
    description: "Images must have alt text",
    help: "Images must have alternate text",
    helpUrl: "https://dequeuniversity.com/rules/axe/4.4/image-alt",
    tags: ["wcag2a", "wcag111"],
    nodes: [{ target: ["img"], html: "<img src='x'>", failureSummary: "Fix it" }],
    ...overrides,
  };
}

describe("getAutoPopulatedResults", () => {
  it("returns empty map for no violations", () => {
    const results = getAutoPopulatedResults([]);
    expect(results.size).toBe(0);
  });

  it("maps violation to correct criterion via AXE_TO_WCAG", () => {
    const violation = makeViolation({ id: "image-alt", tags: [] });
    const results = getAutoPopulatedResults([violation]);
    expect(results.get("1.1.1")).toBe("fail");
  });

  it("maps violation via WCAG tag parsing", () => {
    const violation = makeViolation({ id: "unknown-rule", tags: ["wcag143"] });
    const results = getAutoPopulatedResults([violation]);
    expect(results.get("1.4.3")).toBe("fail");
  });

  it("combines AXE_TO_WCAG and tag-based mapping", () => {
    const violation = makeViolation({
      id: "color-contrast",
      tags: ["wcag2aa", "wcag143"],
    });
    const results = getAutoPopulatedResults([violation]);
    // From AXE_TO_WCAG: color-contrast → 1.4.3
    // From tag parsing: wcag143 → 1.4.3
    expect(results.get("1.4.3")).toBe("fail");
  });

  it("handles multi-criterion mappings", () => {
    const violation = makeViolation({
      id: "link-name",
      tags: ["wcag2a", "wcag244"],
    });
    const results = getAutoPopulatedResults([violation]);
    // link-name maps to both 2.4.4 and 4.1.2
    expect(results.get("2.4.4")).toBe("fail");
    expect(results.get("4.1.2")).toBe("fail");
  });

  it("handles multiple violations", () => {
    const violations = [
      makeViolation({ id: "image-alt", tags: ["wcag111"] }),
      makeViolation({ id: "color-contrast", tags: ["wcag143"] }),
      makeViolation({ id: "document-title", tags: ["wcag242"] }),
    ];
    const results = getAutoPopulatedResults(violations);
    expect(results.get("1.1.1")).toBe("fail");
    expect(results.get("1.4.3")).toBe("fail");
    expect(results.get("2.4.2")).toBe("fail");
  });

  it("ignores non-WCAG tags", () => {
    const violation = makeViolation({ id: "unknown-rule", tags: ["best-practice", "cat.text-alternatives"] });
    const results = getAutoPopulatedResults([violation]);
    expect(results.size).toBe(0);
  });
});

describe("autoPopulateFromScan store integration", () => {
  beforeEach(resetStore);

  it("auto-populates statuses from scan violations", () => {
    const violations = [
      makeViolation({ id: "image-alt", tags: ["wcag111"] }),
      makeViolation({ id: "color-contrast", tags: ["wcag143"] }),
    ];
    useChecklistStore.getState().autoPopulateFromScan(violations);

    const { statuses } = useChecklistStore.getState();
    expect(statuses["1.1.1"]).toBe("fail");
    expect(statuses["1.4.3"]).toBe("fail");
  });

  it("does not overwrite manually-set statuses", () => {
    useChecklistStore.getState().setStatus("1.1.1", "pass");

    const violations = [makeViolation({ id: "image-alt", tags: ["wcag111"] })];
    useChecklistStore.getState().autoPopulateFromScan(violations);

    expect(useChecklistStore.getState().statuses["1.1.1"]).toBe("pass");
  });

  it("tracks auto-populated criterion IDs", () => {
    const violations = [makeViolation({ id: "image-alt", tags: ["wcag111"] })];
    useChecklistStore.getState().autoPopulateFromScan(violations);

    expect(useChecklistStore.getState().autoPopulated.has("1.1.1")).toBe(true);
  });

  it("does not mark manually-set criteria as auto-populated", () => {
    useChecklistStore.getState().setStatus("1.1.1", "pass");

    const violations = [makeViolation({ id: "image-alt", tags: ["wcag111"] })];
    useChecklistStore.getState().autoPopulateFromScan(violations);

    expect(useChecklistStore.getState().autoPopulated.has("1.1.1")).toBe(false);
  });
});

describe("AXE_TO_WCAG mapping integrity", () => {
  it("all mapped criterion IDs are valid", () => {
    const validIds = new Set(WCAG_CRITERIA.map((c) => c.id));

    for (const [ruleId, criterionIds] of Object.entries(AXE_TO_WCAG)) {
      for (const id of criterionIds) {
        expect(validIds.has(id), `AXE_TO_WCAG["${ruleId}"] maps to unknown criterion "${id}"`).toBe(true);
      }
    }
  });
});
