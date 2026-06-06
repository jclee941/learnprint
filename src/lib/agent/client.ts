import type { AgentChatRequest } from "../../types/agent";

type StreamAgentChatHandlers = {
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
};

export async function streamAgentChat(
  request: AgentChatRequest,
  handlers: StreamAgentChatHandlers,
): Promise<void> {
  try {
    const response = await fetch("/api/agent/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      handlers.onError(`AI 연결에 실패했습니다 (HTTP ${response.status})`);
      return;
    }

    if (!response.body) {
      handlers.onError("AI 응답 본문을 읽을 수 없습니다");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        if (handleSsePart(part, handlers)) return;
      }
    }

    buffer += decoder.decode();
    if (buffer && handleSsePart(buffer, handlers)) return;
  } catch {
    handlers.onError("AI 응답 처리 중 오류가 발생했습니다");
  }
}

function handleSsePart(part: string, handlers: StreamAgentChatHandlers): boolean {
  const line = part
    .split("\n")
    .find((candidate) => candidate.startsWith("data: "));

  if (!line) return false;

  const payload = line.slice("data: ".length);
  if (payload === "[DONE]") {
    handlers.onDone();
    return true;
  }

  const chunk = JSON.parse(payload) as { delta?: string; done?: boolean; error?: string };
  if (chunk.error) {
    handlers.onError(chunk.error);
    return true;
  }

  if (chunk.delta) {
    handlers.onDelta(chunk.delta);
  }

  if (chunk.done === true) {
    handlers.onDone();
    return true;
  }

  return false;
}
