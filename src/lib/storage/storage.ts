import type { LearningItem } from "../../types/learning";

export const STORAGE_KEY = "hycu-learning-resume:items:v1";

export function loadLearningItems(): LearningItem[] {
  const storedItems = localStorage.getItem(STORAGE_KEY);

  if (storedItems === null) {
    return [];
  }

  try {
    const parsedItems: unknown = JSON.parse(storedItems);

    return Array.isArray(parsedItems) ? parsedItems : [];
  } catch {
    return [];
  }
}

/** localStorage에 학습 경험이 한 번이라도 저장된 적이 있는지 여부(첫 실행 판별용). */
export function hasStoredLearningItems(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function saveLearningItems(items: LearningItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function clearLearningItems(): void {
  localStorage.removeItem(STORAGE_KEY);
}
