import { act, fireEvent, render, screen, within } from "@testing-library/react";
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

  it("agent-panel:appends-assistant-message-after-stream-done", async () => {
    type Handlers = { onDelta: (t: string) => void; onDone: () => void; onError: (m: string) => void };
    const captured: Handlers[] = [];
    vi.mocked(streamAgentChat).mockImplementation((_req, handlers) => {
      captured.push(handlers as Handlers);
      return new Promise<void>(() => {});
    });
    render(<AgentPanel items={[learningItem]} />);
    fireEvent.click(screen.getByRole("button", { name: "AI 역량 분석" }));
    expect(captured).toHaveLength(1);

    await act(async () => {
      captured[0].onDelta("결과");
      captured[0].onDelta("입니다");
      captured[0].onDone();
    });

    const history = screen.getByLabelText("AI 대화 기록");
    expect(within(history).getByText("결과입니다")).toBeInTheDocument();
    expect(within(history).getByText("AI")).toBeInTheDocument();
  });

  it("agent-panel:next-request-includes-assistant-history", async () => {
    type Handlers = { onDelta: (t: string) => void; onDone: () => void; onError: (m: string) => void };
    const captured: Handlers[] = [];
    vi.mocked(streamAgentChat).mockClear();
    vi.mocked(streamAgentChat).mockImplementation((_req, handlers) => {
      captured.push(handlers as Handlers);
      return new Promise<void>(() => {});
    });
    render(<AgentPanel items={[learningItem]} />);

    // First turn via the competency button.
    fireEvent.click(screen.getByRole("button", { name: "AI 역량 분석" }));
    await act(async () => {
      captured[0].onDelta("결과입니다");
      captured[0].onDone();
    });

    // Second turn via the chat form so the next streamAgentChat invocation
    // is forced to read the updated messages state.
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "추가 질문" } });
    fireEvent.click(screen.getByRole("button", { name: "보내기" }));

    expect(streamAgentChat).toHaveBeenCalledTimes(2);
    const secondRequest = vi.mocked(streamAgentChat).mock.calls[1]?.[0];
    expect(secondRequest).toBeDefined();
    expect(
      secondRequest!.messages.some(
        (m) => m.role === "assistant" && m.content === "결과입니다",
      ),
    ).toBe(true);
  });

  it("agent-panel:empty-assistant-not-appended", async () => {
    type Handlers = { onDelta: (t: string) => void; onDone: () => void; onError: (m: string) => void };
    const captured: Handlers[] = [];
    vi.mocked(streamAgentChat).mockImplementation((_req, handlers) => {
      captured.push(handlers as Handlers);
      return new Promise<void>(() => {});
    });
    render(<AgentPanel items={[learningItem]} />);
    fireEvent.click(screen.getByRole("button", { name: "AI 역량 분석" }));

    // onDone without any onDelta — no assistant content was streamed.
    await act(async () => {
      captured[0].onDone();
    });

    const history = screen.getByLabelText("AI 대화 기록");
    expect(within(history).queryByText("AI")).not.toBeInTheDocument();
    expect(
      within(history).getByText(
        "내 학습 이력으로 핵심 역량과 자기소개 문단을 작성해줘.",
      ),
    ).toBeInTheDocument();

  });

  it("agent-panel:clear-history-removes-chat-history", async () => {
    type Handlers = { onDelta: (t: string) => void; onDone: () => void; onError: (m: string) => void };
    const captured: Handlers[] = [];
    vi.mocked(streamAgentChat).mockImplementation((_req, handlers) => {
      captured.push(handlers as Handlers);
      return new Promise<void>(() => {});
    });
    render(<AgentPanel items={[learningItem]} />);
    fireEvent.click(screen.getByRole("button", { name: "AI 역량 분석" }));
    await act(async () => {
      captured[0].onDelta("결과입니다");
      captured[0].onDone();
    });

    expect(screen.getByLabelText("AI 대화 기록")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "대화 기록 지우기" }));

    expect(screen.queryByLabelText("AI 대화 기록")).not.toBeInTheDocument();
    expect(screen.getByText("모드를 선택하거나 질문을 보내면 AI 응답이 여기에 표시됩니다.")).toBeInTheDocument();
  });

  it("agent-panel:clear-history-aborts-inflight-stream-and-ignores-late-callbacks", async () => {
    type Handlers = { onDelta: (t: string) => void; onDone: () => void; onError: (m: string) => void };
    const captured: Handlers[] = [];
    let capturedSignal: AbortSignal | undefined;
    vi.mocked(streamAgentChat).mockImplementation((_req, handlers, signal) => {
      captured.push(handlers as Handlers);
      capturedSignal = signal;
      return new Promise<void>(() => {});
    });
    render(<AgentPanel items={[learningItem]} />);
    fireEvent.click(screen.getByRole("button", { name: "AI 역량 분석" }));

    fireEvent.click(screen.getByRole("button", { name: "대화 기록 지우기" }));
    expect(capturedSignal?.aborted).toBe(true);

    await act(async () => {
      captured[0].onDelta("늦은 응답");
      captured[0].onDone();
    });

    expect(screen.queryByLabelText("AI 대화 기록")).not.toBeInTheDocument();
    expect(screen.queryByText("늦은 응답")).not.toBeInTheDocument();
    expect(screen.getByText("모드를 선택하거나 질문을 보내면 AI 응답이 여기에 표시됩니다.")).toBeInTheDocument();
  });
});
