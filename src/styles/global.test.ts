import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const cssPath = resolve(process.cwd(), "src/styles/global.css");
const css = readFileSync(cssPath, "utf8");

describe("global.css", () => {
  it("styles:has-shared-button-link-focus-visible-ring", () => {
    // Keyboard users must get a visible focus indicator on buttons and links.
    expect(css).toMatch(/button:focus-visible/);
    expect(css).toMatch(/a:focus-visible/);
    // The focus indicator should use the existing focus-ring token (no naked outline:none).
    expect(css).toMatch(/:focus-visible\s*{[^}]*var\(--focus-ring\)/);
  });
});
