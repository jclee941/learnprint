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
      content: `${modePrompts[mode]}\n\n주어진 학습 이력만 사용하고, 모르는 내용은 추측하지 마세요. 반드시 한국어로 답하세요.\n\n작성 규칙: 인사말·서론·"😊" 같은 이모지 없이 바로 본론에서 시작하세요. "탄탄한", "돋보이는", "강력한", "효과적으로" 같은 과장·마케팅 형용사와 상투적인 마무리 문구는 쓰지 말고, 사실 중심으로 간결하게 쓰세요.\n\n서식 규칙: 마크다운 기호(**, ##, ###, *, -, \`)를 쓰지 마세요. 일반 문장과 줄바꿈, 목록이 필요하면 가운데점(·)으로만 구분하세요.\n\n학습 이력:\n${context}`,
    },
    ...userMessages,
  ];
}
