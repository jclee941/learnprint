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

  it("resume:markdown-includes-final-output-package-summary", () => {
    const markdown = resumeToMarkdown(fixtureResume);

    expect(markdown).toContain("## 최종 산출물 패키지");
    expect(markdown).toContain("- 학습 경험: 1개");
    expect(markdown).toContain("- 역량 커버리지: 1개");
    expect(markdown).toContain("- 증거 문장: 1개");
    expect(markdown).toContain("- 증거 링크: 1개");
    expect(markdown).toContain("- 내보내기 상태: Markdown·JSON·증거 원장·인쇄본 준비 완료");
  });

  it("resume:markdown-includes-contest-readiness-summary", () => {
    const markdown = resumeToMarkdown(fixtureResume);

    expect(markdown).toContain("## 공모전 심사 요약");
    expect(markdown).toContain("- **AI 활용성**:");
    expect(markdown).toContain("- **증거성**:");
    expect(markdown).toContain("- **재현성**:");
    expect(markdown).toContain("- **개인정보 안전성**:");
    expect(markdown).toContain("- **역량 커버리지**:");
    expect(markdown).toContain("제출 전 검토·삭제");
    expect(markdown).not.toContain("비밀값을 포함하지 않습니다");
  });

  it("resume:json-roundtrips", () => {
    expect(JSON.parse(resumeToJson(fixtureResume))).toEqual(fixtureResume);
  });

  it("resume:evidence-ledger-includes-trace-table", () => {
    const ledger = resumeToEvidenceLedgerMarkdown(fixtureResume);

    expect(ledger).toContain("# 역량 증거 원장");
    expect(ledger).toContain("| 학습 경험 | 유형·기간 | 인공물·출처 | 역량 | 증거 문장 | 한계 |");
    expect(ledger).toContain("데이터 분석 프로젝트");
    expect(ledger).toContain("데이터 분석 역량");
    expect(ledger).toContain("프로젝트, 2026.01 - 2026.03");
    expect(ledger).toContain("Python으로 데이터를 분석");
  });

  it("resume:evidence-ledger-includes-final-output-package-summary", () => {
    const ledger = resumeToEvidenceLedgerMarkdown(fixtureResume);

    expect(ledger).toContain("## 최종 산출물 패키지");
    expect(ledger).toContain("- 학습 경험: 1개");
    expect(ledger).toContain("- 역량 커버리지: 1개");
    expect(ledger).toContain("- 증거 문장: 1개");
    expect(ledger).toContain("- 증거 링크: 1개");
  });

  it("resume:evidence-ledger-includes-contest-readiness-summary", () => {
    const ledger = resumeToEvidenceLedgerMarkdown(fixtureResume);

    expect(ledger).toContain("## 공모전 심사 요약");
    expect(ledger).toContain("| 평가 항목 | 현재 상태 | 심사 포인트 |");
    expect(ledger).toContain("| AI 활용성 |");
    expect(ledger).toContain("| 개인정보 안전성 |");
  });

  it("resume:evidence-ledger-includes-row-and-global-limitation", () => {
    const ledger = resumeToEvidenceLedgerMarkdown(fixtureResume);

    expect(ledger).toContain("키워드 분류 결과이며 의미 검증은 LLM 검토 필요");
    expect(ledger).toContain("성적·출석·LMS 원본을 자동 검증하지 않습니다");
    expect(ledger).toContain("여러 출처를 교차 검증하지 않습니다");
  });

  it("resume:evidence-ledger-includes-artifact-source", () => {
    const ledger = resumeToEvidenceLedgerMarkdown(fixtureResume);

    expect(ledger).toContain("[파일·링크](https://example.com/report)");
  });

  it("resume:evidence-ledger-uses-correct-spelling", () => {
    const ledger = resumeToEvidenceLedgerMarkdown(fixtureResume);

    expect(ledger).toContain("\uD769\uC5B4\uC9C4 \uD559\uC2B5");
    expect(ledger).not.toContain("\uD754\uC5B4\uC9C4");
  });

  it("resume:evidence-ledger-is-deterministic", () => {
    expect(resumeToEvidenceLedgerMarkdown(fixtureResume)).toBe(
      resumeToEvidenceLedgerMarkdown(fixtureResume),
    );
  });

  it("resume:markdown-invalid-generated-at-renders-dash", () => {
    const markdown = resumeToMarkdown({ ...fixtureResume, generatedAt: NaN });

    expect(markdown).toContain("생성일: —");
    expect(markdown).not.toContain("Invalid Date");
  });

  it("resume:evidence-ledger-invalid-generated-at-renders-dash", () => {
    const ledger = resumeToEvidenceLedgerMarkdown({ ...fixtureResume, generatedAt: NaN });

    expect(ledger).toContain("생성일: —");
    expect(ledger).not.toContain("Invalid Date");
  });

  it("resume:markdown-omits-period-comma-when-period-empty", () => {
    const resume: LearningResume = {
      ...fixtureResume,
      competencies: [
        {
          ...fixtureResume.competencies[0],
          evidence: [
            {
              ...fixtureResume.competencies[0].evidence[0],
              type: "강의",
              period: "",
            },
          ],
        },
      ],
    };

    const markdown = resumeToMarkdown(resume);

    expect(markdown).toContain("(강의)");
    expect(markdown).not.toContain("(강의, )");
  });

  it("resume:evidence-ledger-links-render-as-markdown", () => {
    const ledger = resumeToEvidenceLedgerMarkdown(fixtureResume);

    expect(ledger).toContain("[링크](https://example.com/report)");
  });

  it("resume:evidence-ledger-escapes-table-pipes-and-line-breaks", () => {
    const resume: LearningResume = {
      ...fixtureResume,
      competencies: [
        {
          ...fixtureResume.competencies[0],
          label: "데이터|AI 역량",
          evidence: [
            {
              ...fixtureResume.competencies[0].evidence[0],
              title: "보고서|초안",
              type: "강의",
              period: "2026.01\n2026.03",
              snippet: "첫 줄\n둘째 줄 | 표 기호",
              link: "https://example.com/report|draft",
            },
          ],
        },
      ],
    };

    const ledger = resumeToEvidenceLedgerMarkdown(resume);

    expect(ledger).toContain("보고서\\|초안");
    expect(ledger).toContain("2026.01 2026.03");
    expect(ledger).toContain("첫 줄 둘째 줄 \\| 표 기호");
    expect(ledger).toContain("[파일·링크](https://example.com/report\\|draft)");
    expect(ledger).toContain("[링크](https://example.com/report\\|draft)");
    expect(ledger).toContain("데이터\\|AI 역량");
  });

  it("resume:evidence-ledger-normalizes-carriage-returns-in-table-cells", () => {
    const resume: LearningResume = {
      ...fixtureResume,
      competencies: [
        {
          ...fixtureResume.competencies[0],
          evidence: [
            {
              ...fixtureResume.competencies[0].evidence[0],
              title: "보고서\r초안",
              type: "강의",
              period: "2026.01\r\n2026.03",
              snippet: "첫 줄\r둘째 줄",
              link: "https://example.com/report\rnote",
            },
          ],
        },
      ],
    };

    const ledger = resumeToEvidenceLedgerMarkdown(resume);

    expect(ledger).not.toContain("\r");
    expect(ledger).toContain("보고서 초안");
    expect(ledger).toContain("2026.01 2026.03");
    expect(ledger).toContain("첫 줄 둘째 줄");
    expect(ledger).toContain("[파일·링크](https://example.com/report%0Dnote)");
  });

  it("resume:evidence-ledger-omits-period-comma-when-period-empty", () => {
    const resume: LearningResume = {
      ...fixtureResume,
      competencies: [
        {
          ...fixtureResume.competencies[0],
          evidence: [
            {
              ...fixtureResume.competencies[0].evidence[0],
              type: "강의",
              period: "",
            },
          ],
        },
      ],
    };

    const ledger = resumeToEvidenceLedgerMarkdown(resume);

    expect(ledger).toContain("| 강의 |");
    expect(ledger).not.toContain("강의, ");
  });
});
