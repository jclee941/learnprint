import { inflateRawSync } from "node:zlib";
import {
  isTextPath,
  maxZipEntryScanBytes,
  scanFileContent,
  scanPathForSecretExclusions,
} from "./submission-scanner.mjs";

function findEndOfCentralDirectory(buffer) {
  if (buffer.length < 22) return -1;
  const minOffset = Math.max(0, buffer.length - 65557);
  for (let offset = buffer.length - 22; offset >= minOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  return -1;
}

function readZipEntries(buffer, archiveDisplayPath, failClosed, addFinding, addWarning) {
  const eocdOffset = findEndOfCentralDirectory(buffer);
  if (eocdOffset < 0) {
    const message = "ZIP 중앙 디렉터리 확인 실패";
    if (failClosed) {
      addFinding(message, archiveDisplayPath);
    } else {
      addWarning(`${archiveDisplayPath}: ${message}로 내부 검사를 건너뜀`);
    }
    return [];
  }

  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  const centralDirectorySize = buffer.readUInt32LE(eocdOffset + 12);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  if (
    entryCount === 0xffff ||
    centralDirectorySize === 0xffffffff ||
    centralDirectoryOffset === 0xffffffff
  ) {
    addFinding("지원하지 않는 ZIP64 구조", archiveDisplayPath);
    return [];
  }

  const entries = [];
  let offset = centralDirectoryOffset;
  const endOffset = centralDirectoryOffset + centralDirectorySize;
  if (centralDirectoryOffset < 0 || endOffset > buffer.length) {
    addFinding("손상된 ZIP 중앙 디렉터리 범위", archiveDisplayPath);
    return entries;
  }

  for (let index = 0; index < entryCount && offset < endOffset; index += 1) {
    if (offset + 46 > buffer.length) {
      addFinding("손상된 ZIP 중앙 디렉터리", `${archiveDisplayPath}#${index + 1}`);
      break;
    }
    if (buffer.readUInt32LE(offset) !== 0x02014b50) {
      addFinding("손상된 ZIP 중앙 디렉터리", `${archiveDisplayPath}#${index + 1}`);
      break;
    }

    const flags = buffer.readUInt16LE(offset + 8);
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const nameStart = offset + 46;
    const entryName = buffer.subarray(nameStart, nameStart + nameLength).toString("utf8");

    entries.push({
      name: entryName,
      flags,
      method,
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
    });

    offset = nameStart + nameLength + extraLength + commentLength;
  }

  if (entries.length !== entryCount) {
    addFinding("ZIP 중앙 디렉터리 항목 수 불일치", archiveDisplayPath);
  }
  if (offset !== endOffset) {
    addFinding("ZIP 중앙 디렉터리 바이트 범위 불일치", archiveDisplayPath);
  }

  return entries;
}

function findUnsafeEntryNameReason(entryName) {
  const normalized = entryName.replaceAll("\\", "/");
  const segments = normalized.split("/");

  if (normalized.startsWith("/")) return "절대 POSIX 경로";
  if (entryName.startsWith("\\") || normalized.startsWith("//")) return "절대 Windows 경로";
  if (/^[A-Za-z]:/.test(entryName)) return "드라이브 문자 경로";
  if (segments.includes("..")) return "상위 경로 이동";
  return undefined;
}

export function inspectZip(buffer, archiveDisplayPath, options) {
  const { addFinding, addWarning, failClosed = false, findingCount, findingCountBefore } = options;
  const entries = readZipEntries(buffer, archiveDisplayPath, failClosed, addFinding, addWarning);
  console.log(`ZIP 검사: ${archiveDisplayPath} (${entries.length}개 항목)`);
  console.log(
    "  방식: 압축 해제 파일을 만들지 않고 중앙 디렉터리, 파일명, 지원 가능한 deflate/store 텍스트 본문을 메모리에서 검사",
  );

  if (failClosed && entries.length === 0 && findingCount() === findingCountBefore) {
    addFinding("필수 소스 ZIP 내부 검사 실패", archiveDisplayPath);
  }

  for (const entry of entries) {
    const entryDisplayPath = `${archiveDisplayPath}!${entry.name}`;
    const unsafeReason = findUnsafeEntryNameReason(entry.name);
    if (unsafeReason) {
      addFinding(`안전하지 않은 ZIP 항목 경로: ${unsafeReason}`, entryDisplayPath);
      continue;
    }

    scanPathForSecretExclusions(entryDisplayPath, addFinding);

    if (entry.name.endsWith("/")) continue;
    if ((entry.flags & 1) === 1) {
      addFinding("암호화된 ZIP 항목", entryDisplayPath);
      continue;
    }
    if (entry.uncompressedSize > maxZipEntryScanBytes) {
      addFinding("ZIP 항목 본문 검사 크기 제한 초과", entryDisplayPath);
      continue;
    }

    scanZipEntryContent(buffer, entry, entryDisplayPath, addFinding);
  }
}

function scanZipEntryContent(buffer, entry, entryDisplayPath, addFinding) {
  if (
    entry.localHeaderOffset < 0 ||
    entry.localHeaderOffset + 30 > buffer.length ||
    buffer.readUInt32LE(entry.localHeaderOffset) !== 0x04034b50
  ) {
    addFinding("손상된 ZIP 로컬 헤더", entryDisplayPath);
    return;
  }

  const localNameLength = buffer.readUInt16LE(entry.localHeaderOffset + 26);
  const localExtraLength = buffer.readUInt16LE(entry.localHeaderOffset + 28);
  const dataStart = entry.localHeaderOffset + 30 + localNameLength + localExtraLength;
  const dataEnd = dataStart + entry.compressedSize;
  if (dataStart < 0 || dataEnd > buffer.length) {
    addFinding("손상된 ZIP 항목 범위", entryDisplayPath);
    return;
  }

  try {
    const compressed = buffer.subarray(dataStart, dataEnd);
    const content = readZipEntryPayload(compressed, entry.method, entryDisplayPath, addFinding);
    if (content) scanFileContent(content, entryDisplayPath, addFinding, isTextPath(entry.name));
  } catch {
    addFinding("ZIP 항목 본문 해제 실패", entryDisplayPath);
  }
}

function readZipEntryPayload(compressed, method, entryDisplayPath, addFinding) {
  if (method === 0) return compressed;
  if (method === 8) return inflateRawSync(compressed);
  addFinding(`지원하지 않는 ZIP 압축 방식 ${method}`, entryDisplayPath);
  return undefined;
}
