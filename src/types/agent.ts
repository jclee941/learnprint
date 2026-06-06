export type AgentMode = "competency" | "coach" | "interview";

export interface AgentMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AgentChatRequest {
  mode: AgentMode;
  messages: AgentMessage[];
  items: import("./learning").LearningItem[];
}

export interface AgentChatChunk {
  delta: string;
  done: boolean;
}
