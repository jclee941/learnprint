#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const docsLogPath = path.join(
  repoRoot,
  "docs/submission/final/evidence/06_빌드테스트로그.txt",
);
const evidenceSessionId =
  process.env.ULW_LOOP_SESSION_ID?.trim() ||
  process.env.OMO_ULW_LOOP_SESSION_ID?.trim() ||
  "current-readiness";
const evidenceLogPath = path.join(
  repoRoot,
  ".omo/ulw-loop",
  evidenceSessionId,
  "evidence/C001-readiness-generator.log",
);
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const phaseTimeoutMs = 180_000;

const commandPhases = [
  { title: "npm test", command: npmCommand, args: ["test"] },
  { title: "npm run typecheck", command: npmCommand, args: ["run", "typecheck"] },
  { title: "npm run build", command: npmCommand, args: ["run", "build"] },
];

const lines = [];

const append = (line = "") => {
  lines.push(line);
  process.stdout.write(`${line}\n`);
};

const runMetadataCommand = (command, args) =>
  new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const chunks = [];
    const errorChunks = [];

    child.stdout.on("data", (chunk) => chunks.push(chunk));
    child.stderr.on("data", (chunk) => errorChunks.push(chunk));
    child.on("error", (error) => {
      resolve(`확인 실패: ${error.message}`);
    });
    child.on("close", (code) => {
      const output = Buffer.concat(chunks).toString("utf8").trim();
      const errorOutput = Buffer.concat(errorChunks).toString("utf8").trim();
      if (code === 0) {
        resolve(output || "(출력 없음)");
        return;
      }
      resolve(`확인 실패(exit ${code}): ${errorOutput || output || "(출력 없음)"}`);
    });
  });

const runPhase = (phase) =>
  new Promise((resolve) => {
    append("");
    append(`## ${phase.title}`);
    append(`시작: ${formatKst(new Date())}`);
    append(`명령: ${phase.title}`);
    append(`타임아웃: ${phaseTimeoutMs / 1000}초`);

    const startedAt = Date.now();
    let timedOut = false;
    const child = spawn(phase.command, phase.args, {
      cwd: repoRoot,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, phaseTimeoutMs);

    child.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
      lines.push(...chunk.toString("utf8").replace(/\r\n/g, "\n").split("\n").filter(Boolean));
    });

    child.stderr.on("data", (chunk) => {
      process.stderr.write(chunk);
      lines.push(...chunk.toString("utf8").replace(/\r\n/g, "\n").split("\n").filter(Boolean));
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      append(`결과: 실패`);
      append(`exitCode: spawn-error`);
      append(`오류: ${error.message}`);
      resolve({ title: phase.title, ok: false, code: "spawn-error", timedOut, durationMs: Date.now() - startedAt });
    });

    child.on("close", (code, signal) => {
      clearTimeout(timeout);
      const durationMs = Date.now() - startedAt;
      const ok = code === 0 && !timedOut;
      append(`종료: ${formatKst(new Date())}`);
      append(`소요: ${durationMs}ms`);
      append(`exitCode: ${code ?? "null"}`);
      if (signal) {
        append(`signal: ${signal}`);
      }
      append(`결과: ${ok ? "통과" : timedOut ? "실패(타임아웃)" : "실패"}`);
      resolve({ title: phase.title, ok, code, signal, timedOut, durationMs });
    });
  });

const formatKst = (date) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);

const isGeneratedLog = (filePath) => filePath === docsLogPath || filePath === evidenceLogPath;

const collectFiles = async (root, label) => {
  try {
    const rootStat = await stat(root);
    if (rootStat.isFile()) {
      if (isGeneratedLog(root)) {
        return [];
      }
      return [{ label, filePath: root, size: rootStat.size }];
    }
    if (!rootStat.isDirectory()) {
      return [];
    }
  } catch {
    return [];
  }

  const results = [];
  const walk = async (dir) => {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }
      if (isGeneratedLog(entryPath)) {
        continue;
      }
      const entryStat = await stat(entryPath);
      results.push({ label, filePath: entryPath, size: entryStat.size });
    }
  };
  await walk(root);
  return results;
};

const formatBytes = (bytes) => `${bytes} bytes (${(bytes / 1024).toFixed(2)} KiB)`;

const stripAnsi = (value) => value.replace(/\u001b\[[0-9;]*m/g, "");

const parsePassedTestCount = () => {
  for (const line of lines) {
    const match = stripAnsi(line).match(/^\s*Tests\s+(\d+)\s+passed\s+\(\d+\)\s*$/);
    if (match) {
      return Number.parseInt(match[1], 10);
    }
  }
  return null;
};

const appendFileSizes = async () => {
  const fileGroups = [
    await collectFiles(path.join(repoRoot, "docs/submission/final"), "final-package"),
    await collectFiles(
      path.join(repoRoot, "docs/submission/learnprint-final-submission-20260612.zip"),
      "submission-zip",
    ),
    await collectFiles(path.join(repoRoot, "dist"), "build-output"),
  ];
  const files = fileGroups.flat().sort((left, right) => left.filePath.localeCompare(right.filePath));

  append("");
  append("## 파일 크기");
  if (files.length === 0) {
    append("사용 가능한 final-package/build 파일이 없습니다.");
    return;
  }
  for (const file of files) {
    append(`- [${file.label}] ${path.relative(repoRoot, file.filePath)}: ${formatBytes(file.size)}`);
  }
  append(`- [generated-log] ${path.relative(repoRoot, docsLogPath)}: 현재 실행에서 생성 중이므로 stale 크기 방지를 위해 목록에서 제외했습니다.`);
};

const writeLogs = async () => {
  const content = `${lines.join("\n")}\n`;
  await mkdir(path.dirname(docsLogPath), { recursive: true });
  await mkdir(path.dirname(evidenceLogPath), { recursive: true });
  await writeFile(docsLogPath, content, "utf8");
  await writeFile(evidenceLogPath, content, "utf8");
};

append("# 최종 제출본 readiness 검증 로그");
append(`생성(KST): ${formatKst(new Date())}`);
append(`생성(ISO): ${new Date().toISOString()}`);
append("");
append("## 환경");
append(`Node: ${process.version}`);
append(`npm: ${await runMetadataCommand(npmCommand, ["--version"])}`);
append(`git commit: ${await runMetadataCommand("git", ["rev-parse", "HEAD"])}`);
append(`git commit short: ${await runMetadataCommand("git", ["rev-parse", "--short", "HEAD"])}`);
append("");
append("## git status --short (before)");
append((await runMetadataCommand("git", ["status", "--short"])) || "(clean)");

const phaseResults = [];
for (const phase of commandPhases) {
  phaseResults.push(await runPhase(phase));
}

await appendFileSizes();

await writeLogs();

append("");
append("## git status --short (after)");
append((await runMetadataCommand("git", ["status", "--short"])) || "(clean)");

const passedTestCount = parsePassedTestCount();

append("");
append("## 명령 결과 요약");
if (passedTestCount === null) {
  append("- Todo 1 테스트 결과: npm test 원문 출력의 Tests 라인을 기준으로 확인합니다. 파싱 가능한 passed 총계가 없으면 stale count를 출력하지 않습니다.");
} else {
  append(`- Todo 1 테스트 결과: ${passedTestCount} passed (npm test 출력에서 파싱한 실제 Tests 총계)`);
}
for (const result of phaseResults) {
  append(
    `- ${result.title}: ${result.ok ? "통과" : "실패"} (exitCode=${result.code ?? "null"}, durationMs=${result.durationMs})`,
  );
}

append("");
append("## Adversarial QA 메모");
append("- stale_state: timestamp, git commit, Node/npm version을 기록하고 테스트 통과 수는 npm test 출력에서 파싱해 stale hard-code를 방지합니다.");
append("- misleading_success_output: 각 하위 명령 exitCode를 기록하고 하나라도 실패하면 전체 스크립트를 실패 처리하며, 테스트 총계는 실제 출력에서 파싱된 값만 요약에 표시합니다.");
append("- hung_or_long_commands: 각 하위 명령에 180초 타임아웃과 단계별 시작/종료 로그를 적용했습니다.");
append("- dirty_worktree: git status --short를 before/after로 기록하며 dirty 상태만으로 실패하지 않습니다.");
append("- secrets: .env 또는 환경 변수 값을 출력하지 않고 명령/버전/파일 크기만 기록합니다.");
append("- browser_ui: CLI readiness generator 작업이므로 해당 없음.");
append("- http_api: HTTP 엔드포인트 변경이 없으므로 해당 없음.");
append("- db_migration: 데이터베이스가 없는 로컬 검증 스크립트이므로 해당 없음.");
append("- auth_permissions: 인증/권한 경계를 변경하지 않으므로 해당 없음.");
append("- external_integration: 외부 네트워크/API 호출 없이 로컬 npm/git 명령만 사용하므로 해당 없음.");

const failed = phaseResults.filter((result) => !result.ok);
append("");
append(`최종 결과: ${failed.length === 0 ? "통과" : "실패"}`);

await writeLogs();
append(`로그 저장: ${path.relative(repoRoot, docsLogPath)}`);
append(`로그 저장: ${path.relative(repoRoot, evidenceLogPath)}`);
await writeLogs();

if (failed.length > 0) {
  process.exitCode = 1;
}
