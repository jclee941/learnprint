// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

async function loadConfig() {
  // vite.config exports the result of defineConfig (an object or factory).
  vi.resetModules();
  const mod = await import("./vite.config");
  const exported = mod.default as unknown;
  return typeof exported === "function"
    ? (exported as (env: unknown) => { base?: string })({
        command: "build",
        mode: "production",
      })
    : (exported as { base?: string });
}

describe("vite.config base", () => {
  afterEach(() => {
    delete process.env.VITE_BASE;
    vi.unstubAllEnvs();
  });

  it("vite-config:defaults-base-to-root", async () => {
    delete process.env.VITE_BASE;
    const config = await loadConfig();
    expect(config.base).toBe("/");
  });

  it("vite-config:uses-VITE_BASE-when-set", async () => {
    process.env.VITE_BASE = "/learnprint/";
    const config = await loadConfig();
    expect(config.base).toBe("/learnprint/");
  });
});
