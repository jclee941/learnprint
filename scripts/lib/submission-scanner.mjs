import { createHash } from "node:crypto";
import path from "node:path";

export const bytesPerMb = 1024 * 1024;
export const maxArtifactBytes = 50 * bytesPerMb;
export const maxZipEntryScanBytes = 12 * bytesPerMb;
export const requiredSourceZip = "evidence/03_소스코드.zip";

export const requiredFiles = [
  "00_제출안내.md",
  "01_참가신청서_AI증빙_이재철.docx",
  "02_사례보고서_이재철.docx",
  "02_사례보고서_이재철.pdf",
  "evidence/03_소스코드.zip",
  "evidence/04_실행화면캡처.zip",
  "evidence/05_시연영상.mp4",
  "evidence/06_빌드테스트로그.txt",
  "evidence/07_이력서샘플.json",
  "evidence/07_이력서샘플.md",
];

const textExtensions = new Set([
  ".css",
  ".csv",
  ".env",
  ".example",
  ".gitignore",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".svg",
  ".ts",
  ".tsx",
  ".txt",
  ".xml",
  ".yml",
  ".yaml",
]);

const allowedDotenvTemplates = new Set([".env.example", ".env.sample", ".env.template"]);

export function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

export function formatBytes(bytes) {
  return `${bytes} bytes (${(bytes / bytesPerMb).toFixed(2)} MB)`;
}

export function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export function isTextPath(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".env.example")) return true;
  return textExtensions.has(path.extname(lower));
}

function looksTextual(buffer) {
  if (buffer.length === 0) return true;
  const sample = buffer.subarray(0, Math.min(buffer.length, 4096));
  let control = 0;
  for (const byte of sample) {
    if (byte === 0) return false;
    if (byte < 8 || (byte > 13 && byte < 32)) control += 1;
  }
  return control / sample.length < 0.02;
}

export function scanPathForSecretExclusions(displayPath, addFinding) {
  const normalized = displayPath.replaceAll("\\", "/").replaceAll("!", "/");
  const segments = normalized.split("/").filter(Boolean);
  const basename = segments.at(-1)?.toLowerCase() ?? "";
  const lowerSegments = segments.map((segment) => segment.toLowerCase());

  if (lowerSegments.includes("node_modules")) {
    addFinding("금지 경로: node_modules", displayPath);
  }
  if (lowerSegments.includes(".git")) {
    addFinding("금지 경로: .git", displayPath);
  }
  if (basename.startsWith(".env") && !allowedDotenvTemplates.has(basename)) {
    addFinding("금지 경로: dotenv 파일", displayPath);
  }
  if (
    ["id_rsa", "id_dsa", "id_ecdsa", "id_ed25519", "private_key", "private-key"].includes(
      basename,
    ) ||
    basename.endsWith(".pem") ||
    basename.endsWith(".p12") ||
    basename.endsWith(".pfx") ||
    basename.endsWith(".key") ||
    basename.endsWith(".private-key") ||
    basename.endsWith(".private.key") ||
    basename === "private.key"
  ) {
    addFinding("금지 경로: 개인키 파일명", displayPath);
  }
}

function scanTextForSecretValues(text, displayPath, addFinding) {
  const checks = [
    ["개인키 블록", /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/],
    ["OpenAI 계열 API 키", /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/],
    ["Google API 키", /\bAIza[0-9A-Za-z_-]{35}\b/],
    ["GitHub 토큰", /\bgh[pousr]_[A-Za-z0-9_]{36,}\b/],
    ["Slack 토큰", /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/],
    [
      "API 키 환경변수 값",
      /\b(?:OPENAI_API_KEY|LLM_API_KEY|API_KEY|ACCESS_TOKEN|SECRET|PASSWORD)\b\s*[:=]\s*["']?(?!(?:replace-with|YOUR_|example|dummy|test|changeme|placeholder|<|$))[A-Za-z0-9_./+=-]{24,}/i,
    ],
  ];

  for (const [type, pattern] of checks) {
    if (pattern.test(text)) {
      addFinding(`비밀값 의심: ${type}`, displayPath);
    }
  }
}

export function scanFileContent(buffer, displayPath, addFinding, forceText = false) {
  if (!forceText && !isTextPath(displayPath) && !looksTextual(buffer)) return;
  const text = buffer.toString("utf8");
  scanTextForSecretValues(text, displayPath, addFinding);
}
