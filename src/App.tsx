import { useEffect, useState } from "react";

import { AnalysisPanel } from "./features/analysis/AnalysisPanel";
import { LearningItemForm } from "./features/analysis/LearningItemForm";
import { LearningItemList } from "./features/analysis/LearningItemList";
import { ExportControls, ResumeView } from "./features/resume";
import { AgentPanel } from "./features/agent";
import { useLearningItems } from "./hooks/useLearningItems";
import { analyzeLearningItems } from "./lib/ai";
import type { LearningResume } from "./types/resume";

export default function App() {
  const { items, addItem, removeItem } = useLearningItems();
  const [resume, setResume] = useState<LearningResume | null>(null);

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
  };

  return (
    <div className="app">
      <header className="app-header">
        <p className="eyebrow">HYCU Learning Résumé</p>
        <h1>HYCU 학습 이력서</h1>
        <p className="app-subtitle">흩어진 학습 경험을 역량·증거 기반 이력서로 재구성합니다</p>
      </header>

      <main className="app-main">
        <section className="analysis-workspace" aria-label="학습 경험 입력과 분석">
          <div className="panel-card form-panel">
            <h2>학습 경험 입력</h2>
            <p>강의, 과제, 프로젝트, 자격증까지 이력서의 근거가 될 학습 흔적을 기록하세요.</p>
            <LearningItemForm onAdd={addItem} />
          </div>

          <AnalysisPanel items={items} onGenerate={handleGenerate} hasResume={resume !== null} />
          <AgentPanel items={items} />
          <LearningItemList items={items} onRemove={removeItem} />
        </section>

        {resume && (
          <section className="resume-output">
            <ExportControls resume={resume} />
            <ResumeView resume={resume} />
          </section>
        )}
      </main>
    </div>
  );
}
