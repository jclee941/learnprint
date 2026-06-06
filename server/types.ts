export interface AgentChatBody {
  mode: "competency" | "coach" | "interview";
  messages: { role: string; content: string }[];
  items: unknown[];
}

export interface LlmConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}
