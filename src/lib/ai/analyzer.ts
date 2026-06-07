import type { LearningItem } from "../../types/learning";
import type { AnalysisResult, CompetencyGroup, Evidence } from "../../types/resume";

export interface LearningAnalyzer {
  analyze(items: LearningItem[]): AnalysisResult;
}

interface CompetencyCatalogEntry {
  key: string;
  label: string;
  keywords: readonly string[];
}

interface AssignedItem {
  item: LearningItem;
  score: number;
}

const COMPETENCY_CATALOG: readonly CompetencyCatalogEntry[] = [
  {
    key: "competency-0-data-ai",
    label: "데이터·AI 활용",
    keywords: [
      "데이터",
      "분석",
      "AI",
      "인공지능",
      "머신러닝",
      "통계",
      "시각화",
      "data",
      "ml",
      "python",
      "모델",
      "질문",
      "비교표",
      "개념 비교표",
      "포그라운드",
      "백그라운드",
      "용량 제한",
      "불안정",
      "대응 전략",
      "개념도",
      "도식화",
      "시각적",
    ],
  },
  {
    key: "competency-1-problem-solving",
    label: "문제해결·논리력",
    keywords: [
      "문제",
      "해결",
      "알고리즘",
      "설계",
      "디버깅",
      "논리",
      "최적화",
      "algorithm",
      "버그",
      "원인",
      "수정",
      "퀴즈",
      "퀴즈 형식",
      "오답",
      "오답 노트",
      "틀린",
      "풀어",
      "처리되는",
      "전체 흐름",
    ],
  },
  {
    key: "competency-2-collaboration",
    label: "협업·커뮤니케이션",
    keywords: ["팀", "협업", "발표", "프로젝트", "회의", "토론", "커뮤니케이션", "presentation", "team", "공유", "피드백"],
  },
  {
    key: "competency-3-self-directed",
    label: "자기주도학습",
    keywords: ["독학", "자격증", "복습", "자기주도", "학습계획", "루틴", "self", "학습노트", "노트", "재학습"],
  },
  {
    key: "competency-4-professional",
    label: "전공·직무역량",
    keywords: [
      "전공",
      "실무",
      "직무",
      "자격",
      "기술",
      "개발",
      "engineering",
      "게임",
      "루프",
      "충돌",
      "프로토타입",
      "모바일",
      "생명주기",
      "앱",
      "저장소",
      "네트워크",
      "렌더링",
      "좌표",
      "셰이더",
      "VR",
      "그래픽",
      "그래픽스",
      "회로",
      "신호",
      "통신",
      "캐시",
      "파이프라인",
      "메모리",
      "CPU",
      "명령어",
      "구조",
      "엔진",
    ],
  },
  {
    key: "competency-5-planning-writing",
    label: "기획·문서작성",
    keywords: ["기획", "보고서", "문서", "요약", "정리", "매뉴얼", "report", "성찰", "성찰문", "윤리", "책임", "봉사", "기록"],
  },
];

const FALLBACK_COMPETENCY: CompetencyCatalogEntry = {
  key: "competency-6-other",
  label: "기타 학습 경험",
  keywords: [],
};

const URL_PATTERN = /https?:\/\/\S+/i;

export function analyzeLearningItems(items: LearningItem[]): AnalysisResult {
  if (items.length === 0) {
    return {
      competencies: [],
      totalItems: 0,
      generatedAt: Date.now(),
      isEmpty: true,
    };
  }

  const assignments = new Map<string, AssignedItem[]>();

  for (const item of items) {
    const match = findBestCompetency(item);
    const groupItems = assignments.get(match.competency.key) ?? [];
    groupItems.push({ item, score: match.score });
    assignments.set(match.competency.key, groupItems);
  }

  const competencies = [...COMPETENCY_CATALOG, FALLBACK_COMPETENCY]
    .map((competency) => buildCompetencyGroup(competency, assignments.get(competency.key) ?? []))
    .filter((competency): competency is CompetencyGroup => competency !== null)
    .sort((left, right) => right.score - left.score || catalogIndexForKey(left.key) - catalogIndexForKey(right.key));

  return {
    competencies,
    totalItems: items.length,
    generatedAt: Date.now(),
    isEmpty: false,
  };
}

export function createHeuristicAnalyzer(): LearningAnalyzer {
  return {
    analyze: analyzeLearningItems,
  };
}
export function countMeaningfulCompetencies(result: AnalysisResult): number {
  return result.competencies.filter((competency) => !competency.label.includes("기타")).length;
}

function findBestCompetency(item: LearningItem): { competency: CompetencyCatalogEntry; score: number } {
  const searchableText = `${item.title} ${item.description} ${item.type}`.toLocaleLowerCase();
  let bestCompetency = FALLBACK_COMPETENCY;
  let bestScore = 0;

  for (const competency of COMPETENCY_CATALOG) {
    const score = countKeywordMatches(searchableText, competency.keywords);
    if (score > bestScore) {
      bestCompetency = competency;
      bestScore = score;
    }
  }

  return { competency: bestCompetency, score: bestScore };
}

function countKeywordMatches(searchableText: string, keywords: readonly string[]): number {
  return keywords.reduce((total, keyword) => total + (searchableText.includes(keyword.toLocaleLowerCase()) ? 1 : 0), 0);
}

function buildCompetencyGroup(competency: CompetencyCatalogEntry, assignedItems: AssignedItem[]): CompetencyGroup | null {
  if (assignedItems.length === 0) {
    return null;
  }

  return {
    key: competency.key,
    label: competency.label,
    score: assignedItems.reduce((total, assignedItem) => total + assignedItem.score, 0),
    itemIds: assignedItems.map(({ item }) => item.id),
    evidence: assignedItems.map(({ item }) => buildEvidence(item)),
    summary: `${competency.label} 관련 학습 ${assignedItems.length}건`,
  };
}

function buildEvidence(item: LearningItem): Evidence {
  return {
    itemId: item.id,
    title: item.title,
    type: item.type,
    period: item.period,
    snippet: buildSnippet(item),
    link: extractEvidenceLink(item.evidence),
  };
}

function buildSnippet(item: LearningItem): string {
  const source = item.description.trim() || item.title.trim();
  return source.slice(0, 80);
}

function extractEvidenceLink(evidence: string): string {
  return evidence.match(URL_PATTERN)?.[0] ?? "";
}

function catalogIndexForKey(key: string): number {
  const index = COMPETENCY_CATALOG.findIndex((competency) => competency.key === key);
  return index === -1 ? COMPETENCY_CATALOG.length : index;
}
