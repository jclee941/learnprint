import { describe, expect, it } from "vitest";

import type { LearningResume } from "../../types/resume";
import { createFinalOutputSummary } from "./finalOutputSummary";

const contestResume: LearningResume = {
  title: "학습 이력서",
  summary: "2개의 학습 경험을 정리했습니다.",
  generatedAt: 1_767_225_600_000,
  items: [
    {
      id: "ai-prompt-record",
      title: "AI 프롬프트 기반 오답노트",
      type: "강의",
      period: "2026-1학기",
      description: "AI에게 캐시와 파이프라인 개념 퀴즈를 요청하고 오답을 검토했습니다.",
      evidence: "https://example.com/ai-note",
      createdAt: 1_767_225_600_000,
    },
    {
      id: "offline-rule-engine",
      title: "결정론적 역량 분류 엔진",
      type: "프로젝트",
      period: "2026-1학기",
      description: "동일한 입력에서 동일한 결과를 내는 규칙 엔진을 구현했습니다.",
      evidence: "테스트 로그",
      createdAt: 1_767_225_600_000,
    },
  ],
  competencies: [
    {
      key: "data-ai",
      label: "데이터·AI 활용",
      score: 3,
      itemIds: ["ai-prompt-record"],
      summary: "AI 질문과 검토 과정을 학습 증거로 남겼습니다.",
      evidence: [
        {
          itemId: "ai-prompt-record",
          title: "AI 프롬프트 기반 오답노트",
          type: "강의",
          period: "2026-1학기",
          snippet: "AI에게 캐시와 파이프라인 개념 퀴즈를 요청하고 오답을 검토했습니다.",
          link: "https://example.com/ai-note",
        },
      ],
    },
    {
      key: "professional",
      label: "전공·직무역량",
      score: 2,
      itemIds: ["offline-rule-engine"],
      summary: "전공 지식을 규칙 엔진으로 구현했습니다.",
      evidence: [
        {
          itemId: "offline-rule-engine",
          title: "결정론적 역량 분류 엔진",
          type: "프로젝트",
          period: "2026-1학기",
          snippet: "동일한 입력에서 동일한 결과를 내는 규칙 엔진을 구현했습니다.",
          link: "",
        },
      ],
    },
  ],
};

describe("createFinalOutputSummary contest readiness", () => {
  it("final-output:builds-contest-readiness-rubric", () => {
    const summary = createFinalOutputSummary(contestResume);

    expect(summary.contestReadiness.heading).toBe("공모전 심사 요약");
    expect(summary.contestReadiness.items.map((item) => item.label)).toEqual([
      "AI 활용성",
      "증거성",
      "재현성",
      "개인정보 안전성",
      "역량 커버리지",
    ]);
    expect(summary.contestReadiness.items.map((item) => item.value)).toContain("AI 관련 기록 1개");
    expect(summary.contestReadiness.items.map((item) => item.value)).toContain("2개 증거 / 링크 1개");
    expect(summary.contestReadiness.items.map((item) => item.value)).toContain("2/6 역량");
  });

  it("final-output:contest-readiness-is-deterministic-for-sparse-evidence", () => {
    const sparseResume: LearningResume = {
      ...contestResume,
      items: contestResume.items.map((item) => ({ ...item, evidence: "" })),
      competencies: contestResume.competencies.map((competency) => ({
        ...competency,
        evidence: competency.evidence.map((evidence) => ({ ...evidence, link: "" })),
      })),
    };

    const first = createFinalOutputSummary(sparseResume).contestReadiness;
    const second = createFinalOutputSummary(sparseResume).contestReadiness;

    expect(first).toEqual(second);
    expect(first.items.find((item) => item.label === "증거성")?.value).toBe("2개 증거 / 링크 0개");
    expect(first.items.find((item) => item.label === "개인정보 안전성")?.detail).toContain("브라우저 저장");
  });

  it("final-output:does-not-count-ordinary-question-as-ai-record", () => {
    const questionOnlyResume: LearningResume = {
      ...contestResume,
      items: [
        {
          id: "ordinary-question",
          title: "교재 질문 정리",
          type: "강의",
          period: "2026-1학기",
          description: "수업 후 교수님께 질문할 내용을 정리했습니다.",
          evidence: "질문 목록",
          createdAt: 1_767_225_600_000,
        },
      ],
    };

    const aiUse = createFinalOutputSummary(questionOnlyResume).contestReadiness.items.find(
      (item) => item.label === "AI 활용성",
    );

    expect(aiUse?.value).toBe("AI 관련 기록 0개");
  });

  it("final-output:does-not-count-latin-ai-substring-as-ai-record", () => {
    const plainEnglishResume: LearningResume = {
      ...contestResume,
      items: [
        {
          id: "email-plain-text",
          title: "email plain text 제출",
          type: "과제",
          period: "2026-1학기",
          description: "mail 본문을 fair use 기준으로 정리했습니다.",
          evidence: "plain text log",
          createdAt: 1_767_225_600_000,
        },
      ],
    };

    const aiUse = createFinalOutputSummary(plainEnglishResume).contestReadiness.items.find(
      (item) => item.label === "AI 활용성",
    );

    expect(aiUse?.value).toBe("AI 관련 기록 0개");
  });

  it("final-output:privacy-summary-uses-bounded-review-claim", () => {
    const privacy = createFinalOutputSummary(contestResume).contestReadiness.items.find(
      (item) => item.label === "개인정보 안전성",
    );

    expect(privacy?.detail).toContain("제출 전 검토·삭제");
    expect(privacy?.detail).not.toContain("비밀값을 포함하지 않습니다");
  });
});
