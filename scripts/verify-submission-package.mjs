#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { getGitStatusSummary, walkFiles } from "./lib/submission-files.mjs";
import {
  formatBytes,
  maxArtifactBytes,
  requiredFiles,
  requiredSourceZip,
  scanFileContent,
  scanPathForSecretExclusions,
  sha256,
  toPosix,
} from "./lib/submission-scanner.mjs";
import { inspectZip } from "./lib/zip-inspector.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const finalDir = process.env.SUBMISSION_FINAL_DIR
  ? path.resolve(process.env.SUBMISSION_FINAL_DIR)
  : path.join(repoRoot, "docs/submission/final");

const findings = [];
const warnings = [];
const inventory = [];

function addFinding(type, target) {
  findings.push({ type, target });
}

function addWarning(message) {
  warnings.push(message);
}

function main() {
  console.log("learnprint 최종 제출 패키지 무결성 검증");
  console.log(`검증 시각: ${new Date().toISOString()}`);
  console.log(`대상 경로: ${finalDir}`);
  console.log(`작업 트리 상태: ${getGitStatusSummary(repoRoot)}`);
  console.log("");

  if (!existsSync(finalDir)) {
    console.error(`오류: 최종 제출 폴더가 없습니다: ${finalDir}`);
    process.exit(1);
  }

  const finalStat = statSync(finalDir);
  if (!finalStat.isDirectory()) {
    console.error(`오류: 최종 제출 경로가 폴더가 아닙니다: ${finalDir}`);
    process.exit(1);
  }

  const existingRelativeFiles = walkFiles(finalDir)
    .map((file) => toPosix(path.relative(finalDir, file)))
    .sort((a, b) => a.localeCompare(b, "ko"));
  const existingSet = new Set(existingRelativeFiles);

  for (const requiredFile of requiredFiles) {
    if (!existingSet.has(requiredFile)) {
      addFinding("필수 제출 파일 누락", requiredFile);
    }
  }

  let totalBytes = 0;
  for (const relativeFile of existingRelativeFiles) {
    const fullPath = path.join(finalDir, relativeFile);
    const buffer = readFileSync(fullPath);
    const size = buffer.length;
    totalBytes += size;
    inventory.push({ relativeFile, size, hash: sha256(buffer) });

    scanPathForSecretExclusions(relativeFile, addFinding);
    if (size > maxArtifactBytes) {
      addFinding("50MB 초과 파일", relativeFile);
    }

    const lowerRelativeFile = relativeFile.toLowerCase();
    if (lowerRelativeFile.endsWith(".zip") || lowerRelativeFile.endsWith(".docx")) {
      inspectZip(buffer, relativeFile, {
        addFinding,
        addWarning,
        failClosed: requiredFiles.includes(relativeFile),
        findingCount: () => findings.length,
        findingCountBefore: findings.length,
      });
    } else {
      scanFileContent(buffer, relativeFile, addFinding);
    }
  }

  if (totalBytes > maxArtifactBytes) {
    addFinding("50MB 초과 제출 폴더 합계", "docs/submission/final");
  }

  console.log("");
  console.log("최종 제출 파일 인벤토리");
  for (const item of inventory) {
    const requiredMark = requiredFiles.includes(item.relativeFile) ? "필수" : "추가";
    console.log(`- [${requiredMark}] ${item.relativeFile}`);
    console.log(`  size=${formatBytes(item.size)}`);
    console.log(`  sha256=${item.hash}`);
  }
  console.log(`합계 size=${formatBytes(totalBytes)} / 제한=50.00 MB`);
  console.log("");

  if (warnings.length > 0) {
    console.log("주의");
    for (const warning of warnings) console.log(`- ${warning}`);
    console.log("");
  }

  if (findings.length > 0) {
    console.log("검증 결과: FAIL");
    for (const finding of findings) {
      console.log(`- ${finding.type}: ${finding.target}`);
    }
    process.exit(1);
  }

  console.log("비밀 제외 검사: PASS - dotenv 파일, node_modules, .git, 개인키, API 키 의심값 없음");
  console.log("검증 결과: PASS");
}

main();
