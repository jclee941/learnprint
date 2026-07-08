import { createServer } from "node:http";
import { join } from "node:path";
import { loadDotEnv } from "./dotenv";
import { handleAgentChat } from "./agent-handler";
import { loadLlmConfig } from "./env";
import { serveStatic } from "./static";
import { BodyTooLargeError, readBody } from "./read-body";
import { validateAgentChatBody } from "./validation";
import type { LlmConfig } from "./types";

// Load server-side secrets from .env at startup (does not override existing
// env vars), so `npm run serve` works after `cp .env.example .env`.
loadDotEnv(join(process.cwd(), ".env"));


async function handleRequest(
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
): Promise<void> {
  const url = new URL(req.url ?? "/", "http://localhost");

  if (req.method === "GET" && url.pathname === "/healthz") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/agent/chat") {
    let config: LlmConfig;
    try {
      config = loadLlmConfig(process.env);
    } catch (error) {
      const message = error instanceof Error ? error.message : "설정 오류가 발생했습니다.";
      res.writeHead(503, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: message }));
      return;
    }

    // 요청 본문을 읽고 검증한다 — SSE 헤더를 보내기 전에 400을 낼 수 있도록.
    let rawBody: string;
    try {
      rawBody = await readBody(req);
    } catch (error) {
      const tooLarge = error instanceof BodyTooLargeError;
      res.writeHead(tooLarge ? 413 : 400, {
        "Content-Type": "application/json; charset=utf-8",
      });
      res.end(
        JSON.stringify({
          error: tooLarge ? "요청 본문이 너무 큽니다." : "요청을 읽을 수 없습니다.",
        }),
      );
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "잘못된 JSON 형식입니다." }));
      return;
    }

    const validation = validateAgentChatBody(parsed);
    if (!validation.ok) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: validation.error }));
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    try {
      await handleAgentChat(validation.body, config, (chunk) => res.write(chunk));
    } catch {
      // 내부 오류 세부정보는 클라이언트에 노출하지 않고 일반 메시지만 전달한다.
      res.write(
        `data: ${JSON.stringify({ error: "AI 응답 처리 중 오류가 발생했습니다.", done: true })}\n\n`,
      );
    } finally {
      res.end();
    }
    return;
  }

  if (req.method === "GET") {
    serveStatic(req, res, join(process.cwd(), "dist"));
    return;
  }

  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Method not allowed");
}

const server = createServer((req, res) => {
  void handleRequest(req, res);
});

const port = Number(process.env.PORT ?? 4173);
server.listen(port, () => {
  console.log(`learnprint BFF listening on http://localhost:${port} (LLM_MODEL=${process.env.LLM_MODEL ?? "gemini-3-flash-agent"})`);
});
