import type { LearningItem } from "../../types/learning";

interface AnalysisPanelProps {
  items: LearningItem[];
  onGenerate: () => void;
  hasResume: boolean;
}

export function AnalysisPanel({ items, onGenerate, hasResume }: AnalysisPanelProps) {
  const isDisabled = items.length === 0;

  return (
    <section className="analysis-panel" aria-label="학습 이력서 생성 패널">
      <p className="item-count">현재 {items.length}개의 학습 경험이 등록되어 있습니다.</p>
      {isDisabled && <p className="empty-guidance">학습 경험을 1개 이상 추가하면 이력서를 생성할 수 있어요.</p>}
      {hasResume && <p className="resume-status">생성된 이력서가 준비되어 있습니다.</p>}
      <button className="generate-action" type="button" onClick={onGenerate} disabled={isDisabled}>
        이력서 생성
      </button>
    </section>
  );
}
