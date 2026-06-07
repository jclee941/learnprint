import { useEffect, useRef, useState } from "react";
import type { LearningResume } from "../../types/resume";
import { downloadTextFile, resumeToEvidenceLedgerMarkdown, resumeToJson, resumeToMarkdown } from "./exporters";

type CopyStatus = "success" | "failure";
const COPY_STATUS_DURATION_MS = 2000;

interface ExportControlsProps {
  resume: LearningResume;
}

export function ExportControls({ resume }: ExportControlsProps) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus | null>(null);
  const copyStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (copyStatusTimeoutRef.current !== null) {
        clearTimeout(copyStatusTimeoutRef.current);
        copyStatusTimeoutRef.current = null;
      }
    };
  }, []);

  const scheduleCopyStatusClear = (): void => {
    if (copyStatusTimeoutRef.current !== null) {
      clearTimeout(copyStatusTimeoutRef.current);
    }
    copyStatusTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setCopyStatus(null);
      }
      copyStatusTimeoutRef.current = null;
    }, COPY_STATUS_DURATION_MS);
  };

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

  const reportCopyOutcome = (status: CopyStatus): void => {
    if (!mountedRef.current) return;
    setCopyStatus(status);
    scheduleCopyStatusClear();
  };

  const handleCopy = (text: string): void => {
    try {
      if (!navigator.clipboard) {
        reportCopyOutcome("failure");
        return;
      }
      const result = navigator.clipboard.writeText(text);
      if (result && typeof result.then === "function") {
        void result.then(
          () => reportCopyOutcome("success"),
          () => reportCopyOutcome("failure"),
        );
      } else {
        reportCopyOutcome("success");
      }
    } catch {
      // 클립보드 API 미지원/권한 거부 시에도 조용히 무시한다.
      reportCopyOutcome("failure");
    }
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
      <span className="export-controls__status" role="status" aria-live="polite">
        {copyStatus === "success" ? "복사됨" : copyStatus === "failure" ? "복사 실패" : ""}
      </span>
    </div>
  );
}
