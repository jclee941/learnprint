import { act, fireEvent, render, screen } from "@testing-library/react";
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
      expect.any(AbortSignal),
    );
  });

  it("agent-panel:passes-abort-signal-to-streamAgentChat", () => {
    render(<AgentPanel items={[learningItem]} />);
    fireEvent.click(screen.getByRole("button", { name: "AI 역량 분석" }));
    const call = vi.mocked(streamAgentChat).mock.calls.at(-1);
    const signal = call?.[2];
    expect(signal).toBeInstanceOf(AbortSignal);
  });

  it("agent-panel:response-region-is-busy-while-loading", () => {
    // streamAgentChat is mocked and never resolves -> stays in loading.
    vi.mocked(streamAgentChat).mockImplementation(() => new Promise<void>(() => {}));
    render(<AgentPanel items={[learningItem]} />);
    fireEvent.click(screen.getByRole("button", { name: "AI 역량 분석" }));
    const region = screen.getByLabelText("AI 응답");
    expect(region).toHaveAttribute("aria-busy", "true");
  });

  it("agent-panel:aborts-inflight-request-on-unmount", () => {
    let capturedSignal: AbortSignal | undefined;
    vi.mocked(streamAgentChat).mockImplementation((_req, _handlers, signal) => {
      capturedSignal = signal;
      return new Promise<void>(() => {});
    });
    const { unmount } = render(<AgentPanel items={[learningItem]} />);
    fireEvent.click(screen.getByRole("button", { name: "AI 역량 분석" }));
    expect(capturedSignal?.aborted).toBe(false);
    unmount();
    expect(capturedSignal?.aborted).toBe(true);
  });

  it("agent-panel:ignores-stale-callbacks-after-unmount", () => {
    type Handlers = { onDelta: (t: string) => void; onError: (m: string) => void };
    let captured: Handlers | undefined;
    let capturedSignal: AbortSignal | undefined;
    vi.mocked(streamAgentChat).mockImplementation((_req, handlers, signal) => {
      captured = handlers as Handlers;
      capturedSignal = signal;
      return new Promise<void>(() => {});
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { unmount } = render(<AgentPanel items={[learningItem]} />);
    fireEvent.click(screen.getByRole("button", { name: "AI 역량 분석" }));
    unmount();
    // Unmount must abort the in-flight request.
    expect(capturedSignal?.aborted).toBe(true);
    // A late callback after unmount must be ignored: no throw AND no
    // React "setState on unmounted component" warning.
    expect(() => act(() => captured?.onDelta("LATE"))).not.toThrow();
    expect(() => act(() => captured?.onError("LATE-ERR"))).not.toThrow();
    const warned = errorSpy.mock.calls.some((args) =>
      String(args[0]).includes("unmounted"),
    );
    expect(warned).toBe(false);
    errorSpy.mockRestore();
  });
});
