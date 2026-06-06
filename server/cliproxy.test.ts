// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";
import { streamChatCompletion } from "./cliproxy";
import type { LlmConfig } from "./types";

const config: LlmConfig = {
  baseUrl: "http://cliproxy.test/v1",
  apiKey: "sk-test",
  model: "gemini-3-flash",
};

const messages = [{ role: "user", content: "안녕" }];

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
  const fetchMock = vi.fn().mockResolvedValue(
    sseResponse([
      'data: {"choices":[{"delta":{"content":"안"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"녕"}}]}\n\n',
      "data: [DONE]\n\n",
    ]),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("streamChatCompletion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("cliproxy:sends-bearer-auth-and-model", async () => {
    const fetchMock = mockStreamingFetch();

    await streamChatCompletion(config, messages, vi.fn());

    expect(fetchMock).toHaveBeenCalledWith(
      "http://cliproxy.test/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer sk-test",
        }),
      }),
    );

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(init.body))).toMatchObject({
      model: "gemini-3-flash",
      messages,
      stream: true,
    });
  });

  it("cliproxy:streams-deltas", async () => {
    mockStreamingFetch();
    let text = "";

    await streamChatCompletion(config, messages, (delta: string) => {
      text += delta;
    });

    expect(text).toBe("안녕");
  });

  it("cliproxy:throws-on-non-ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 502 } as Response),
    );

    await expect(streamChatCompletion(config, messages, vi.fn())).rejects.toThrow();
  });

  it("cliproxy:skips-malformed-sse-json-and-continues", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        sseResponse([
          'data: {"choices":[{"delta":{"content":"A"}}]}\n\n',
          "data: {bad json}\n\n",
          'data: {"choices":[{"delta":{"content":"B"}}]}\n\n',
          "data: [DONE]\n\n",
        ]),
      ),
    );
    let text = "";

    await expect(
      streamChatCompletion(config, messages, (delta: string) => {
        text += delta;
      }),
    ).resolves.toBeUndefined();

    // Malformed block skipped; valid deltas before/after still arrive.
    expect(text).toBe("AB");
  });
});
