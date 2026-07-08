import type { LearningItem, LearningItemType } from "./learning";

export interface Evidence {
  itemId: string;
  title: string;
  type: LearningItemType;
  period: string;
  snippet: string;
  link: string;
}

export interface CompetencyGroup {
  key: string;
  label: string;
  score: number;
  itemIds: string[];
  evidence: Evidence[];
  summary: string;
}

export interface AnalysisResult {
  competencies: CompetencyGroup[];
  totalItems: number;
  // 생성 시각 메타데이터입니다. 결정론 검증에서는 역량·증거 결과와 분리해 volatile 값으로 취급합니다.
  generatedAt: number;
  isEmpty: boolean;
}

export interface LearningResume {
  title: string;
  summary: string;
  competencies: CompetencyGroup[];
  items: LearningItem[];
  // 내보내기 생성 시각 메타데이터입니다. 본문 증거 원장 자체의 결정론과 분리합니다.
  generatedAt: number;
}

export type ResumeExportFormat = "markdown" | "json";
