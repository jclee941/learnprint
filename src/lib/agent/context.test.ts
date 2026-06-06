import { describe, expect, it } from "vitest";

import { buildLearningContext } from "./context";
import type { LearningItem } from "../../types/learning";

const item: LearningItem = {
  id: "item-1",
  title: "자료구조론",
  type: "강의",
  period: "2026-1학기",
  description: "스택과 큐를 구현하고 시간복잡도를 분석했습니다.",
  evidence: "과제 보고서와 GitHub 링크",
  createdAt: 1,
};

describe("buildLearningContext", () => {
  it("agent-context:includes-learning-item-fields", () => {
    const result = buildLearningContext([item]);

    expect(result).toContain(item.title);
    expect(result).toContain(item.type);
    expect(result).toContain(item.period);
  });

  it("agent-context:empty-items-returns-korean-guidance", () => {
    const result = buildLearningContext([]);

    expect(result.trim().length).toBeGreaterThan(0);
    expect(result).toContain("학습 경험");
    expect(/[가-힣]/.test(result)).toBe(true);
  });

  it("agent-context:contains-no-secrets", () => {
    const result = buildLearningContext([item]);

    expect(result).not.toContain("sk-");
    expect(result).not.toContain("192.168");
    expect(result).not.toContain("apiKey");
  });
});
