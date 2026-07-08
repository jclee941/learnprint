import type { LearningItem } from "../../types/learning";

interface AnalysisPanelProps {
  items: LearningItem[];
  onGenerate: () => void;
  hasResume: boolean;
}

export function AnalysisPanel({ items, onGenerate, hasResume }: AnalysisPanelProps) {
  const isDisabled = items.length === 0;
  const statusText = hasResume
    ? "완성된 학습 이력서가 준비되었습니다. 본문을 검토한 뒤 내보내기 도구를 사용하세요."
    : "학습 경험을 확인한 뒤 이력서 생성을 눌러 초안을 만듭니다.";

  return (
    <section className="analysis-panel" aria-label="학습 이력서 생성 패널">
      <p className="item-count">현재 {items.length}개의 학습 경험이 등록되어 있습니다.</p>
      <p className="generation-guidance">입력한 항목은 결정론 규칙으로 역량과 증거 문장에 매칭됩니다.</p>
      {isDisabled && <p className="empty-guidance">학습 경험을 1개 이상 추가하면 이력서를 생성할 수 있어요.</p>}
      <p className={hasResume ? "resume-status" : "resume-status is-pending"} role="status">
        {statusText}
      </p>
      <button className="generate-action" type="button" onClick={onGenerate} disabled={isDisabled}>
        이력서 생성
      </button>
    </section>
  );
}
