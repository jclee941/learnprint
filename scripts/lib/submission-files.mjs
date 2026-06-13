import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";

export function walkFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }
    if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

export function getGitStatusSummary(repoRoot) {
  try {
    const status = execFileSync("git", ["status", "--short"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (!status) return "clean";
    const count = status.split("\n").filter(Boolean).length;
    return `변경 ${count}건 감지됨(패키지 검증 실패 사유 아님)`;
  } catch {
    return "git 상태 확인 실패(패키지 검증 실패 사유 아님)";
  }
}
