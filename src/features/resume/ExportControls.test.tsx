import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LearningResume } from "../../types/resume";
import { ExportControls } from "./ExportControls";
import * as exporters from "./exporters";
import { resumeToEvidenceLedgerMarkdown, resumeToJson, resumeToMarkdown } from "./exporters";

const resume: LearningResume = {
  title: "학습 이력서",
  summary: "1개의 학습 경험을 정리했습니다.",
  competencies: [],
  items: [],
  generatedAt: 1767225600000,
};

describe("ExportControls", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("export-controls:markdown-export-uses-english-filename", () => {
    const spy = vi.spyOn(exporters, "downloadTextFile").mockImplementation(() => {});
    render(<ExportControls resume={resume} />);
    fireEvent.click(screen.getByRole("button", { name: "Markdown 내보내기" }));
    expect(spy).toHaveBeenCalledWith(
      "learning-resume.md",
      expect.any(String),
      "text/markdown",
    );
  });

  it("export-controls:json-export-uses-english-filename", () => {
    const spy = vi.spyOn(exporters, "downloadTextFile").mockImplementation(() => {});
    render(<ExportControls resume={resume} />);
    fireEvent.click(screen.getByRole("button", { name: "JSON 내보내기" }));
    expect(spy).toHaveBeenCalledWith(
      "learning-resume.json",
      expect.any(String),
      "application/json",
    );
  });

  it("export-controls:evidence-ledger-export-uses-english-filename", () => {
    const spy = vi.spyOn(exporters, "downloadTextFile").mockImplementation(() => {});
    render(<ExportControls resume={resume} />);
    fireEvent.click(screen.getByRole("button", { name: "증거 원장 내보내기" }));
    expect(spy).toHaveBeenCalledWith(
      "learning-evidence-ledger.md",
      expect.any(String),
      "text/markdown",
    );
  });

  it("export-controls:print-button-calls-window-print", () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    render(<ExportControls resume={resume} />);
    fireEvent.click(screen.getByRole("button", { name: "인쇄" }));
    expect(printSpy).toHaveBeenCalledOnce();
  });
  it("export-controls:markdown-copy-invokes-clipboard", () => {
    const writeText = vi.fn();
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(<ExportControls resume={resume} />);
    fireEvent.click(screen.getByRole("button", { name: "Markdown 복사" }));
    expect(writeText).toHaveBeenCalledWith(resumeToMarkdown(resume));
  });

  it("export-controls:json-copy-invokes-clipboard", () => {
    const writeText = vi.fn();
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(<ExportControls resume={resume} />);
    fireEvent.click(screen.getByRole("button", { name: "JSON 복사" }));
    expect(writeText).toHaveBeenCalledWith(resumeToJson(resume));
  });

  it("export-controls:evidence-ledger-copy-invokes-clipboard", () => {
    const writeText = vi.fn();
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(<ExportControls resume={resume} />);
    fireEvent.click(screen.getByRole("button", { name: "증거 원장 복사" }));
    expect(writeText).toHaveBeenCalledWith(resumeToEvidenceLedgerMarkdown(resume));
  });

  it("export-controls:clipboard-missing-is-silent", () => {
    vi.stubGlobal("navigator", {});
    render(<ExportControls resume={resume} />);
    expect(() =>
      fireEvent.click(screen.getByRole("button", { name: "Markdown 복사" })),
    ).not.toThrow();
  });

});
