import type { AgentChatBody } from "./types";

const VALID_MODES: ReadonlySet<string> = new Set([
  "competency",
  "coach",
  "interview",
]);

const MAX_MESSAGES = 1000;
const MAX_CONTENT_LENGTH = 100_000;
const MAX_ITEMS = 1000;

export type ValidationResult =
  | { ok: true; body: AgentChatBody }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validate an untrusted /api/agent/chat request body. Returns a discriminated
 * result so the caller can respond 400 BEFORE switching to an SSE stream.
 * Keeps error text generic and bounds sizes to avoid resource abuse.
 */
export function validateAgentChatBody(raw: unknown): ValidationResult {
  if (!isRecord(raw)) {
    return { ok: false, error: "잘못된 요청 형식입니다." };
  }

  if (typeof raw.mode !== "string" || !VALID_MODES.has(raw.mode)) {
    return { ok: false, error: "잘못된 mode 값입니다." };
  }

  if (!Array.isArray(raw.messages) || raw.messages.length === 0) {
    return { ok: false, error: "messages가 비어 있거나 형식이 잘못되었습니다." };
  }

  if (raw.messages.length > MAX_MESSAGES) {
    return { ok: false, error: "messages 개수가 허용 범위를 초과했습니다." };
  }

  for (const message of raw.messages) {
    if (!isRecord(message)) {
      return { ok: false, error: "messages 항목 형식이 잘못되었습니다." };
    }
    if (typeof message.role !== "string") {
      return { ok: false, error: "messages 항목의 role이 잘못되었습니다." };
    }
    if (typeof message.content !== "string") {
      return { ok: false, error: "messages 항목의 content가 잘못되었습니다." };
    }
    if (message.content.length > MAX_CONTENT_LENGTH) {
      return { ok: false, error: "messages 내용 길이가 허용 범위를 초과했습니다." };
    }
  }

  if (!Array.isArray(raw.items)) {
    return { ok: false, error: "items 형식이 잘못되었습니다." };
  }

  if (raw.items.length > MAX_ITEMS) {
    return { ok: false, error: "items 개수가 허용 범위를 초과했습니다." };
  }

  const body: AgentChatBody = {
    mode: raw.mode as AgentChatBody["mode"],
    messages: raw.messages.map((message) => {
      const record = message as Record<string, unknown>;
      return { role: String(record.role), content: String(record.content) };
    }),
    items: raw.items,
  };

  return { ok: true, body };
}
