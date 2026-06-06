import { describe, expect, it, vi } from "vitest";

import { streamAgentChat } from "./client";
import type { AgentChatRequest } from "../../types/agent";
import type { LearningItem } from "../../types/learning";

const learningItem: LearningItem = {
  id: "item-1",
  title: "AI 프로그래밍",
  type: "강의",
  period: "2026-1학기",
  description: "생성형 AI API 활용과 프롬프트 설계를 학습했습니다.",
  evidence: "기말 프로젝트 보고서",
  createdAt: 1,
};

const request: AgentChatRequest = {
  mode: "competency",
  messages: [{ role: "user", content: "내 학습 경험을 분석해줘" }],
  items: [learningItem],
};

const sseResponse = (chunks: string[]): Response => {
  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    }),
    { status: 200 },
  );
};

describe("streamAgentChat", () => {
  it("agent-client:posts-to-relative-api-path", async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse(["data: [DONE]\n\n"]));
    vi.stubGlobal("fetch", fetchMock);

    await streamAgentChat(request, {
      onDelta: vi.fn(),
      onDone: vi.fn(),
      onError: vi.fn(),
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/agent/chat",
      expect.objectContaining({
        method: "POST",
        body: expect.any(String),
      }),
    );

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({
      mode: request.mode,
      messages: request.messages,
      items: request.items,
    });
  });

  it("agent-client:body-contains-no-secret", async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse(["data: [DONE]\n\n"]));
    vi.stubGlobal("fetch", fetchMock);

    await streamAgentChat(request, {
      onDelta: vi.fn(),
      onDone: vi.fn(),
      onError: vi.fn(),
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = String(init.body);
    expect(body).not.toContain("sk-");
    expect(body).not.toContain("192.168");
  });

  it("agent-client:streams-deltas-then-done", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      sseResponse([
        'data: {"delta":"안"}\n\n',
        'data: {"delta":"녕"}\n\n',
        'data: {"delta":"","done":true}\n\n',
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);
    let output = "";
    const onDone = vi.fn();

    await streamAgentChat(request, {
      onDelta: (text: string) => {
        output += text;
      },
      onDone,
      onError: vi.fn(),
    });

    expect(output).toBe("안녕");
    expect(onDone).toHaveBeenCalledOnce();
  });

  it("agent-client:onError-on-http-503", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("Service Unavailable", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);
    const onError = vi.fn();

    await expect(
      streamAgentChat(request, {
        onDelta: vi.fn(),
        onDone: vi.fn(),
        onError,
      }),
    ).resolves.toBeUndefined();

    expect(onError).toHaveBeenCalledWith(expect.stringMatching(/실패|오류/));
  });

  it("agent-client:skips-malformed-sse-json-and-continues", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      sseResponse([
        'data: {"delta":"A"}\n\n',
        "data: {bad json}\n\n",
        'data: {"delta":"B"}\n\n',
        'data: {"delta":"","done":true}\n\n',
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);
    let output = "";
    const onError = vi.fn();
    const onDone = vi.fn();

    await streamAgentChat(request, {
      onDelta: (text: string) => {
        output += text;
      },
      onDone,
      onError,
    });

    // Malformed block is skipped; valid deltas before/after still arrive.
    expect(output).toBe("AB");
    expect(onError).not.toHaveBeenCalled();
    expect(onDone).toHaveBeenCalledOnce();
  });

  it("agent-client:passes-abort-signal-to-fetch", async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse(["data: [DONE]\n\n"]));
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();

    await streamAgentChat(
      request,
      { onDelta: vi.fn(), onDone: vi.fn(), onError: vi.fn() },
      controller.signal,
    );

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBe(controller.signal);
  });

  it("agent-client:silent-on-abort-error", async () => {
    const fetchMock = vi.fn().mockImplementation(() => {
      const err = new Error("aborted");
      err.name = "AbortError";
      return Promise.reject(err);
    });
    vi.stubGlobal("fetch", fetchMock);
    const onError = vi.fn();
    const onDone = vi.fn();

    await streamAgentChat(request, { onDelta: vi.fn(), onDone, onError });

    // Abort is a silent cancellation, not a user-facing error.
    expect(onError).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });
});
