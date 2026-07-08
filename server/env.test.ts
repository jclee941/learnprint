// @vitest-environment node

import { describe, expect, it } from "vitest";
import { loadLlmConfig } from "./env";

describe("loadLlmConfig", () => {
  it("env:loads-config-from-process-env", () => {
    expect(
      loadLlmConfig({
        LLM_BASE_URL: "http://x/v1",
        LLM_API_KEY: "sk-test",
        LLM_MODEL: "m",
      }),
    ).toEqual({ baseUrl: "http://x/v1", apiKey: "sk-test", model: "m" });
  });

  it("env:defaults-model-to-gemini-3-flash-agent", () => {
    expect(
      loadLlmConfig({
        LLM_BASE_URL: "http://x/v1",
        LLM_API_KEY: "sk-test",
      }).model,
    ).toBe("gemini-3-flash-agent");
  });

  it("env:throws-when-missing-api-key", () => {
    expect(() =>
      loadLlmConfig({
        LLM_BASE_URL: "http://x/v1",
      }),
    ).toThrow();
  });
});
