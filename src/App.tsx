import { useEffect, useState } from "react";

import { AnalysisPanel } from "./features/analysis/AnalysisPanel";
import { LearningItemForm } from "./features/analysis/LearningItemForm";
import { LearningItemList } from "./features/analysis/LearningItemList";
import { ExportControls, ResumeView } from "./features/resume";
import { AgentPanel } from "./features/agent";
import { useLearningItems } from "./hooks/useLearningItems";
import { analyzeLearningItems, countMeaningfulCompetencies } from "./lib/ai";
import type { LearningResume } from "./types/resume";

export default function App() {
  const { items, addItem, removeItem, clearAll, restoreSample } = useLearningItems();
  const [resume, setResume] = useState<LearningResume | null>(null);
  const [resumeItemSignature, setResumeItemSignature] = useState("");
  const [coverage, setCoverage] = useState(0);
  const itemSignature = items.map((item) => `${item.id}:${item.createdAt}`).join("|");
  const isSubmissionReady = resume !== null && resumeItemSignature === itemSignature;

  useEffect(() => {
    if (items.length === 0) {
      setResume(null);
    }
  }, [items.length]);

  const handleGenerate = (): void => {
    const result = analyzeLearningItems(items);

    if (result.isEmpty) {
      return;
    }

    setResume({
      title: "학습 이력서",
      summary: `${result.totalItems}개의 학습 경험을 바탕으로 핵심 역량과 증거를 정리했습니다.`,
      competencies: result.competencies,
      items,
      generatedAt: result.generatedAt,
    });
    setResumeItemSignature(itemSignature);
    setCoverage(countMeaningfulCompetencies(result));
  };

  const invalidateResume = (): void => {
    setResume(null);
    setResumeItemSignature("");
    setCoverage(0);
  };

  const handleRestoreSample = (): void => {
    restoreSample();
    invalidateResume();
  };

  const handleClearAll = (): void => {
    if (!window.confirm("등록된 학습 경험을 모두 삭제할까요? 이력서도 함께 초기화됩니다.")) {
      return;
    }
    clearAll();
    invalidateResume();
  };

  return (
    <div className="app">
      <header className="app-header">
        <p className="eyebrow">HYCU Learning Résumé</p>
        <h1>HYCU 학습 이력서</h1>
        <p className="app-subtitle">한 페이지에서 입력부터 이력서 생성까지 끝내기</p>
      </header>

      <main className="app-main">
        <section className="analysis-workspace" aria-label="학습 경험 입력과 분석">
          <section className="submission-flow panel-card" aria-label="이력서 만들기 흐름">
            <div>
              <p className="eyebrow">Resume Builder</p>
              <h2>이력서 만들기 흐름</h2>
              <p>학습 경험을 정리하고 이력서를 생성한 뒤, Markdown·JSON·증거 원장·인쇄본까지 한 화면에서 준비합니다.</p>
            </div>
            <div className="submission-steps" aria-label="이력서 만들기 단계">
              <div className={items.length > 0 ? "submission-step is-complete" : "submission-step"}>
                <span>1</span>
                <strong>등록된 학습 경험 {items.length}개</strong>
                <small>{items.length > 0 ? "강의·프로젝트·증거를 한 곳에 모읍니다." : "학습 경험을 1개 이상 입력합니다."}</small>
              </div>
              <div className={isSubmissionReady ? "submission-step is-complete" : "submission-step"}>
                <span>2</span>
                <strong>{isSubmissionReady ? "이력서 준비 완료" : "출력 전"}</strong>
                <small>{isSubmissionReady ? "아래에서 원하는 형식으로 이력서를 저장하세요." : "이력서 생성을 눌러 이력서 문서를 만듭니다."}</small>
              </div>
            </div>
          </section>

          <div className="panel-card form-panel">
            <h2>학습 경험 입력</h2>
            <p>강의, 과제, 프로젝트, 자격증까지 이력서의 근거가 될 학습 흔적을 기록하세요.</p>
            <LearningItemForm onAdd={addItem} />
          </div>

          <AnalysisPanel items={items} onGenerate={handleGenerate} hasResume={isSubmissionReady} />
          <AgentPanel items={items} />
          {items.length > 0 && (
            <div className="learning-item-list-header">
              <h2>등록된 학습 경험 목록</h2>
              <button className="secondary-action" type="button" onClick={handleRestoreSample}>
                샘플 불러오기
              </button>
              <button className="secondary-action" type="button" onClick={handleClearAll}>
                전체 삭제
              </button>
            </div>
          )}
          <LearningItemList items={items} onRemove={removeItem} />
        </section>

        {isSubmissionReady && resume && (
          <section className="resume-output">
            <div className="submission-package no-print">
              <p className="eyebrow">Ready to Export</p>
              <h2>완성된 학습 이력서</h2>
              <p className="coverage-summary">역량 {coverage}/6 커버리지</p>
              <p>이력서 본문을 확인한 뒤 원하는 형식으로 Markdown, JSON, 증거 원장 또는 인쇄본으로 내보내세요.</p>
            </div>
            <ExportControls resume={resume} />
            <ResumeView resume={resume} />
          </section>
        )}
      </main>
    </div>
  );
}
