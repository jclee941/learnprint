import type { LearningResume } from "../../types/resume";

export interface ContestReadinessItem {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
}

export interface ContestReadinessSummary {
  readonly heading: "공모전 심사 요약";
  readonly items: readonly ContestReadinessItem[];
}

export interface FinalOutputSummary {
  readonly itemCount: number;
  readonly competencyCount: number;
  readonly evidenceCount: number;
  readonly linkedEvidenceCount: number;
  readonly exportStatus: string;
  readonly contestReadiness: ContestReadinessSummary;
}

const CONTEST_COMPETENCY_TARGET = 6;
const EXPLICIT_AI_SIGNAL_KEYWORDS = ["인공지능", "llm", "프롬프트", "챗봇", "openai", "codex"] as const;
const STANDALONE_AI_PATTERN = /(^|[^a-z0-9])ai([^a-z0-9]|$)/i;

export function createFinalOutputSummary(resume: LearningResume): FinalOutputSummary {
  const evidence = resume.competencies.flatMap((competency) => competency.evidence);
  const linkedEvidenceCount = evidence.filter((item) => item.link.trim().length > 0).length;
  const competencyCount = resume.competencies.filter((competency) => competency.evidence.length > 0).length;

  return {
    itemCount: resume.items.length,
    competencyCount,
    evidenceCount: evidence.length,
    linkedEvidenceCount,
    exportStatus: "Markdown·JSON·증거 원장·인쇄본 준비 완료",
    contestReadiness: buildContestReadinessSummary(resume, evidence.length, linkedEvidenceCount, competencyCount),
  };
}

function buildContestReadinessSummary(
  resume: LearningResume,
  evidenceCount: number,
  linkedEvidenceCount: number,
  competencyCount: number,
): ContestReadinessSummary {
  const aiRelatedItemCount = resume.items.filter(hasAiSignal).length;

  return {
    heading: "공모전 심사 요약",
    items: [
      {
        label: "AI 활용성",
        value: `AI 관련 기록 ${aiRelatedItemCount}개`,
        detail: "AI 질문·검토·수정 과정을 학습 증거와 연결합니다.",
      },
      {
        label: "증거성",
        value: `${evidenceCount}개 증거 / 링크 ${linkedEvidenceCount}개`,
        detail: "각 학습 경험을 역량별 증거 문장과 인공물 출처로 추적합니다.",
      },
      {
        label: "재현성",
        value: "결정론적 분석",
        detail: "동일 입력에서 동일 결과를 내는 규칙 엔진과 JSON·Markdown 출력으로 재검증할 수 있습니다.",
      },
      {
        label: "개인정보 안전성",
        value: "브라우저 중심 보관",
        detail: "학습 데이터는 브라우저 저장을 기본으로 하며 민감정보는 제출 전 검토·삭제해야 합니다.",
      },
      {
        label: "역량 커버리지",
        value: `${competencyCount}/${CONTEST_COMPETENCY_TARGET} 역량`,
        detail: "흩어진 학습 기록을 공모전 심사자가 비교하기 쉬운 역량 단위로 압축합니다.",
      },
    ],
  };
}

function hasAiSignal(item: LearningResume["items"][number]): boolean {
  const searchableText = `${item.title} ${item.description} ${item.evidence}`.toLocaleLowerCase();
  return (
    STANDALONE_AI_PATTERN.test(searchableText) ||
    EXPLICIT_AI_SIGNAL_KEYWORDS.some((keyword) => searchableText.includes(keyword.toLocaleLowerCase()))
  );
}
