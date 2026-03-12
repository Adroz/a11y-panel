import { describe, it, expect } from "vitest";
import { buildCriterionHighlightMap } from "@/lib/checklist/criterion-highlights";
import type { ScanViolation, CustomCheckCounts } from "@/types/scan";

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

function makeCustomChecks(overrides: Partial<CustomCheckCounts> = {}): CustomCheckCounts {
  return {
    trapCount: 0,
    textSpacingFailCount: 0,
    focusOrderInversionCount: 0,
    focusVisibleMissingCount: 0,
    captionFailCount: null,
    keyboardFailCount: null,
    hasMedia: false,
    hasFormFields: false,
    ...overrides,
  };
}

describe("buildCriterionHighlightMap — custom checks", () => {
  it("adds trap selectors to 2.1.2 with critical impact", () => {
    const customChecks = makeCustomChecks({
      trapCount: 1,
      trapSelectors: [".modal-trap"],
    });
    const map = buildCriterionHighlightMap([], customChecks);
    expect(map.has("2.1.2")).toBe(true);
    expect(map.get("2.1.2")).toHaveLength(1);
    expect(map.get("2.1.2")![0]).toEqual({ selector: ".modal-trap", impact: "critical" });
  });

  it("adds text spacing selectors to 1.4.12 with moderate impact", () => {
    const customChecks = makeCustomChecks({
      textSpacingFailCount: 2,
      textSpacingSelectors: [".tight-box", ".clipped-text"],
    });
    const map = buildCriterionHighlightMap([], customChecks);
    expect(map.get("1.4.12")).toHaveLength(2);
    expect(map.get("1.4.12")![0].impact).toBe("moderate");
  });

  it("adds focus order selectors to 2.4.3 with moderate impact", () => {
    const customChecks = makeCustomChecks({
      focusOrderInversionCount: 1,
      focusOrderSelectors: ["#nav-link"],
    });
    const map = buildCriterionHighlightMap([], customChecks);
    expect(map.get("2.4.3")).toHaveLength(1);
    expect(map.get("2.4.3")![0].impact).toBe("moderate");
  });

  it("adds focus visible selectors to 2.4.7 with serious impact", () => {
    const customChecks = makeCustomChecks({
      focusVisibleMissingCount: 1,
      focusVisibleSelectors: ["button.no-outline"],
    });
    const map = buildCriterionHighlightMap([], customChecks);
    expect(map.get("2.4.7")).toHaveLength(1);
    expect(map.get("2.4.7")![0].impact).toBe("serious");
  });

  it("adds keyboard selectors to 2.1.1 with serious impact", () => {
    const customChecks = makeCustomChecks({
      keyboardFailCount: 2,
      keyboardSelectors: ["div.clickable", "span[role='button']"],
    });
    const map = buildCriterionHighlightMap([], customChecks);
    expect(map.get("2.1.1")).toHaveLength(2);
    expect(map.get("2.1.1")![0].impact).toBe("serious");
  });

  it("skips custom checks with empty selector arrays", () => {
    const customChecks = makeCustomChecks({
      trapSelectors: [],
      textSpacingSelectors: [],
    });
    const map = buildCriterionHighlightMap([], customChecks);
    expect(map.size).toBe(0);
  });

  it("skips custom checks with undefined selector arrays", () => {
    const customChecks = makeCustomChecks();
    const map = buildCriterionHighlightMap([], customChecks);
    expect(map.size).toBe(0);
  });

  it("merges custom check selectors with axe violation targets for the same criterion", () => {
    const violation = makeViolation({
      id: "keyboard-trap",
      tags: ["wcag212"],
      nodes: [{ target: [".axe-trap"], html: "<div>", failureSummary: "" }],
    });
    const customChecks = makeCustomChecks({
      trapCount: 1,
      trapSelectors: [".custom-trap"],
    });
    const map = buildCriterionHighlightMap([violation], customChecks);
    expect(map.get("2.1.2")!.length).toBe(2);
    expect(map.get("2.1.2")!.map((t) => t.selector)).toContain(".axe-trap");
    expect(map.get("2.1.2")!.map((t) => t.selector)).toContain(".custom-trap");
  });
});
