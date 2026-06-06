import type { LearningResume } from "../../types/resume";
import { downloadTextFile, resumeToJson, resumeToMarkdown } from "./exporters";

interface ExportControlsProps {
  resume: LearningResume;
}

export function ExportControls({ resume }: ExportControlsProps) {
  const handlePrint = (): void => {
    window.print();
  };

  const handleMarkdownExport = (): void => {
    downloadTextFile("learning-resume.md", resumeToMarkdown(resume), "text/markdown");
  };

  const handleJsonExport = (): void => {
    downloadTextFile("learning-resume.json", resumeToJson(resume), "application/json");
  };

  return (
    <div className="export-controls no-print" aria-label="이력서 내보내기 도구">
      <button type="button" onClick={handlePrint}>
        인쇄
      </button>
      <button type="button" onClick={handleMarkdownExport}>
        Markdown 내보내기
      </button>
      <button type="button" onClick={handleJsonExport}>
        JSON 내보내기
      </button>
    </div>
  );
}
