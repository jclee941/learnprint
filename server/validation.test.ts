// @vitest-environment node

import { describe, expect, it } from "vitest";
import { validateAgentChatBody } from "./validation";

describe("validateAgentChatBody", () => {
  it("validation:accepts-valid-body", () => {
    const result = validateAgentChatBody({
      mode: "competency",
      messages: [{ role: "user", content: "hi" }],
      items: [{ title: "x" }],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.body.mode).toBe("competency");
      expect(result.body.messages).toHaveLength(1);
    }
  });

  it("validation:rejects-invalid-mode", () => {
    const result = validateAgentChatBody({
      mode: "bogus",
      messages: [{ role: "user", content: "hi" }],
      items: [],
    });
    expect(result.ok).toBe(false);
  });

  it("validation:rejects-non-object", () => {
    expect(validateAgentChatBody(null).ok).toBe(false);
    expect(validateAgentChatBody("string").ok).toBe(false);
    expect(validateAgentChatBody(42).ok).toBe(false);
  });

  it("validation:rejects-empty-messages", () => {
    const result = validateAgentChatBody({
      mode: "coach",
      messages: [],
      items: [],
    });
    expect(result.ok).toBe(false);
  });

  it("validation:rejects-non-array-messages", () => {
    const result = validateAgentChatBody({
      mode: "coach",
      messages: "not-an-array",
      items: [],
    });
    expect(result.ok).toBe(false);
  });

  it("validation:rejects-message-with-non-string-content", () => {
    const result = validateAgentChatBody({
      mode: "coach",
      messages: [{ role: "user", content: 123 }],
      items: [],
    });
    expect(result.ok).toBe(false);
  });

  it("validation:rejects-non-array-items", () => {
    const result = validateAgentChatBody({
      mode: "coach",
      messages: [{ role: "user", content: "hi" }],
      items: { not: "array" },
    });
    expect(result.ok).toBe(false);
  });

  it("validation:rejects-too-many-messages", () => {
    const messages = Array.from({ length: 1001 }, () => ({
      role: "user",
      content: "x",
    }));
    const result = validateAgentChatBody({ mode: "coach", messages, items: [] });
    expect(result.ok).toBe(false);
  });

  it("validation:rejects-overlong-content", () => {
    const result = validateAgentChatBody({
      mode: "coach",
      messages: [{ role: "user", content: "x".repeat(100_001) }],
      items: [],
    });
    expect(result.ok).toBe(false);
  });
});
