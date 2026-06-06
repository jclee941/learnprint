// @vitest-environment node

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Writable } from "node:stream";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { serveStatic } from "./static";

interface CapturedResponse {
  readonly statusCode: number | null;
  readonly headers: Record<string, string> | null;
  body: () => string;
  done: Promise<void>;
  res: ServerResponse;
}

function makeReq(url: string): IncomingMessage {
  return { url } as IncomingMessage;
}

function makeRes(): CapturedResponse {
  let statusCode: number | null = null;
  let headers: Record<string, string> | null = null;
  const chunks: Buffer[] = [];
  let resolveDone!: () => void;
  const done = new Promise<void>((r) => {
    resolveDone = r;
  });

  // A real Writable so ReadStream.pipe(res) completes deterministically.
  const sink = new Writable({
    write(chunk: Buffer, _enc, cb) {
      chunks.push(Buffer.from(chunk));
      cb();
    },
  });
  const res = sink as unknown as ServerResponse & Writable;
  res.writeHead = ((status: number, h?: Record<string, string>) => {
    statusCode = status;
    headers = h ?? null;
    return res;
  }) as ServerResponse["writeHead"];
  const originalEnd = sink.end.bind(sink);
  res.end = ((chunk?: string) => {
    if (typeof chunk === "string") chunks.push(Buffer.from(chunk));
    originalEnd();
    return res;
  }) as ServerResponse["end"];
  sink.on("finish", () => resolveDone());

  return {
    get statusCode() {
      return statusCode;
    },
    get headers() {
      return headers;
    },
    body: () => Buffer.concat(chunks).toString("utf8"),
    done,
    res,
  };
}

describe("serveStatic", () => {
  let dist: string;

  beforeEach(() => {
    dist = mkdtempSync(join(tmpdir(), "learnprint-static-"));
    writeFileSync(join(dist, "index.html"), "<!doctype html><title>app</title>");
    writeFileSync(join(dist, "app.js"), "console.log(1)");
  });

  afterEach(() => {
    rmSync(dist, { recursive: true, force: true });
  });

  it("static:malformed-uri-falls-back-to-index", async () => {
    // %E0%A4%A is an invalid UTF-8 percent-escape; decodeURIComponent throws.
    const captured = makeRes();
    expect(() => serveStatic(makeReq("/%E0%A4%A"), captured.res, dist)).not.toThrow();
    await captured.done;
    expect(captured.statusCode).toBe(200);
    expect(captured.headers?.["Content-Type"]).toContain("text/html");
    expect(captured.body()).toContain("<!doctype html>");
  });

  it("static:rejects-relative-path-escape", async () => {
    // A sibling secret next to (but outside) dist must never be served.
    const secret = join(dist, "..", "learnprint-static-secret.txt");
    writeFileSync(secret, "TOP SECRET");
    try {
      const captured = makeRes();
      expect(() =>
        serveStatic(makeReq("/../learnprint-static-secret.txt"), captured.res, dist),
      ).not.toThrow();
      await captured.done;
      expect(captured.statusCode).toBe(200);
      expect(captured.headers?.["Content-Type"]).toContain("text/html");
      expect(captured.body()).not.toContain("TOP SECRET");
    } finally {
      rmSync(secret, { force: true });
    }
  });

  it("static:serves-existing-asset", async () => {
    const captured = makeRes();
    serveStatic(makeReq("/app.js"), captured.res, dist);
    await captured.done;
    expect(captured.statusCode).toBe(200);
    expect(captured.headers?.["Content-Type"]).toContain("javascript");
    expect(captured.body()).toContain("console.log(1)");
  });
});
