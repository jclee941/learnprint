export type LearningItemType = "강의" | "과제" | "프로젝트" | "자격증" | "독학" | "대회" | "기타";

export interface LearningItem {
  id: string;
  title: string;
  type: LearningItemType;
  period: string;
  description: string;
  evidence: string;
  createdAt: number;
}

export type LearningItemDraft = Omit<LearningItem, "id" | "createdAt">;

export const LEARNING_ITEM_TYPES = ["강의", "과제", "프로젝트", "자격증", "독학", "대회", "기타"] as const satisfies readonly LearningItemType[];
