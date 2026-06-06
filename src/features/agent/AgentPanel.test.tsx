import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AgentPanel } from "./AgentPanel";
import { streamAgentChat } from "../../lib/agent/client";
import type { LearningItem } from "../../types/learning";

vi.mock("../../lib/agent/client", () => ({
  streamAgentChat: vi.fn(),
}));

const learningItem: LearningItem = {
  id: "item-1",
  title: "자료구조론",
  type: "강의",
  period: "2026-1학기",
  description: "스택과 큐를 구현하고 시간복잡도를 분석했습니다.",
  evidence: "과제 보고서와 GitHub 링크",
  createdAt: 1,
};

describe("AgentPanel", () => {
  it("agent-panel:renders-korean-title-and-mode-buttons", () => {
    render(<AgentPanel items={[learningItem]} />);

    expect(screen.getByText("HYCU AI 학습 에이전트")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AI 역량 분석" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "학습 코칭" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "예상 면접질문" })).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("agent-panel:disables-actions-when-no-items", () => {
    render(<AgentPanel items={[]} />);

    expect(screen.getByRole("button", { name: "AI 역량 분석" })).toBeDisabled();
  });

  it("agent-panel:invokes-streamAgentChat-on-competency-click", () => {
    render(<AgentPanel items={[learningItem]} />);

    fireEvent.click(screen.getByRole("button", { name: "AI 역량 분석" }));

    expect(streamAgentChat).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "competency",
      }),
      expect.any(Object),
    );
  });
});
