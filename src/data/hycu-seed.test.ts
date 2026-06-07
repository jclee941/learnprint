import { describe, expect, it } from "vitest";

import { createHycuSeedItems } from "./hycu-seed";
import { analyzeLearningItems } from "../lib/ai/analyzer";
import { LEARNING_ITEM_TYPES } from "../types/learning";

describe("hycu-seed", () => {
  it("seed:produces-real-hycu-learning-items", () => {
    const items = createHycuSeedItems();

    expect(items.length).toBeGreaterThanOrEqual(6);
    for (const item of items) {
      expect(item.id).toMatch(/^hycu-/);
      expect(item.title.trim().length).toBeGreaterThan(0);
      expect(LEARNING_ITEM_TYPES).toContain(item.type);
      expect(typeof item.createdAt).toBe("number");
    }
  });

  it("seed:is-deterministic", () => {
    expect(createHycuSeedItems()).toEqual(createHycuSeedItems());
  });

  it("seed:analyzes-into-competencies-covering-all-items", () => {
    const items = createHycuSeedItems();
    const result = analyzeLearningItems(items);

    expect(result.isEmpty).toBe(false);
    expect(result.totalItems).toBe(items.length);
    expect(result.competencies.length).toBeGreaterThanOrEqual(1);

    const coveredIds = new Set(result.competencies.flatMap((competency) => competency.itemIds));
    expect(coveredIds.size).toBe(items.length);
  });
});

describe("hycu-seed authenticity", () => {
  it("seed:descriptions-are-unique", () => {
    const items = createHycuSeedItems();
    const descriptions = items.map((item) => item.description);

    expect(new Set(descriptions).size).toBe(items.length);
  });

  it("seed:no-progress-rate-headline", () => {
    const items = createHycuSeedItems();

    for (const item of items) {
      expect(item.description).not.toContain("진도율 100%");
      expect(item.description).not.toContain("13/13주차");
    }
  });

  it("seed:no-automation-provenance", () => {
    const items = createHycuSeedItems();
    const provenancePattern = /자동화|auto|\/home\/jclee\/dev\/hycu/i;

    for (const item of items) {
      expect(`${item.description} ${item.evidence}`).not.toMatch(provenancePattern);
    }
  });

  it("seed:each-has-substantive-detail", () => {
    const items = createHycuSeedItems();

    for (const item of items) {
      expect(item.description.length).toBeGreaterThanOrEqual(40);
    }
  });
});
