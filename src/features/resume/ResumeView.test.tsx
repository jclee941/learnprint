import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { LearningResume } from "../../types/resume";
import { ResumeView } from "./ResumeView";

const resume: LearningResume = {
  title: "학습 이력서",
  summary: "1개의 학습 경험을 정리했습니다.",
  competencies: [
    {
      key: "data-literacy",
      label: "데이터 분석 역량",
      score: 12,
      itemIds: ["data-project"],
      summary: "데이터를 근거로 설명할 수 있습니다.",
      evidence: [
        {
          itemId: "data-project",
          title: "데이터 분석 프로젝트",
          type: "프로젝트",
          period: "2026.01 - 2026.03",
          snippet: "Python으로 데이터를 분석했습니다.",
          link: "https://example.com/report",
        },
      ],
    },
  ],
  items: [
    {
      id: "data-project",
      title: "데이터 분석 프로젝트",
      type: "프로젝트",
      period: "2026.01 - 2026.03",
      description: "Python으로 데이터를 분석했습니다.",
      evidence: "https://example.com/report",
      createdAt: 1_767_225_600_000,
    },
  ],
  generatedAt: 1_767_225_600_000,
};

describe("ResumeView", () => {
  it("resume-view:shows-final-output-package-summary", () => {
    render(<ResumeView resume={resume} />);

    expect(screen.getByRole("region", { name: "최종 산출물 패키지" })).toBeInTheDocument();
    expect(screen.getByText("학습 경험 1개")).toBeInTheDocument();
    expect(screen.getByText("역량 1개")).toBeInTheDocument();
    expect(screen.getByText("증거 문장 1개")).toBeInTheDocument();
    expect(screen.getByText("증거 링크 1개")).toBeInTheDocument();
    expect(screen.getByText("Markdown·JSON·증거 원장·인쇄본 준비 완료")).toBeInTheDocument();
  });

  it("resume-view:shows-contest-readiness-summary", () => {
    render(<ResumeView resume={resume} />);

    expect(screen.getByRole("region", { name: "공모전 심사 요약" })).toBeInTheDocument();
    expect(screen.getByText("AI 활용성")).toBeInTheDocument();
    expect(screen.getByText("증거성")).toBeInTheDocument();
    expect(screen.getByText("재현성")).toBeInTheDocument();
    expect(screen.getByText("개인정보 안전성")).toBeInTheDocument();
    expect(screen.getByText("역량 커버리지")).toBeInTheDocument();
    expect(screen.getByText(/제출 전 검토·삭제/)).toBeInTheDocument();
    expect(screen.queryByText(/비밀값을 포함하지 않습니다/)).not.toBeInTheDocument();
  });

  it("resume-view:invalid-generated-at-renders-dash", () => {
    render(<ResumeView resume={{ ...resume, generatedAt: NaN }} />);

    expect(screen.getByText((content) => content.includes("—"))).toBeInTheDocument();
    expect(screen.queryByText(/Invalid Date/)).not.toBeInTheDocument();
  });
});
