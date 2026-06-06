import type { LearningItem, LearningItemType } from "../types/learning";
import { LEARNING_ITEM_TYPES } from "../types/learning";
import rawSeed from "./hycu-seed.json";

/**
 * HYCU 실제 학습 데이터 시드(seed).
 *
 * 본 시드는 작성자의 HYCU 수강 과목명을 기반으로, 과목별 학습 내용을 작성자가 직접 기록한 학습 경험 데이터입니다.
 * 개인정보·학번·인증정보는 포함하지 않습니다.
 *
 * 앱 런타임은 이 JSON만 사용하므로 네트워크 호출이 없으며, localStorage가
 * 비어 있는 첫 실행 시에만 주입됩니다.
 */

interface RawSeedItem {
  id: string;
  title: string;
  type: string;
  period: string;
  description: string;
  evidence: string;
  createdAt: number;
}

function toLearningItemType(value: string): LearningItemType {
  return (LEARNING_ITEM_TYPES as readonly string[]).includes(value) ? (value as LearningItemType) : "강의";
}

/** HYCU 학습 데이터를 LearningItem[]으로 반환한다. */
export function createHycuSeedItems(): LearningItem[] {
  return (rawSeed as RawSeedItem[]).map((item) => ({
    id: item.id,
    title: item.title,
    type: toLearningItemType(item.type),
    period: item.period,
    description: item.description,
    evidence: item.evidence,
    createdAt: item.createdAt,
  }));
}
