import type { AgentChatRequest } from "../../types/agent";

type StreamAgentChatHandlers = {
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
};

export async function streamAgentChat(
  request: AgentChatRequest,
  handlers: StreamAgentChatHandlers,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const response = await fetch("/api/agent/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
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
  } catch (error) {
    // 요청 취소(AbortError)는 사용자에게 보이는 오류가 아니므로 조용히 종료한다.
    if (error instanceof DOMException && error.name === "AbortError") return;
    if (error instanceof Error && error.name === "AbortError") return;
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

  let chunk: { delta?: string; done?: boolean; error?: string };
  try {
    chunk = JSON.parse(payload) as { delta?: string; done?: boolean; error?: string };
  } catch {
    // 손상된 data 블록 하나는 건너뛰고 스트림을 계속 처리한다.
    return false;
  }
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
