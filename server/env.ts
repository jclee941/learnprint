import type { LlmConfig } from "./types";

export function loadLlmConfig(
  env: NodeJS.ProcessEnv | Record<string, string | undefined>,
): LlmConfig {
  const apiKey = env.LLM_API_KEY;
  if (!apiKey) throw new Error("LLM API 키가 설정되지 않았습니다.");

  return {
    baseUrl: env.LLM_BASE_URL ?? "",
    apiKey,
    model: env.LLM_MODEL || "gemini-3-flash-agent",
  };
}
