import type { LlmConfig } from "./types";

type ChatMessage = { role: string; content: string };

export async function streamChatCompletion(
  config: LlmConfig,
  messages: ChatMessage[],
  onDelta: (text: string) => void,
): Promise<void> {
  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: config.model, messages, stream: true }),
  });

  if (!res.ok) throw new Error(`LLM 오류 (HTTP ${res.status})`);
  if (!res.body) return;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const processBlock = (block: string): boolean => {
    for (const line of block.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") return false;

      let parsed: { choices?: { delta?: { content?: string } }[] };
      try {
        parsed = JSON.parse(data) as {
          choices?: { delta?: { content?: string } }[];
        };
      } catch {
        // 손상된 업스트림 data 블록은 건너뛰고 계속 처리한다.
        continue;
      }
      const content = parsed.choices?.[0]?.delta?.content;
      if (content) onDelta(content);
    }
    return true;
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });

    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      if (!processBlock(block)) return;
      boundary = buffer.indexOf("\n\n");
    }

    if (done) break;
  }

  if (buffer) processBlock(buffer);
}
