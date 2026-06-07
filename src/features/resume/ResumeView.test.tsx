import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { LearningResume } from "../../types/resume";
import { ResumeView } from "./ResumeView";

const resume: LearningResume = {
  title: "학습 이력서",
  summary: "1개의 학습 경험을 정리했습니다.",
  competencies: [],
  items: [],
  generatedAt: 1_767_225_600_000,
};

describe("ResumeView", () => {
  it("resume-view:invalid-generated-at-renders-dash", () => {
    render(<ResumeView resume={{ ...resume, generatedAt: NaN }} />);

    expect(screen.getByText((content) => content.includes("—"))).toBeInTheDocument();
    expect(screen.queryByText(/Invalid Date/)).not.toBeInTheDocument();
  });
});
