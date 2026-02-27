import { describe, it, expect } from "vitest";
import { buildCriterionHighlightMap } from "@/lib/checklist/criterion-highlights";
import type { ScanViolation } from "@/types/scan";

function makeViolation(overrides: Partial<ScanViolation> = {}): ScanViolation {
  return {
    id: "image-alt",
    impact: "critical",
    description: "Images must have alt text",
    help: "Images must have alternate text",
    helpUrl: "https://example.com",
    tags: ["wcag111"],
    nodes: [{ target: ["img.hero"], html: "<img>", failureSummary: "Fix it" }],
    ...overrides,
  };
}

describe("buildCriterionHighlightMap", () => {
  it("returns empty map for no violations", () => {
    const map = buildCriterionHighlightMap([]);
    expect(map.size).toBe(0);
  });

  it("maps violation to criterion via AXE_TO_WCAG", () => {
    const violation = makeViolation({ id: "image-alt", tags: [] });
    const map = buildCriterionHighlightMap([violation]);
    expect(map.has("1.1.1")).toBe(true);
    expect(map.get("1.1.1")).toHaveLength(1);
    expect(map.get("1.1.1")![0].selector).toBe("img.hero");
    expect(map.get("1.1.1")![0].impact).toBe("critical");
  });

  it("maps violation to criterion via WCAG tag", () => {
    const violation = makeViolation({ id: "unknown-rule", tags: ["wcag143"] });
    const map = buildCriterionHighlightMap([violation]);
    expect(map.has("1.4.3")).toBe(true);
  });

  it("combines nodes from multiple violations for the same criterion", () => {
    const violations = [
      makeViolation({
        id: "image-alt",
        tags: [],
        nodes: [{ target: ["img.a"], html: "<img>", failureSummary: "" }],
      }),
      makeViolation({
        id: "svg-img-alt",
        tags: [],
        nodes: [{ target: ["svg.b"], html: "<svg>", failureSummary: "" }],
      }),
    ];
    const map = buildCriterionHighlightMap(violations);
    // Both map to 1.1.1
    expect(map.get("1.1.1")!.length).toBe(2);
  });

  it("maps a single violation to multiple criteria", () => {
    const violation = makeViolation({
      id: "link-name",
      tags: ["wcag244"],
      nodes: [{ target: ["a.link"], html: "<a>", failureSummary: "" }],
    });
    const map = buildCriterionHighlightMap([violation]);
    // link-name maps to 2.4.4 and 4.1.2
    expect(map.has("2.4.4")).toBe(true);
    expect(map.has("4.1.2")).toBe(true);
  });

  it("includes all nodes from a multi-node violation", () => {
    const violation = makeViolation({
      id: "image-alt",
      tags: [],
      nodes: [
        { target: ["img.one"], html: "<img>", failureSummary: "" },
        { target: ["img.two"], html: "<img>", failureSummary: "" },
        { target: ["img.three"], html: "<img>", failureSummary: "" },
      ],
    });
    const map = buildCriterionHighlightMap([violation]);
    expect(map.get("1.1.1")).toHaveLength(3);
  });

  it("preserves impact level from the violation", () => {
    const violation = makeViolation({
      id: "color-contrast",
      impact: "serious",
      tags: ["wcag143"],
      nodes: [{ target: [".text"], html: "<p>", failureSummary: "" }],
    });
    const map = buildCriterionHighlightMap([violation]);
    expect(map.get("1.4.3")![0].impact).toBe("serious");
  });
});
