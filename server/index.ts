import { createServer } from "node:http";
import { join } from "node:path";
import { loadDotEnv } from "./dotenv";
import { handleAgentChat } from "./agent-handler";
import { loadLlmConfig } from "./env";
import { serveStatic } from "./static";
import type { AgentChatBody, LlmConfig } from "./types";

// Load server-side secrets from .env at startup (does not override existing
// env vars), so `npm run serve` works after `cp .env.example .env`.
loadDotEnv(join(process.cwd(), ".env"));

function readBody(req: Parameters<typeof handleRequest>[0]): Promise<string> {
  return new Promise((resolveBody, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk: string) => {
      body += chunk;
    });
    req.on("end", () => resolveBody(body));
    req.on("error", reject);
  });
}

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

    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    try {
      const body = JSON.parse(await readBody(req)) as AgentChatBody;
      await handleAgentChat(body, config, (chunk) => res.write(chunk));
    } catch (error) {
      const message = error instanceof Error ? error.message : "처리 중 오류가 발생했습니다.";
      res.write(`data: ${JSON.stringify({ error: message, done: true })}\n\n`);
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
  console.log(`learnprint BFF listening on http://localhost:${port} (LLM_MODEL=${process.env.LLM_MODEL ?? "gemini-3-flash"})`);
});
