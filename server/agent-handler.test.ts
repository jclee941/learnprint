// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";
import { handleAgentChat } from "./agent-handler";
import type { AgentChatBody, LlmConfig } from "./types";

const config: LlmConfig = {
  baseUrl: "http://cliproxy.test/v1",
  apiKey: "sk-test",
  model: "gemini-3-flash",
};

function sseResponse(lines: string[]): Response {
  const encoder = new TextEncoder();

  return {
    ok: true,
    status: 200,
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        for (const line of lines) controller.enqueue(encoder.encode(line));
        controller.close();
      },
    }),
  } as Response;
}

function mockStreamingFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      sseResponse([
        'data: {"choices":[{"delta":{"content":"안"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":"녕"}}]}\n\n',
        "data: [DONE]\n\n",
      ]),
    ),
  );
}

describe("handleAgentChat", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("agent:writes-sse-deltas", async () => {
    mockStreamingFetch();
    const write = vi.fn();
    const body: AgentChatBody = {
      mode: "coach",
      messages: [{ role: "user", content: "도와줘" }],
      items: [{ title: "자료구조 과제", summary: "스택 구현" }],
    };

    await handleAgentChat(body, config, write);

    expect(write).toHaveBeenCalledWith(expect.stringContaining("data:"));
    expect(write).toHaveBeenCalledWith(expect.stringContaining("안"));
    expect(write).toHaveBeenCalledWith(expect.stringContaining("녕"));
    expect(write).toHaveBeenCalledWith(expect.stringContaining("[DONE]"));
  });

  it("agent:rejects-empty-messages", async () => {
    const write = vi.fn();
    const body: AgentChatBody = {
      mode: "coach",
      messages: [],
      items: [],
    };

    await expect(handleAgentChat(body, config, write)).rejects.toThrow();
  });
});
