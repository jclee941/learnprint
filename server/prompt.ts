import type { AgentChatBody } from "./types";

const modePrompts: Record<AgentChatBody["mode"], string> = {
  competency:
    "HYCU 학습 코치로서 학습 이력을 역량·증거 기반으로 분석하고 자기소개 문단을 작성하세요.",
  coach: "학습 계획, 개념 설명, 퀴즈를 돕는 학습 코칭 도우미로 답변하세요.",
  interview: "학습 이력 기반 예상 면접 질문과 자기소개 질문을 생성하세요.",
};

export function buildMessages(
  mode: AgentChatBody["mode"],
  userMessages: AgentChatBody["messages"],
  context: string,
): { role: string; content: string }[] {
  return [
    {
      role: "system",
      content: `${modePrompts[mode]}\n\n주어진 학습 이력만 사용하고, 모르는 내용은 추측하지 마세요. 반드시 한국어로 답하세요.\n\n학습 이력:\n${context}`,
    },
    ...userMessages,
  ];
}
