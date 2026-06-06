import type { IncomingMessage } from "node:http";

export const MAX_BODY_BYTES = 1_000_000; // 1MB request-body limit

export class BodyTooLargeError extends Error {}

/**
 * Read a request body as a UTF-8 string with a hard byte cap.
 *
 * On overflow it rejects with BodyTooLargeError and stops accumulating, but
 * does NOT destroy the socket — so the caller can still write a 413 JSON
 * response before ending. The incoming stream is paused/resumed to drain so
 * the response can be flushed cleanly.
 */
export function readBody(
  req: IncomingMessage,
  maxBytes: number = MAX_BODY_BYTES,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    let bytes = 0;
    let settled = false;

    req.setEncoding("utf8");

    const onData = (chunk: string): void => {
      if (settled) return;
      bytes += Buffer.byteLength(chunk, "utf8");
      if (bytes > maxBytes) {
        settled = true;
        cleanup();
        // Stop consuming further body data. Do NOT destroy the socket so the
        // caller can still write a 413 JSON response and end it cleanly.
        req.pause();
        reject(new BodyTooLargeError("요청 본문이 너무 큽니다."));
        return;
      }
      body += chunk;
    };

    const onEnd = (): void => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(body);
    };

    const onError = (error: Error): void => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    function cleanup(): void {
      req.off("data", onData);
      req.off("end", onEnd);
      req.off("error", onError);
    }

    req.on("data", onData);
    req.on("end", onEnd);
    req.on("error", onError);
  });
}
