import type { LearningResume } from "../../types/resume";
import { downloadTextFile, resumeToEvidenceLedgerMarkdown, resumeToJson, resumeToMarkdown } from "./exporters";

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

  const handleEvidenceLedgerExport = (): void => {
    downloadTextFile("learning-evidence-ledger.md", resumeToEvidenceLedgerMarkdown(resume), "text/markdown");
  };

  const handleCopy = (text: string): void => {
    navigator.clipboard?.writeText(text);
  };

  const handleMarkdownCopy = (): void => {
    handleCopy(resumeToMarkdown(resume));
  };

  const handleJsonCopy = (): void => {
    handleCopy(resumeToJson(resume));
  };

  const handleEvidenceLedgerCopy = (): void => {
    handleCopy(resumeToEvidenceLedgerMarkdown(resume));
  };

  return (
    <div className="export-controls no-print" aria-label="이력서 내보내기 도구">
      <button type="button" onClick={handlePrint}>
        인쇄
      </button>
      <button type="button" onClick={handleMarkdownExport}>
        Markdown 내보내기
      </button>
      <button type="button" onClick={handleMarkdownCopy}>
        Markdown 복사
      </button>
      <button type="button" onClick={handleJsonExport}>
        JSON 내보내기
      </button>
      <button type="button" onClick={handleJsonCopy}>
        JSON 복사
      </button>
      <button type="button" onClick={handleEvidenceLedgerExport}>
        증거 원장 내보내기
      </button>
      <button type="button" onClick={handleEvidenceLedgerCopy}>
        증거 원장 복사
      </button>
    </div>
  );
}
