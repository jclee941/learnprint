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

function escapeTableCell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ").trim();
}

export function resumeToEvidenceLedgerMarkdown(resume: LearningResume): string {
  const generatedDate = new Date(resume.generatedAt).toLocaleDateString("ko-KR");
  const lines = [
    "# 역량 증거 원장",
    "",
    "흔어진 학습 경험을 역량별 증거로 재구성한 원장입니다. 각 행은 하나의 학습 흔적을 하나의 역량과 연결합니다.",
    "",
    `생성일: ${generatedDate}`,
    "",
    "| 학습 경험 | 유형·기간 | 역량 | 증거 문장 |",
    "| --- | --- | --- | --- |",
  ];

  for (const competency of resume.competencies) {
    for (const evidence of competency.evidence) {
      const linkText = evidence.link ? ` [링크](${evidence.link})` : "";
      const sentence = `${evidence.snippet}${linkText}`;
      lines.push(
        `| ${escapeTableCell(evidence.title)} | ${escapeTableCell(`${evidence.type}, ${evidence.period}`)} | ${escapeTableCell(competency.label)} | ${escapeTableCell(sentence)} |`,
      );
    }
  }

  lines.push(
    "",
    "> 한계: 이 원장은 사용자가 입력한 학습 기록과 결정론적 키워드 분류 결과를 구조화한 것이며, 성적·출석·LMS 원본을 자동 검증하지 않습니다.",
  );

  return `${lines.join("\n")}\n`;
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
