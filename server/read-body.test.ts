// @vitest-environment node

import { EventEmitter } from "node:events";
import type { IncomingMessage } from "node:http";
import { describe, expect, it } from "vitest";
import { BodyTooLargeError, readBody } from "./read-body";

type MockIncomingMessage = IncomingMessage & {
  destroyed: boolean;
  paused: boolean;
};

/**
 * A controlled mock of IncomingMessage: an EventEmitter with setEncoding,
 * pause, resume, and destroy spies. Unlike Readable.from(), it never
 * auto-destroys, so we can assert readBody does not destroy the socket.
 */
function makeReq() {
  const emitter = new EventEmitter();
  const req = emitter as unknown as MockIncomingMessage;
  req.destroyed = false;
  req.paused = false;
  req.setEncoding = (() => req) as MockIncomingMessage["setEncoding"];
  req.pause = (() => {
    req.paused = true;
    return req;
  }) as MockIncomingMessage["pause"];
  req.resume = (() => req) as MockIncomingMessage["resume"];
  req.destroy = (() => {
    req.destroyed = true;
    return req;
  }) as MockIncomingMessage["destroy"];
  return { req, emitter };
}

describe("readBody", () => {
  it("read-body:reads-full-body", async () => {
    const { req, emitter } = makeReq();
    const promise = readBody(req);
    emitter.emit("data", '{"mode":');
    emitter.emit("data", '"coach"}');
    emitter.emit("end");
    await expect(promise).resolves.toBe('{"mode":"coach"}');
  });

  it("read-body:rejects-when-over-limit-without-destroying", async () => {
    const { req, emitter } = makeReq();
    const promise = readBody(req, 100);
    const big = "x".repeat(50);
    emitter.emit("data", big);
    emitter.emit("data", big);
    emitter.emit("data", big); // 150 > 100 → overflow

    await expect(promise).rejects.toBeInstanceOf(BodyTooLargeError);
    // readBody must NOT destroy the socket (so a 413 JSON can still be written).
    expect(req.destroyed).toBe(false);
    // It should pause consumption instead.
    expect((req as unknown as { paused: boolean }).paused).toBe(true);
  });

  it("read-body:rejects-on-stream-error", async () => {
    const { req, emitter } = makeReq();
    const promise = readBody(req);
    emitter.emit("error", new Error("socket hangup"));
    await expect(promise).rejects.toThrow("socket hangup");
  });
});
