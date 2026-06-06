import { afterEach, describe, expect, it, vi } from "vitest";

import { createId } from "./id";

describe("createId", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("id:returns-unique-non-empty-strings", () => {
    const a = createId();
    const b = createId();

    expect(typeof a).toBe("string");
    expect(a.length).toBeGreaterThan(0);
    expect(a).not.toBe(b);
  });

  it("id:works-without-crypto-randomUUID-insecure-context", () => {
    // Simulate a non-secure origin (e.g. http://192.168.x.x) where
    // crypto.randomUUID is undefined — must NOT throw and must return a unique id.
    vi.stubGlobal("crypto", {} as Crypto);

    const a = createId();
    const b = createId();

    expect(typeof a).toBe("string");
    expect(a.length).toBeGreaterThan(0);
    expect(a).not.toBe(b);
  });

  it("id:uses-crypto-randomUUID-when-available", () => {
    const fake = "11111111-2222-3333-4444-555555555555";
    vi.stubGlobal("crypto", { randomUUID: () => fake } as unknown as Crypto);

    expect(createId()).toBe(fake);
  });
});
