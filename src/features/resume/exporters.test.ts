import { describe, expect, it } from "vitest";

import { resumeToEvidenceLedgerMarkdown, resumeToJson, resumeToMarkdown } from "./exporters";
import type { LearningResume } from "../../types/resume";

const fixtureResume: LearningResume = {
  title: "학습 이력서",
  summary: "2개의 학습 경험을 바탕으로 핵심 역량과 증거를 정리했습니다.",
  generatedAt: 1_767_225_600_000,
  items: [
    {
      id: "data-project",
      title: "데이터 분석 프로젝트",
      type: "프로젝트",
      period: "2026.01 - 2026.03",
      description: "Python으로 데이터를 분석하고 결과를 보고서로 정리했습니다.",
      evidence: "https://example.com/report",
      createdAt: 1_767_225_600_000,
    },
  ],
  competencies: [
    {
      key: "data-literacy",
      label: "데이터 분석 역량",
      score: 12,
      itemIds: ["data-project"],
      summary: "데이터를 수집·분석하고 학습 결과를 근거로 설명할 수 있습니다.",
      evidence: [
        {
          itemId: "data-project",
          title: "데이터 분석 프로젝트",
          type: "프로젝트",
          period: "2026.01 - 2026.03",
          snippet: "Python으로 데이터를 분석하고 결과를 보고서로 정리했습니다.",
          link: "https://example.com/report",
        },
      ],
    },
  ],
};

describe("resume exporters", () => {
  it("resume:markdown-includes-title-and-competency", () => {
    const markdown = resumeToMarkdown(fixtureResume);

    expect(markdown).toContain("# 학습 이력서");
    expect(markdown).toContain("## 데이터 분석 역량");
  });

  it("resume:json-roundtrips", () => {
    expect(JSON.parse(resumeToJson(fixtureResume))).toEqual(fixtureResume);
  });

  it("resume:evidence-ledger-includes-trace-table", () => {
    const ledger = resumeToEvidenceLedgerMarkdown(fixtureResume);

    expect(ledger).toContain("# 역량 증거 원장");
    expect(ledger).toContain("| 학습 경험 | 유형·기간 | 역량 | 증거 문장 |");
    expect(ledger).toContain("데이터 분석 프로젝트");
    expect(ledger).toContain("데이터 분석 역량");
    expect(ledger).toContain("프로젝트, 2026.01 - 2026.03");
    expect(ledger).toContain("Python으로 데이터를 분석");
  });

  it("resume:evidence-ledger-includes-limitation-note", () => {
    const ledger = resumeToEvidenceLedgerMarkdown(fixtureResume);

    expect(ledger).toContain("결정론적 키워드 분류");
    expect(ledger).toContain("성적·출석·LMS 원본을 자동 검증하지 않습니다");
  });

  it("resume:evidence-ledger-is-deterministic", () => {
    expect(resumeToEvidenceLedgerMarkdown(fixtureResume)).toBe(
      resumeToEvidenceLedgerMarkdown(fixtureResume),
    );
  });

  it("resume:evidence-ledger-links-render-as-markdown", () => {
    const ledger = resumeToEvidenceLedgerMarkdown(fixtureResume);

    expect(ledger).toContain("[링크](https://example.com/report)");
  });
});
