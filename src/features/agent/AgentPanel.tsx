import { useState } from "react";
import type { SyntheticEvent } from "react";

import { streamAgentChat } from "../../lib/agent/client";
import type { AgentChatRequest, AgentMessage, AgentMode } from "../../types/agent";
import type { LearningItem } from "../../types/learning";

interface AgentPanelProps {
  items: LearningItem[];
}

type AgentStatus = "idle" | "loading" | "streaming" | "done" | "error";

const MODE_PROMPTS: Record<AgentMode, string> = {
  competency: "내 학습 이력으로 핵심 역량과 자기소개 문단을 작성해줘.",
  coach: "내 학습 이력을 바탕으로 다음 학습 계획과 보완할 역량을 제안해줘.",
  interview: "내 학습 이력 기반 예상 면접/자기소개 질문 5개를 만들어줘.",
};

export function AgentPanel({ items }: AgentPanelProps) {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [assistantResponse, setAssistantResponse] = useState("");
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isDisabled = items.length === 0 || status === "loading" || status === "streaming";

  const runAgent = (mode: AgentMode, prompt: string): void => {
    if (items.length === 0) return;

    const userMessage: AgentMessage = { role: "user", content: prompt };
    const requestMessages = [...messages, userMessage];
    const request: AgentChatRequest = {
      mode,
      messages: requestMessages,
      items,
    };

    setMessages(requestMessages);
    setAssistantResponse("");
    setErrorMessage("");
    setStatus("loading");

    void streamAgentChat(request, {
      onDelta: (text) => {
        setStatus("streaming");
        setAssistantResponse((current) => current + text);
      },
      onDone: () => {
        setStatus("done");
      },
      onError: (message) => {
        setErrorMessage(message || "AI 연결에 실패했습니다. 오프라인 이력서 생성은 계속 사용할 수 있습니다.");
        setStatus("error");
      },
    });
  };

  const handleModeClick = (mode: AgentMode): void => {
    const prompt = mode === "coach" ? chatInput.trim() || MODE_PROMPTS.coach : MODE_PROMPTS[mode];
    runAgent(mode, prompt);
  };

  const handleChatSubmit = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const prompt = chatInput.trim() || MODE_PROMPTS.coach;
    runAgent("coach", prompt);
    setChatInput("");
  };

  return (
    <section className="panel-card agent-panel" aria-label="HYCU AI 학습 에이전트 패널">
      <div className="agent-header">
        <p className="eyebrow">AI Learning Agent</p>
        <h2>HYCU AI 학습 에이전트</h2>
        <p>등록한 학습 경험을 바탕으로 역량 문장, 학습 코칭, 면접 대비 질문을 실시간으로 제안합니다.</p>
      </div>

      {items.length === 0 && (
        <p className="empty-guidance agent-guidance">학습 경험을 1개 이상 추가하면 AI 분석을 사용할 수 있어요.</p>
      )}

      <div className="agent-mode-row no-print" aria-label="AI 에이전트 모드 선택">
        <button className="agent-mode-button" type="button" onClick={() => handleModeClick("competency")} disabled={isDisabled}>
          AI 역량 분석
        </button>
        <button className="agent-mode-button" type="button" onClick={() => handleModeClick("coach")} disabled={isDisabled}>
          학습 코칭
        </button>
        <button className="agent-mode-button" type="button" onClick={() => handleModeClick("interview")} disabled={isDisabled}>
          예상 면접질문
        </button>
      </div>

      <form className="agent-chat-form no-print" onSubmit={handleChatSubmit}>
        <label className="agent-chat-label" htmlFor="agent-chat-input">
          AI에게 질문하기
        </label>
        <div className="agent-chat-row">
          <textarea
            id="agent-chat-input"
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            placeholder="내 학습 이력에 대해 질문해보세요"
            rows={3}
          />
          <button className="agent-send-button" type="submit" disabled={isDisabled}>
            보내기
          </button>
        </div>
      </form>

      {messages.length > 0 && (
        <div className="agent-history" aria-label="AI 대화 기록">
          {messages.map((message, index) => (
            <p className="agent-message agent-message-user" key={`${message.role}-${index}-${message.content}`}>
              <span>나</span>
              {message.content}
            </p>
          ))}
        </div>
      )}

      <div className="agent-response" aria-live="polite" aria-label="AI 응답">
        {status === "loading" && <p className="agent-loading">AI가 학습 이력을 분석하고 있습니다...</p>}
        {assistantResponse && <p className="agent-response-bubble">{assistantResponse}</p>}
        {status === "error" && <p className="agent-error">{errorMessage}</p>}
        {status === "idle" && <p className="agent-placeholder">모드를 선택하거나 질문을 보내면 AI 응답이 여기에 표시됩니다.</p>}
      </div>
    </section>
  );
}
