import { streamChatCompletion } from "./cliproxy";
import { buildMessages } from "./prompt";
import type { AgentChatBody, LlmConfig } from "./types";

function buildLearningContext(items: unknown[]): string {
  if (items.length === 0) return "학습 항목 없음";

  return items
    .map((item, index) => {
      if (!item || typeof item !== "object") return `${index + 1}. ${String(item)}`;
      const record = item as Record<string, unknown>;
      const parts = [
        record.title && `제목: ${String(record.title)}`,
        record.type && `유형: ${String(record.type)}`,
        record.period && `기간: ${String(record.period)}`,
        record.description && `설명: ${String(record.description)}`,
        record.summary && `요약: ${String(record.summary)}`,
      ].filter(Boolean);
      return `${index + 1}. ${parts.join(" / ")}`;
    })
    .join("\n");
}

export async function handleAgentChat(
  body: AgentChatBody,
  config: LlmConfig,
  write: (chunk: string) => void,
): Promise<void> {
  if (!body.messages.length) throw new Error("메시지가 비어 있습니다.");

  const context = buildLearningContext(body.items);
  const messages = buildMessages(body.mode, body.messages, context);

  await streamChatCompletion(config, messages, (delta) => {
    write(`data: ${JSON.stringify({ delta, done: false })}\n\n`);
  });
  write(`data: ${JSON.stringify({ delta: "", done: true })}\n\n`);
  write("data: [DONE]\n\n");
}
