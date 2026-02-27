import { describe, it, expect } from "vitest";
import { WCAG_CRITERIA } from "@/lib/checklist/criteria";
import { ASSESSMENT_CATEGORIES } from "@/lib/checklist/categories";

describe("Assessment categories", () => {
  it("has exactly 14 categories", () => {
    expect(ASSESSMENT_CATEGORIES).toHaveLength(14);
  });

  it("covers all 50 WCAG criteria exactly once", () => {
    const allIds = ASSESSMENT_CATEGORIES.flatMap((c) => c.criteriaIds);
    expect(allIds).toHaveLength(50);

    const unique = new Set(allIds);
    expect(unique.size).toBe(50);
  });

  it("references only valid WCAG criterion IDs", () => {
    const validIds = new Set(WCAG_CRITERIA.map((c) => c.id));
    for (const category of ASSESSMENT_CATEGORIES) {
      for (const id of category.criteriaIds) {
        expect(validIds.has(id), `Unknown criterion ID "${id}" in category "${category.key}"`).toBe(true);
      }
    }
  });

  it("has 50 WCAG criteria in the master list", () => {
    expect(WCAG_CRITERIA).toHaveLength(50);
  });

  it("has unique category keys", () => {
    const keys = ASSESSMENT_CATEGORIES.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("has non-empty getting-started text for every category", () => {
    for (const category of ASSESSMENT_CATEGORIES) {
      expect(category.gettingStarted.length, `Empty gettingStarted for "${category.key}"`).toBeGreaterThan(0);
    }
  });

  it("has at least one criterion per category", () => {
    for (const category of ASSESSMENT_CATEGORIES) {
      expect(category.criteriaIds.length, `Empty criteriaIds for "${category.key}"`).toBeGreaterThan(0);
    }
  });
});
