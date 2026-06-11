import type { LearningResume } from "../../types/resume";

export interface FinalOutputSummary {
  readonly itemCount: number;
  readonly competencyCount: number;
  readonly evidenceCount: number;
  readonly linkedEvidenceCount: number;
  readonly exportStatus: string;
}

export function createFinalOutputSummary(resume: LearningResume): FinalOutputSummary {
  const evidence = resume.competencies.flatMap((competency) => competency.evidence);

  return {
    itemCount: resume.items.length,
    competencyCount: resume.competencies.filter((competency) => competency.evidence.length > 0).length,
    evidenceCount: evidence.length,
    linkedEvidenceCount: evidence.filter((item) => item.link.trim().length > 0).length,
    exportStatus: "Markdown·JSON·증거 원장·인쇄본 준비 완료",
  };
}

