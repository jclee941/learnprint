import type { LearningResume } from "../../types/resume";

export function resumeToMarkdown(resume: LearningResume): string {
  const generatedDate = new Date(resume.generatedAt).toLocaleDateString("ko-KR");
  const lines = [`# ${resume.title}`, "", resume.summary, "", `생성일: ${generatedDate}`];

  for (const competency of resume.competencies) {
    lines.push("", `## ${competency.label}`, "", competency.summary, "");

    for (const evidence of competency.evidence) {
      const linkText = evidence.link ? ` [링크](${evidence.link})` : "";
      lines.push(`- **${evidence.title}** (${evidence.type}, ${evidence.period}): ${evidence.snippet}${linkText}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

export function resumeToJson(resume: LearningResume): string {
  return JSON.stringify(resume, null, 2);
}

export function downloadTextFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
