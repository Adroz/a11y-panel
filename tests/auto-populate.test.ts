import { describe, it, expect, beforeEach } from "vitest";
import "./setup";
import { useChecklistStore } from "@/hooks/use-checklist";
import { getAutoPopulatedResults, AXE_TO_WCAG } from "@/lib/checklist/auto-populate";
import { WCAG_CRITERIA } from "@/lib/checklist/criteria";
import type { ScanViolation, ScanPass, CustomCheckCounts } from "@/types/scan";

function resetStore() {
  useChecklistStore.setState({
    currentUrl: null,
    statuses: Object.fromEntries(WCAG_CRITERIA.map((c) => [c.id, "untested" as const])),
    autoPopulated: new Set(),
    autoDetails: {},
    activeCategoryKey: null,
    activeCriterionIndex: 0,
  });
}

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

function makePass(overrides: Partial<ScanPass> = {}): ScanPass {
  return {
    id: "image-alt",
    tags: ["wcag2a", "wcag111"],
    ...overrides,
  };
}

describe("getAutoPopulatedResults", () => {
  it("returns custom check results for no violations or passes", () => {
    const results = getAutoPopulatedResults([], [], DEFAULT_CUSTOM_CHECKS);
    expect(results.get("2.1.2")?.status).toBe("pass");
    expect(results.get("1.4.12")?.status).toBe("pass");
    expect(results.get("2.4.3")?.status).toBe("pass");
    expect(results.get("2.4.7")?.status).toBe("pass");
    // 4 custom checks + 5 multimedia N/A + 5 forms N/A
    expect(results.size).toBe(14);
  });

  it("maps violation to correct criterion via AXE_TO_WCAG", () => {
    const violation = makeViolation({ id: "image-alt", tags: [] });
    const results = getAutoPopulatedResults([violation], [], DEFAULT_CUSTOM_CHECKS);
    expect(results.get("1.1.1")?.status).toBe("fail");
  });

  it("maps violation via WCAG tag parsing", () => {
    const violation = makeViolation({ id: "unknown-rule", tags: ["wcag143"] });
    const results = getAutoPopulatedResults([violation], [], DEFAULT_CUSTOM_CHECKS);
    expect(results.get("1.4.3")?.status).toBe("fail");
  });

  it("combines AXE_TO_WCAG and tag-based mapping", () => {
    const violation = makeViolation({
      id: "color-contrast",
      tags: ["wcag2aa", "wcag143"],
    });
    const results = getAutoPopulatedResults([violation], [], DEFAULT_CUSTOM_CHECKS);
    expect(results.get("1.4.3")?.status).toBe("fail");
  });

  it("handles multi-criterion mappings", () => {
    const violation = makeViolation({
      id: "link-name",
      tags: ["wcag2a", "wcag244"],
    });
    const results = getAutoPopulatedResults([violation], [], DEFAULT_CUSTOM_CHECKS);
    expect(results.get("2.4.4")?.status).toBe("fail");
    expect(results.get("4.1.2")?.status).toBe("fail");
  });

  it("handles multiple violations", () => {
    const violations = [
      makeViolation({ id: "image-alt", tags: ["wcag111"] }),
      makeViolation({ id: "color-contrast", tags: ["wcag143"] }),
      makeViolation({ id: "document-title", tags: ["wcag242"] }),
    ];
    const results = getAutoPopulatedResults(violations, [], DEFAULT_CUSTOM_CHECKS);
    expect(results.get("1.1.1")?.status).toBe("fail");
    expect(results.get("1.4.3")?.status).toBe("fail");
    expect(results.get("2.4.2")?.status).toBe("fail");
  });

  it("ignores non-WCAG tags", () => {
    const violation = makeViolation({ id: "unknown-rule", tags: ["best-practice", "cat.text-alternatives"] });
    const results = getAutoPopulatedResults([violation], [], DEFAULT_CUSTOM_CHECKS);
    expect(results.has("1.1.1")).toBe(false);
    // 4 custom checks + 5 multimedia N/A + 5 forms N/A
    expect(results.size).toBe(14);
  });
});

describe("getAutoPopulatedResults — trap detection (2.1.2)", () => {
  it("auto-populates 2.1.2 as 'pass' when no traps detected", () => {
    const results = getAutoPopulatedResults([], [], { ...DEFAULT_CUSTOM_CHECKS, trapCount: 0 });
    expect(results.get("2.1.2")?.status).toBe("pass");
  });

  it("auto-populates 2.1.2 as 'fail' when traps detected", () => {
    const results = getAutoPopulatedResults([], [], { ...DEFAULT_CUSTOM_CHECKS, trapCount: 3 });
    expect(results.get("2.1.2")?.status).toBe("fail");
  });
});

describe("getAutoPopulatedResults — custom checks", () => {
  it("auto-populates 1.4.12 as 'fail' when text spacing failures detected", () => {
    const results = getAutoPopulatedResults([], [], { ...DEFAULT_CUSTOM_CHECKS, textSpacingFailCount: 2 });
    expect(results.get("1.4.12")?.status).toBe("fail");
  });

  it("auto-populates 1.4.12 as 'pass' when no text spacing failures", () => {
    const results = getAutoPopulatedResults([], [], { ...DEFAULT_CUSTOM_CHECKS, textSpacingFailCount: 0 });
    expect(results.get("1.4.12")?.status).toBe("pass");
  });

  it("auto-populates 2.4.3 as 'fail' when focus order inversions detected", () => {
    const results = getAutoPopulatedResults([], [], { ...DEFAULT_CUSTOM_CHECKS, focusOrderInversionCount: 1 });
    expect(results.get("2.4.3")?.status).toBe("fail");
  });

  it("auto-populates 2.4.3 as 'pass' when no inversions", () => {
    const results = getAutoPopulatedResults([], [], DEFAULT_CUSTOM_CHECKS);
    expect(results.get("2.4.3")?.status).toBe("pass");
  });

  it("auto-populates 2.4.7 as 'fail' when missing focus indicators detected", () => {
    const results = getAutoPopulatedResults([], [], { ...DEFAULT_CUSTOM_CHECKS, focusVisibleMissingCount: 5 });
    expect(results.get("2.4.7")?.status).toBe("fail");
  });

  it("auto-populates 2.4.7 as 'pass' when all elements have focus indicators", () => {
    const results = getAutoPopulatedResults([], [], DEFAULT_CUSTOM_CHECKS);
    expect(results.get("2.4.7")?.status).toBe("pass");
  });

  it("auto-populates 1.2.2 as 'fail' when videos lack captions", () => {
    const results = getAutoPopulatedResults([], [], { ...DEFAULT_CUSTOM_CHECKS, captionFailCount: 2 });
    expect(results.get("1.2.2")?.status).toBe("fail");
  });

  it("auto-populates 1.2.2 as 'pass' when all videos have captions", () => {
    const results = getAutoPopulatedResults([], [], { ...DEFAULT_CUSTOM_CHECKS, captionFailCount: 0 });
    expect(results.get("1.2.2")?.status).toBe("pass");
  });

  it("sets 1.2.2 to N/A when no videos on page (null + no media)", () => {
    const results = getAutoPopulatedResults([], [], { ...DEFAULT_CUSTOM_CHECKS, captionFailCount: null, hasMedia: false });
    expect(results.get("1.2.2")?.status).toBe("not-applicable");
  });

  it("auto-populates 2.1.1 as 'fail' when inaccessible interactive elements found", () => {
    const results = getAutoPopulatedResults([], [], { ...DEFAULT_CUSTOM_CHECKS, keyboardFailCount: 3 });
    expect(results.get("2.1.1")?.status).toBe("fail");
  });

  it("auto-populates 2.1.1 as 'pass' when all interactive elements are keyboard-accessible", () => {
    const results = getAutoPopulatedResults([], [], { ...DEFAULT_CUSTOM_CHECKS, keyboardFailCount: 0 });
    expect(results.get("2.1.1")?.status).toBe("pass");
  });

  it("skips 2.1.1 when no candidates found (null)", () => {
    const results = getAutoPopulatedResults([], [], { ...DEFAULT_CUSTOM_CHECKS, keyboardFailCount: null });
    expect(results.has("2.1.1")).toBe(false);
  });
});

describe("getAutoPopulatedResults — multimedia N/A", () => {
  it("sets all multimedia criteria to N/A when no media elements", () => {
    const results = getAutoPopulatedResults([], [], { ...DEFAULT_CUSTOM_CHECKS, hasMedia: false });
    for (const id of ["1.2.1", "1.2.2", "1.2.3", "1.2.4", "1.2.5"]) {
      expect(results.get(id)?.status).toBe("not-applicable");
      expect(results.get(id)?.detail).toBe("No audio or video elements found on page");
    }
  });

  it("does not set multimedia criteria to N/A when media elements exist", () => {
    const results = getAutoPopulatedResults([], [], { ...DEFAULT_CUSTOM_CHECKS, hasMedia: true });
    expect(results.get("1.2.1")).toBeUndefined();
    expect(results.get("1.2.3")).toBeUndefined();
  });

  it("does not override caption check result with N/A", () => {
    const results = getAutoPopulatedResults([], [], {
      ...DEFAULT_CUSTOM_CHECKS,
      hasMedia: true,
      captionFailCount: 0,
    });
    expect(results.get("1.2.2")?.status).toBe("pass");
  });
});

describe("getAutoPopulatedResults — forms N/A", () => {
  it("sets all forms criteria to N/A when no form fields", () => {
    const results = getAutoPopulatedResults([], [], { ...DEFAULT_CUSTOM_CHECKS, hasFormFields: false });
    for (const id of ["1.3.5", "3.3.1", "3.3.2", "3.3.3", "3.3.4"]) {
      expect(results.get(id)?.status).toBe("not-applicable");
      expect(results.get(id)?.detail).toBe("No form fields found on page");
    }
  });

  it("does not set forms criteria to N/A when form fields exist", () => {
    const results = getAutoPopulatedResults([], [], { ...DEFAULT_CUSTOM_CHECKS, hasFormFields: true });
    for (const id of ["1.3.5", "3.3.1", "3.3.2", "3.3.3", "3.3.4"]) {
      expect(results.get(id)).toBeUndefined();
    }
  });

  it("axe violations override forms N/A", () => {
    const violation = makeViolation({ id: "select-name", tags: ["wcag332"] });
    const results = getAutoPopulatedResults([violation], [], { ...DEFAULT_CUSTOM_CHECKS, hasFormFields: false });
    expect(results.get("3.3.2")?.status).toBe("fail");
    // Other forms criteria still N/A
    expect(results.get("3.3.1")?.status).toBe("not-applicable");
  });
});

describe("getAutoPopulatedResults — detail text", () => {
  it("includes detail for custom check failures", () => {
    const checks: CustomCheckCounts = {
      trapCount: 2,
      textSpacingFailCount: 3,
      focusOrderInversionCount: 1,
      focusVisibleMissingCount: 5,
      captionFailCount: 2,
      keyboardFailCount: 4,
      hasMedia: true,
      hasFormFields: true,
    };
    const results = getAutoPopulatedResults([], [], checks);

    expect(results.get("2.1.2")?.detail).toBe("2 keyboard traps detected");
    expect(results.get("1.4.12")?.detail).toBe("3 elements clipped or hidden when text spacing is adjusted");
    expect(results.get("2.4.3")?.detail).toContain("1 focus order inversion");
    expect(results.get("2.4.7")?.detail).toBe("5 interactive elements with no visible focus indicator");
    expect(results.get("1.2.2")?.detail).toBe("2 videos missing caption or subtitle tracks");
    expect(results.get("2.1.1")?.detail).toBe("4 interactive elements not keyboard-accessible");
  });

  it("uses singular form for count of 1", () => {
    const checks: CustomCheckCounts = {
      trapCount: 1,
      textSpacingFailCount: 1,
      focusOrderInversionCount: 1,
      focusVisibleMissingCount: 1,
      captionFailCount: 1,
      keyboardFailCount: 1,
      hasMedia: true,
      hasFormFields: true,
    };
    const results = getAutoPopulatedResults([], [], checks);

    expect(results.get("2.1.2")?.detail).toBe("1 keyboard trap detected");
    expect(results.get("1.4.12")?.detail).toBe("1 element clipped or hidden when text spacing is adjusted");
    expect(results.get("2.4.3")?.detail).toContain("1 focus order inversion");
    expect(results.get("2.4.7")?.detail).toBe("1 interactive element with no visible focus indicator");
    expect(results.get("1.2.2")?.detail).toBe("1 video missing caption or subtitle tracks");
    expect(results.get("2.1.1")?.detail).toBe("1 interactive element not keyboard-accessible");
  });

  it("omits detail for passes", () => {
    const results = getAutoPopulatedResults([], [], DEFAULT_CUSTOM_CHECKS);
    expect(results.get("2.1.2")?.detail).toBeUndefined();
    expect(results.get("1.4.12")?.detail).toBeUndefined();
  });

  it("includes detail for axe violation failures", () => {
    const violation = makeViolation({
      id: "image-alt",
      tags: ["wcag111"],
      help: "Images must have alternate text",
      nodes: [
        { target: ["img.a"], html: "<img>", failureSummary: "Fix" },
        { target: ["img.b"], html: "<img>", failureSummary: "Fix" },
      ],
    });
    const results = getAutoPopulatedResults([violation], [], DEFAULT_CUSTOM_CHECKS);
    expect(results.get("1.1.1")?.detail).toBe("2 elements: Images must have alternate text");
  });

  it("aggregates multiple violations for same criterion", () => {
    const violations = [
      makeViolation({
        id: "image-alt",
        tags: [],
        help: "Images must have alternate text",
        nodes: [{ target: ["img"], html: "<img>", failureSummary: "Fix" }],
      }),
      makeViolation({
        id: "svg-img-alt",
        tags: [],
        help: "SVG elements with an img role must have an alternative text",
        nodes: [
          { target: ["svg.a"], html: "<svg>", failureSummary: "Fix" },
          { target: ["svg.b"], html: "<svg>", failureSummary: "Fix" },
        ],
      }),
    ];
    const results = getAutoPopulatedResults(violations, [], DEFAULT_CUSTOM_CHECKS);
    expect(results.get("1.1.1")?.detail).toBe(
      "1 element: Images must have alternate text; 2 elements: SVG elements with an img role must have an alternative text",
    );
  });
});

describe("getAutoPopulatedResults — passes", () => {
  it("maps pass to 'pass' for canAutoDetect criterion via AXE_TO_WCAG", () => {
    const pass = makePass({ id: "image-alt", tags: [] });
    const results = getAutoPopulatedResults([], [pass], DEFAULT_CUSTOM_CHECKS);
    expect(results.get("1.1.1")?.status).toBe("pass");
  });

  it("maps pass to 'pass' for canAutoDetect criterion via WCAG tag", () => {
    const pass = makePass({ id: "unknown-rule", tags: ["wcag111"] });
    const results = getAutoPopulatedResults([], [pass], DEFAULT_CUSTOM_CHECKS);
    expect(results.get("1.1.1")?.status).toBe("pass");
  });

  it("violations take precedence over passes", () => {
    const violation = makeViolation({ id: "image-alt", tags: ["wcag111"] });
    const pass = makePass({ id: "image-alt", tags: ["wcag111"] });
    const results = getAutoPopulatedResults([violation], [pass], DEFAULT_CUSTOM_CHECKS);
    expect(results.get("1.1.1")?.status).toBe("fail");
  });

  it("passes are ignored for non-canAutoDetect criteria", () => {
    // 1.3.3 (Sensory Characteristics) has canAutoDetect: false and isn't affected by N/A detection
    const pass = makePass({ id: "unknown-rule", tags: ["wcag133"] });
    const results = getAutoPopulatedResults([], [pass], DEFAULT_CUSTOM_CHECKS);
    expect(results.get("1.3.3")).toBeUndefined();
  });

  it("mixed violations and passes populate correctly", () => {
    const violation = makeViolation({ id: "image-alt", tags: ["wcag111"] });
    const pass = makePass({ id: "color-contrast", tags: ["wcag143"] });
    const results = getAutoPopulatedResults([violation], [pass], DEFAULT_CUSTOM_CHECKS);
    expect(results.get("1.1.1")?.status).toBe("fail");
    expect(results.get("1.4.3")?.status).toBe("pass");
  });
});

describe("autoPopulateFromScan store integration", () => {
  beforeEach(resetStore);

  it("auto-populates statuses from scan violations", () => {
    const violations = [
      makeViolation({ id: "image-alt", tags: ["wcag111"] }),
      makeViolation({ id: "color-contrast", tags: ["wcag143"] }),
    ];
    useChecklistStore.getState().autoPopulateFromScan(violations, [], DEFAULT_CUSTOM_CHECKS);

    const { statuses } = useChecklistStore.getState();
    expect(statuses["1.1.1"]).toBe("fail");
    expect(statuses["1.4.3"]).toBe("fail");
  });

  it("auto-populates statuses from scan passes", () => {
    const passes = [makePass({ id: "image-alt", tags: ["wcag111"] })];
    useChecklistStore.getState().autoPopulateFromScan([], passes, DEFAULT_CUSTOM_CHECKS);

    const { statuses } = useChecklistStore.getState();
    expect(statuses["1.1.1"]).toBe("pass");
  });

  it("pass auto-population adds to autoPopulated set", () => {
    const passes = [makePass({ id: "image-alt", tags: ["wcag111"] })];
    useChecklistStore.getState().autoPopulateFromScan([], passes, DEFAULT_CUSTOM_CHECKS);

    expect(useChecklistStore.getState().autoPopulated.has("1.1.1")).toBe(true);
  });

  it("does not overwrite manually-set statuses", () => {
    useChecklistStore.getState().setStatus("1.1.1", "pass");

    const violations = [makeViolation({ id: "image-alt", tags: ["wcag111"] })];
    useChecklistStore.getState().autoPopulateFromScan(violations, [], DEFAULT_CUSTOM_CHECKS);

    expect(useChecklistStore.getState().statuses["1.1.1"]).toBe("pass");
  });

  it("tracks auto-populated criterion IDs", () => {
    const violations = [makeViolation({ id: "image-alt", tags: ["wcag111"] })];
    useChecklistStore.getState().autoPopulateFromScan(violations, [], DEFAULT_CUSTOM_CHECKS);

    expect(useChecklistStore.getState().autoPopulated.has("1.1.1")).toBe(true);
  });

  it("does not mark manually-set criteria as auto-populated", () => {
    useChecklistStore.getState().setStatus("1.1.1", "pass");

    const violations = [makeViolation({ id: "image-alt", tags: ["wcag111"] })];
    useChecklistStore.getState().autoPopulateFromScan(violations, [], DEFAULT_CUSTOM_CHECKS);

    expect(useChecklistStore.getState().autoPopulated.has("1.1.1")).toBe(false);
  });

  it("auto-populates custom check criteria", () => {
    const checks: CustomCheckCounts = {
      trapCount: 1,
      textSpacingFailCount: 2,
      focusOrderInversionCount: 0,
      focusVisibleMissingCount: 3,
      captionFailCount: 1,
      keyboardFailCount: null,
      hasMedia: true,
      hasFormFields: true,
    };
    useChecklistStore.getState().autoPopulateFromScan([], [], checks);

    const { statuses } = useChecklistStore.getState();
    expect(statuses["2.1.2"]).toBe("fail");
    expect(statuses["1.4.12"]).toBe("fail");
    expect(statuses["2.4.3"]).toBe("pass");
    expect(statuses["2.4.7"]).toBe("fail");
    expect(statuses["1.2.2"]).toBe("fail");
    expect(statuses["2.1.1"]).toBe("untested"); // null → skipped
  });

  it("stores detail text for auto-populated failures", () => {
    const checks: CustomCheckCounts = {
      ...DEFAULT_CUSTOM_CHECKS,
      trapCount: 2,
      textSpacingFailCount: 3,
    };
    useChecklistStore.getState().autoPopulateFromScan([], [], checks);

    const { autoDetails } = useChecklistStore.getState();
    expect(autoDetails["2.1.2"]).toBe("2 keyboard traps detected");
    expect(autoDetails["1.4.12"]).toBe("3 elements clipped or hidden when text spacing is adjusted");
  });

  it("stores detail text for axe violation failures", () => {
    const violations = [makeViolation({
      id: "image-alt",
      tags: ["wcag111"],
      help: "Images must have alternate text",
      nodes: [
        { target: ["img.a"], html: "<img>", failureSummary: "Fix" },
        { target: ["img.b"], html: "<img>", failureSummary: "Fix" },
      ],
    })];
    useChecklistStore.getState().autoPopulateFromScan(violations, [], DEFAULT_CUSTOM_CHECKS);

    const { autoDetails } = useChecklistStore.getState();
    expect(autoDetails["1.1.1"]).toBe("2 elements: Images must have alternate text");
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
