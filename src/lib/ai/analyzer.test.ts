import { describe, expect, it, vi } from "vitest";

import { createHycuSeedItems } from "../../data/hycu-seed";
import { analyzeLearningItems, countMeaningfulCompetencies } from "./analyzer";
import type { LearningItem } from "../../types/learning";
import type { AnalysisResult, CompetencyGroup, Evidence } from "../../types/resume";

function learningItem(overrides: Partial<LearningItem> & Pick<LearningItem, "id" | "title" | "type">): LearningItem {
  return {
    period: "2026.01 - 2026.03",
    description: "학습 내용을 정리하고 결과를 기록했습니다.",
    evidence: "",
    createdAt: 1_767_225_600_000,
    ...overrides,
  };
}

describe("analyzeLearningItems", () => {
  it("analyzer:empty-input-returns-guided-empty-result", () => {
    const result: AnalysisResult = analyzeLearningItems([]);

    expect(result.isEmpty).toBe(true);
    expect(result.totalItems).toBe(0);
    expect(result.competencies).toHaveLength(0);
  });

  it("analyzer:groups-three-items-into-competencies", () => {
    const items = [
      learningItem({
        id: "data-ai-course",
        title: "데이터 분석과 AI 모델링 강의",
        type: "강의",
        description: "Python으로 데이터를 전처리하고 머신러닝 AI 모델의 성능을 분석했습니다.",
        evidence: "분석 노트와 모델 평가 리포트",
      }),
      learningItem({
        id: "team-presentation-project",
        title: "팀 프로젝트 협업 및 발표",
        type: "프로젝트",
        description: "팀원들과 역할을 나누어 서비스를 구현하고 최종 발표 자료를 제작했습니다.",
        evidence: "발표 슬라이드와 회고록",
      }),
      learningItem({
        id: "self-study-license",
        title: "자기주도 독학 자격증 준비",
        type: "자격증",
        description: "학습 계획을 세워 독학으로 자격증 기출 문제를 풀이하고 오답을 정리했습니다.",
        evidence: "학습 플래너와 합격 확인서",
      }),
    ] satisfies LearningItem[];

    const result: AnalysisResult = analyzeLearningItems(items);

    expect(result.totalItems).toBe(3);
    expect(result.isEmpty).toBe(false);
    expect(result.competencies.length).toBeGreaterThanOrEqual(1);

    for (const competency of result.competencies) {
      expect(competency.label).toEqual(expect.any(String));
      expect(competency.label.trim().length).toBeGreaterThan(0);
      expect(competency.itemIds.length).toBeGreaterThan(0);

      for (const itemId of competency.itemIds) {
        expect(items.some((item) => item.id === itemId)).toBe(true);
      }
    }

    const coveredItemIds = new Set(result.competencies.flatMap((competency: CompetencyGroup) => competency.itemIds));
    expect(coveredItemIds).toEqual(new Set(items.map((item) => item.id)));
  });

  it("analyzer:extracts-evidence-links-and-descriptions", () => {
    const evidenceLink = "https://example.com/learning/data-report";
    const item = learningItem({
      id: "linked-evidence-item",
      title: "AI 데이터 분석 결과 보고서",
      type: "프로젝트",
      description: "사용자 행동 데이터를 분석해 인사이트를 도출하고 보고서로 정리했습니다.",
      evidence: `최종 보고서: ${evidenceLink}`,
    });

    const result: AnalysisResult = analyzeLearningItems([item]);
    const evidence = result.competencies
      .flatMap((competency: CompetencyGroup) => competency.evidence)
      .find((entry: Evidence) => entry.link === evidenceLink);

    expect(evidence).toBeDefined();
    expect(evidence?.snippet.trim().length).toBeGreaterThan(0);
  });

  it("analyzer:is-deterministic-for-same-input", () => {
    const sameItems = [
      learningItem({
        id: "deterministic-data",
        title: "데이터 분석 AI 실습",
        type: "과제",
        description: "동일한 입력에 대해 항상 같은 역량 분석 결과가 나오도록 설계한 실습입니다.",
        evidence: "실습 저장소",
      }),
      learningItem({
        id: "deterministic-collab",
        title: "협업 발표 프로젝트",
        type: "프로젝트",
        description: "팀 프로젝트에서 협업 규칙을 정하고 발표를 준비했습니다.",
        evidence: "회의록과 발표 자료",
      }),
    ] satisfies LearningItem[];

    const first: AnalysisResult = analyzeLearningItems(sameItems);
    const second: AnalysisResult = analyzeLearningItems(sameItems);

    expect(first.competencies).toEqual(second.competencies);
  });

  it("analyzer:uses-no-network-or-secrets", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(vi.fn());
    const items = [
      learningItem({
        id: "offline-self-study",
        title: "오프라인 자기주도 독학 기록",
        type: "독학",
        description: "네트워크 호출 없이 로컬 학습 기록만으로 역량을 분석합니다.",
        evidence: "로컬 노트",
      }),
    ] satisfies LearningItem[];

    analyzeLearningItems(items);

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

describe("analyzer hycu-course classification", () => {
  it("analyzer:hycu-courses-not-mostly-기타", () => {
    const items = createHycuSeedItems();
    const result: AnalysisResult = analyzeLearningItems(items);
    const otherCount = result.competencies
      .filter((competency) => competency.label.includes("기타"))
      .reduce((total, competency) => total + competency.itemIds.length, 0);

    expect(otherCount).toBeLessThanOrEqual(1);
  });

  it("analyzer:hycu-courses-meaningful-competencies", () => {
    const items = createHycuSeedItems();
    const result: AnalysisResult = analyzeLearningItems(items);
    const meaningfulCompetencyCount = result.competencies.filter((competency) => !competency.label.includes("기타")).length;

    expect(meaningfulCompetencyCount).toBeGreaterThanOrEqual(3);
  });
});

describe("countMeaningfulCompetencies", () => {
  it("analyzer:coverage-counts-non-other-groups", () => {
    const items = createHycuSeedItems();
    const result: AnalysisResult = analyzeLearningItems(items);

    const coverage = countMeaningfulCompetencies(result);
    const expectedNonOtherCount = result.competencies.filter((competency) => !competency.label.includes("기타")).length;

    expect(coverage).toEqual(expectedNonOtherCount);
    expect(coverage).toBeGreaterThanOrEqual(3);
    expect(coverage).toBeLessThanOrEqual(6);
  });

  it("analyzer:coverage-zero-for-empty", () => {
    const emptyResult: AnalysisResult = analyzeLearningItems([]);

    expect(emptyResult.isEmpty).toBe(true);
    expect(countMeaningfulCompetencies(emptyResult)).toBe(0);
  });
});
