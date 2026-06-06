// @vitest-environment node

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadDotEnv } from "./dotenv";

describe("loadDotEnv", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "learnprint-dotenv-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("dotenv:loads-vars-from-file-without-overriding-existing", () => {
    const file = join(dir, ".env");
    writeFileSync(file, "LLM_API_KEY=from-file\nLLM_MODEL=model-from-file\n");
    const env: Record<string, string | undefined> = { LLM_MODEL: "preset" };

    loadDotEnv(file, env);

    // missing var is filled from file
    expect(env.LLM_API_KEY).toBe("from-file");
    // already-set var is NOT overridden
    expect(env.LLM_MODEL).toBe("preset");
  });

  it("dotenv:returns-false-and-does-not-throw-when-file-missing", () => {
    const env: Record<string, string | undefined> = {};
    expect(() => loadDotEnv(join(dir, "nope.env"), env)).not.toThrow();
    expect(loadDotEnv(join(dir, "nope.env"), env)).toBe(false);
  });

  it("dotenv:returns-true-when-file-loaded", () => {
    const file = join(dir, ".env");
    writeFileSync(file, "LLM_API_KEY=abc\n");
    const env: Record<string, string | undefined> = {};
    expect(loadDotEnv(file, env)).toBe(true);
    expect(env.LLM_API_KEY).toBe("abc");
  });
});
