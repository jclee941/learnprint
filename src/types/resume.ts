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
  generatedAt: number;
  isEmpty: boolean;
}

export interface LearningResume {
  title: string;
  summary: string;
  competencies: CompetencyGroup[];
  items: LearningItem[];
  generatedAt: number;
}

export type ResumeExportFormat = "markdown" | "json";
