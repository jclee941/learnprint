import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LearningResume } from "../../types/resume";
import { ExportControls } from "./ExportControls";
import * as exporters from "./exporters";

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
});
