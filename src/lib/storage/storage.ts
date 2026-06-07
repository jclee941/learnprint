import { LEARNING_ITEM_TYPES, type LearningItem } from "../../types/learning";

export const STORAGE_KEY = "hycu-learning-resume:items:v1";

function isValidLearningItem(x: unknown): x is LearningItem {
  if (typeof x !== "object" || x === null) return false;
  const item = x as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    item.id !== "" &&
    typeof item.title === "string" &&
    typeof item.type === "string" &&
    (LEARNING_ITEM_TYPES as readonly string[]).includes(item.type) &&
    typeof item.period === "string" &&
    typeof item.description === "string" &&
    typeof item.evidence === "string" &&
    typeof item.createdAt === "number" &&
    Number.isFinite(item.createdAt)
  );
}

export function loadLearningItems(): LearningItem[] {
  let storedItems: string | null;
  try {
    storedItems = localStorage.getItem(STORAGE_KEY);
  } catch {
    return [];
  }

  if (storedItems === null) {
    return [];
  }

  try {
    const parsedItems: unknown = JSON.parse(storedItems);

    return Array.isArray(parsedItems) ? parsedItems.filter(isValidLearningItem) : [];
  } catch {
    return [];
  }
}

/** localStorage에 학습 경험이 한 번이라도 저장된 적이 있는지 여부(첫 실행 판별용). */
export function hasStoredLearningItems(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function saveLearningItems(items: LearningItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // 저장소 비활성화/용량 초과 등에서도 앱이 중단되지 않도록 무시한다.
  }
}

export function clearLearningItems(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 저장소 접근 실패 시 무시한다.
  }
}
