// @vitest-environment node

import { describe, expect, it } from "vitest";
import { buildMessages } from "./prompt";
import type { AgentChatBody } from "./types";

const userMessages: AgentChatBody["messages"] = [
  { role: "user", content: "내 프로젝트를 분석해줘" },
];

describe("buildMessages", () => {
  it("prompt:system-is-korean-and-includes-context", () => {
    const context = "학습 항목: 캡스톤 프로젝트";
    const messages = buildMessages("competency", userMessages, context);

    expect(messages[0]).toMatchObject({ role: "system" });
    expect(messages[0]?.content).toContain(context);
    expect(messages[0]?.content).toContain("학습");
    expect(messages.slice(1)).toEqual(userMessages);
  });

  it("prompt:competency-mode-differs-from-coach", () => {
    const context = "학습 항목: 자료구조 과제";
    const competency = buildMessages("competency", userMessages, context);
    const coach = buildMessages("coach", userMessages, context);

    expect(competency[0]?.content).not.toBe(coach[0]?.content);
  });

  it("prompt:contains-no-secret", () => {
    const messages = buildMessages(
      "interview",
      userMessages,
      "학습 항목: 면접 대비 포트폴리오",
    );
    const combined = messages.map((message) => message.content).join("\n");

    expect(combined).not.toContain("sk-");
    expect(combined).not.toContain("192.168");
    expect(combined).not.toContain("apiKey");
  });
});
