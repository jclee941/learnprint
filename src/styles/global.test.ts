import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const cssPath = resolve(process.cwd(), "src/styles/global.css");
const css = readFileSync(cssPath, "utf8");
const expectedImports = [
  "tokens.css",
  "base.css",
  "layout.css",
  "forms-actions.css",
  "agent.css",
  "learning-items.css",
  "resume.css",
  "responsive.css",
  "print.css",
] as const;

const importedStylesheets: string[] = [];

for (const match of css.matchAll(/^@import "\.\/([^"]+\.css)";$/gm)) {
  const fileName = match[1];
  if (fileName === undefined) {
    throw new Error("CSS import 파일명을 읽을 수 없습니다.");
  }
  importedStylesheets.push(fileName);
}

const importedCss = importedStylesheets
  .map((fileName) => readFileSync(resolve(process.cwd(), "src/styles", fileName), "utf8"))
  .join("\n");

const countPureLoc = (source: string): number =>
  source
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith("/*") && !trimmed.startsWith("*") && !trimmed.startsWith("*/");
    }).length;

describe("global.css", () => {
  it("styles:has-explicit-responsibility-import-order", () => {
    expect(importedStylesheets).toEqual(expectedImports);
    expect(css.trim()).toBe(expectedImports.map((fileName) => `@import "./${fileName}";`).join("\n"));
  });

  it("styles:keeps-split-css-under-pure-loc-ceiling", () => {
    expect(countPureLoc(css)).toBeLessThanOrEqual(40);

    for (const fileName of importedStylesheets) {
      const stylesheet = readFileSync(resolve(process.cwd(), "src/styles", fileName), "utf8");
      expect(countPureLoc(stylesheet), `${fileName} pure LOC`).toBeLessThanOrEqual(250);
    }
  });

  it("styles:has-shared-button-link-focus-visible-ring", () => {
    expect(importedCss).toMatch(/button:focus-visible/);
    expect(importedCss).toMatch(/a:focus-visible/);
    expect(importedCss).toMatch(/:focus-visible\s*{[^}]*var\(--focus-ring\)/);
  });
});
