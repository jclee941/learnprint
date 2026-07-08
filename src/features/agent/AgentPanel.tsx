import { useEffect, useRef, useState } from "react";
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

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);
  // 스트리밍 텍스트를 ref에도 누적해 onDone에서 stale-closure 없이 최종 본문을 읽는다.
  const responseRef = useRef("");

  useEffect(() => {
    mountedRef.current = true;
    // 언마운트 시 진행 중인 요청을 취소하고 요청 ID를 무효화해 늦은 콜백을 무시한다.
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
      abortRef.current?.abort();
    };
  }, []);

  const isDisabled = items.length === 0 || status === "loading" || status === "streaming";

  const runAgent = (mode: AgentMode, prompt: string): void => {
    if (items.length === 0) return;

    // 이전 요청을 취소하고 새 요청 ID를 부여해 오래된 콜백을 무시한다.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    const isCurrent = () => mountedRef.current && requestId === requestIdRef.current;

    const userMessage: AgentMessage = { role: "user", content: prompt };
    const requestMessages = [...messages, userMessage];
    const request: AgentChatRequest = {
      mode,
      messages: requestMessages,
      items,
    };

    responseRef.current = "";
    setMessages(requestMessages);
    setAssistantResponse("");
    setErrorMessage("");
    setStatus("loading");

    void streamAgentChat(
      request,
      {
        onDelta: (text) => {
          if (!isCurrent()) return;
          setStatus("streaming");
          setAssistantResponse((current) => current + text);
          responseRef.current += text;
        },
        onDone: () => {
          if (controller === abortRef.current) abortRef.current = null;
          if (!isCurrent()) return;
          // 비어 있지 않은 최종 응답만 대화 기록에 추가해 다중 턴 문맥을 유지한다.
          const completed = responseRef.current;
          if (completed) {
            setMessages((current) => [...current, { role: "assistant", content: completed }]);
          }
          responseRef.current = "";
          setAssistantResponse("");
          setStatus("done");
        },
        onError: (message) => {
          if (controller === abortRef.current) abortRef.current = null;
          if (!isCurrent()) return;
          setErrorMessage(message || "AI 연결에 실패했습니다. 오프라인 이력서 생성은 계속 사용할 수 있습니다.");
          setStatus("error");
        },
      },
      controller.signal,
    );
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

  const handleClearHistory = (): void => {
    abortRef.current?.abort();
    abortRef.current = null;
    requestIdRef.current += 1;
    setMessages([]);
    setAssistantResponse("");
    responseRef.current = "";
    setErrorMessage("");
    setStatus("idle");
  };

  return (
    <section className="panel-card agent-panel" aria-label="HYCU AI 학습 에이전트 패널">
      <div className="agent-header">
        <p className="eyebrow">Optional AI Coach</p>
        <h2>HYCU AI 학습 에이전트</h2>
        <p>이력서 본문을 보조로 다듬고 싶을 때 역량 문장, 학습 코칭, 면접 질문을 요청합니다.</p>
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
        <>
          <button className="secondary-action no-print" type="button" onClick={handleClearHistory}>
            대화 기록 지우기
          </button>
          <div className="agent-history" aria-label="AI 대화 기록">
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <p
                  className={`agent-message ${isUser ? "agent-message-user" : "agent-message-assistant"}`}
                  key={`${message.role}-${index}-${message.content}`}
                >
                  <span>{isUser ? "나" : "AI"}</span>
                  {message.content}
                </p>
              );
            })}
          </div>
        </>
      )}

      <div
        className="agent-response"
        role="region"
        aria-live="polite"
        aria-busy={status === "loading" || status === "streaming"}
        aria-label="AI 응답"
      >
        {status === "loading" && <p className="agent-loading">AI가 학습 이력을 분석하고 있습니다...</p>}
        {assistantResponse && <p className="agent-response-bubble">{assistantResponse}</p>}
        {status === "error" && <p className="agent-error">{errorMessage}</p>}
        {status === "idle" && <p className="agent-placeholder">모드를 선택하거나 질문을 보내면 AI 응답이 여기에 표시됩니다.</p>}
      </div>
    </section>
  );
}
