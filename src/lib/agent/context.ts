export function buildLearningContext(items: import("../../types/learning").LearningItem[]): string {
  if (items.length === 0) {
    return "아직 등록된 학습 경험이 없습니다.";
  }

  return items
    .map(
      (item) =>
        `- [${item.type}] ${item.title} (${item.period}): ${item.description} | 증거: ${item.evidence}`,
    )
    .join("\n");
}
