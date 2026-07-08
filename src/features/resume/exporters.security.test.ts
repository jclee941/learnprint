import { describe, expect, it } from "vitest";

import type { LearningResume } from "../../types/resume";
import { resumeToEvidenceLedgerMarkdown, resumeToMarkdown } from "./exporters";

const maliciousLink = "https://safe.example/a) [위조](https://evil.example";

function createResumeWithEvidenceLink(link: string): LearningResume {
  return {
    title: "보안 테스트 이력서",
    summary: "악의적 링크가 Markdown 구조를 위조하지 않아야 합니다.",
    generatedAt: 1_767_225_600_000,
    items: [
      {
        id: "security-item",
        title: "보안 검증",
        type: "프로젝트",
        period: "2026.01",
        description: "Markdown 링크 삽입을 검증했습니다.",
        evidence: link,
        createdAt: 1_767_225_600_000,
      },
    ],
    competencies: [
      {
        key: "security",
        label: "보안 검증 역량",
        score: 10,
        itemIds: ["security-item"],
        summary: "내보내기 결과가 삽입 공격에 견딥니다.",
        evidence: [
          {
            itemId: "security-item",
            title: "보안 검증",
            type: "프로젝트",
            period: "2026.01",
            snippet: "Markdown 링크 삽입을 검증했습니다.",
            link,
          },
        ],
      },
    ],
  };
}

describe("resume exporter security", () => {
  it("resume:markdown-escapes-evidence-link-destination-when-link-contains-forged-markdown", () => {
    // Given: an evidence link whose destination closes early and appends a forged link.
    const resume = createResumeWithEvidenceLink(maliciousLink);

    // When: the resume is exported as Markdown.
    const markdown = resumeToMarkdown(resume);

    // Then: the malicious destination is rendered as text inside one link, not a second link.
    expect(markdown).not.toContain("](https://evil.example)");
    expect(markdown).toContain("[링크](https://safe.example/a%29%20%5B위조%5D%28https://evil.example)");
  });

  it("resume:evidence-ledger-escapes-evidence-link-destination-when-link-contains-forged-markdown", () => {
    // Given: an evidence link whose destination closes early and appends a forged link.
    const resume = createResumeWithEvidenceLink(maliciousLink);

    // When: the evidence ledger is exported as Markdown.
    const ledger = resumeToEvidenceLedgerMarkdown(resume);

    // Then: neither the source column nor the sentence column can forge another link.
    expect(ledger).not.toContain("](https://evil.example)");
    expect(ledger).toContain(
      "[파일·링크](https://safe.example/a%29%20%5B위조%5D%28https://evil.example)",
    );
    expect(ledger).toContain(
      "[링크](https://safe.example/a%29%20%5B위조%5D%28https://evil.example)",
    );
  });
});
