import type { LearningResume } from "../../types/resume";
import { createFinalOutputSummary } from "./finalOutputSummary";

function formatGeneratedDate(generatedAt: number): string {
  return Number.isFinite(generatedAt)
    ? new Date(generatedAt).toLocaleDateString("ko-KR")
    : "—";
}

export function resumeToMarkdown(resume: LearningResume): string {
  const generatedDate = formatGeneratedDate(resume.generatedAt);
  const finalOutputSummary = createFinalOutputSummary(resume);
  const lines = [`# ${resume.title}`, "", resume.summary, "", `생성일: ${generatedDate}`];

  lines.push(
    "",
    "## 최종 산출물 패키지",
    "",
    `- 학습 경험: ${finalOutputSummary.itemCount}개`,
    `- 역량 커버리지: ${finalOutputSummary.competencyCount}개`,
    `- 증거 문장: ${finalOutputSummary.evidenceCount}개`,
    `- 증거 링크: ${finalOutputSummary.linkedEvidenceCount}개`,
    `- 내보내기 상태: ${finalOutputSummary.exportStatus}`,
  );

  lines.push("", `## ${finalOutputSummary.contestReadiness.heading}`, "");

  for (const item of finalOutputSummary.contestReadiness.items) {
    lines.push(`- **${item.label}**: ${item.value} — ${item.detail}`);
  }

  for (const competency of resume.competencies) {
    lines.push("", `## ${competency.label}`, "", competency.summary, "");

    for (const evidence of competency.evidence) {
      const linkText = evidence.link ? ` ${formatMarkdownLink("링크", evidence.link)}` : "";
      const typeAndPeriod = `(${formatTypeAndPeriod(evidence.type, evidence.period)})`;
      lines.push(`- **${evidence.title}** ${typeAndPeriod}: ${evidence.snippet}${linkText}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

export function resumeToJson(resume: LearningResume): string {
  return JSON.stringify(resume, null, 2);
}

function escapeMarkdownLinkLabel(label: string): string {
  return label.replace(/[\r\n]+/g, " ").replace(/([\\[\]])/g, "\\$1");
}

function encodeMarkdownDestinationCharacter(character: string): string {
  switch (character) {
    case "\\":
      return "%5C";
    case "(":
      return "%28";
    case ")":
      return "%29";
    case "[":
      return "%5B";
    case "]":
      return "%5D";
    case "<":
      return "%3C";
    case ">":
      return "%3E";
    default:
      return encodeURIComponent(character);
  }
}

function escapeMarkdownLinkDestination(destination: string): string {
  return destination.replace(/[\u0000-\u001F\u007F\s\\[\]<>()]/g, (character) =>
    encodeMarkdownDestinationCharacter(character),
  );
}

function formatMarkdownLink(label: string, destination: string): string {
  return `[${escapeMarkdownLinkLabel(label)}](${escapeMarkdownLinkDestination(destination)})`;
}

function escapeTableCell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/[\r\n]+/g, " ").trim();
}

function formatTypeAndPeriod(type: string, period: string): string {
  return period ? `${type}, ${period}` : type;
}

export function resumeToEvidenceLedgerMarkdown(resume: LearningResume): string {
  const generatedDate = formatGeneratedDate(resume.generatedAt);
  const finalOutputSummary = createFinalOutputSummary(resume);
  const lines = [
    "# \uC5ED\uB7C9 \uC99D\uAC70 \uC6D0\uC7A5",
    "",
    "\uD769\uC5B4\uC9C4 \uD559\uC2B5 \uACBD\uD5D8\uC744 \uC5ED\uB7C9\uBCC4 \uC99D\uAC70\uB85C \uC7AC\uAD6C\uC131\uD55C \uC6D0\uC7A5\uC785\uB2C8\uB2E4. \uAC01 \uD589\uC740 \uD558\uB098\uC758 \uD559\uC2B5 \uD754\uC801\uC744 \uADF8 \uC99D\uAC70\uAC00 \uB0A8\uC740 \uC778\uACF5\uBB3C\u00B7\uCD9C\uCC98\uC640 \uD568\uAED8 \uD558\uB098\uC758 \uC5ED\uB7C9\uC5D0 \uC5F0\uACB0\uD569\uB2C8\uB2E4.",
    "",
    `\uC0DD\uC131\uC77C: ${generatedDate}`,
    "",
    "## 최종 산출물 패키지",
    "",
    `- 학습 경험: ${finalOutputSummary.itemCount}개`,
    `- 역량 커버리지: ${finalOutputSummary.competencyCount}개`,
    `- 증거 문장: ${finalOutputSummary.evidenceCount}개`,
    `- 증거 링크: ${finalOutputSummary.linkedEvidenceCount}개`,
    `- 내보내기 상태: ${finalOutputSummary.exportStatus}`,
    "",
    `## ${finalOutputSummary.contestReadiness.heading}`,
    "",
    "| 평가 항목 | 현재 상태 | 심사 포인트 |",
    "| --- | --- | --- |",
  ];

  for (const item of finalOutputSummary.contestReadiness.items) {
    lines.push(
      `| ${escapeTableCell(item.label)} | ${escapeTableCell(item.value)} | ${escapeTableCell(item.detail)} |`,
    );
  }

  lines.push(
    "",
    "| \uD559\uC2B5 \uACBD\uD5D8 | \uC720\uD615\u00B7\uAE30\uAC04 | \uC778\uACF5\uBB3C\u00B7\uCD9C\uCC98 | \uC5ED\uB7C9 | \uC99D\uAC70 \uBB38\uC7A5 | \uD55C\uACC4 |",
    "| --- | --- | --- | --- | --- | --- |",
  );

  for (const competency of resume.competencies) {
    for (const evidence of competency.evidence) {
      const artifact = evidence.link
        ? formatMarkdownLink("\uD30C\uC77C\u00B7\uB9C1\uD06C", evidence.link)
        : "\uAE30\uB85D \uBCF8\uBB38";
      const linkText = evidence.link
        ? ` ${formatMarkdownLink("\uB9C1\uD06C", evidence.link)}`
        : "";
      const sentence = `${evidence.snippet}${linkText}`;
      const rowLimitation = "\uD0A4\uC6CC\uB4DC \uBD84\uB958 \uACB0\uACFC\uC774\uBA70 \uC758\uBBF8 \uAC80\uC99D\uC740 LLM \uAC80\uD1A0 \uD544\uC694";
      lines.push(
        `| ${escapeTableCell(evidence.title)} | ${escapeTableCell(formatTypeAndPeriod(evidence.type, evidence.period.trim()))} | ${escapeTableCell(artifact)} | ${escapeTableCell(competency.label)} | ${escapeTableCell(sentence)} | ${escapeTableCell(rowLimitation)} |`,
      );
    }
  }

  lines.push(
    "",
    "> \uD55C\uACC4: \uC774 \uC6D0\uC7A5\uC740 \uC0AC\uC6A9\uC790\uAC00 \uC785\uB825\uD55C \uD559\uC2B5 \uAE30\uB85D\uACFC \uACB0\uC815\uB860\uC801 \uD0A4\uC6CC\uB4DC \uBD84\uB958 \uACB0\uACFC\uB97C \uAD6C\uC870\uD654\uD55C \uAC83\uC774\uBA70, \uC131\uC801\u00B7\uCD9C\uC11D\u00B7LMS \uC6D0\uBCF8\uC744 \uC790\uB3D9 \uAC80\uC99D\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uB610\uD55C \uC5EC\uB7EC \uCD9C\uCC98\uB97C \uAD50\uCC28 \uAC80\uC99D\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
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
