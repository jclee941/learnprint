# server/ — BFF (node:http)

Dependency-free Backends-for-Frontend on `node:http`. Serves built `dist/` statically and proxies AI agent chat as SSE to an OpenAI-compatible LLM (cliproxy). Entry: `index.ts`.

## ROUTES (index.ts)

| Method | Path | Handler |
|--------|------|---------|
| GET | `/healthz` | inline → `{"status":"ok"}` |
| POST | `/api/agent/chat` | validate → `agent-handler.ts` → SSE stream |
| GET | `*` | `static.ts` serves `dist/` |

## MODULES

```
index.ts          # server bootstrap + routing
agent-handler.ts  # builds prompt, calls cliproxy, streams SSE chunks
cliproxy.ts       # OpenAI-compatible LLM client (SSE)
prompt.ts         # system/user prompt construction
validation.ts     # validateAgentChatBody — request body validation
read-body.ts      # readBody + BodyTooLargeError (413 guard)
env.ts            # loadLlmConfig — LLM_BASE_URL/KEY/MODEL from process.env
dotenv.ts         # loadDotEnv — reads .env at startup (no override)
static.ts         # static file serving from dist/
types.ts          # LlmConfig and server types
```

## CONVENTIONS

- Strictly **stdlib only** — no express/fastify/dotenv packages. Adding a dep here is wrong.
- Validate + read body BEFORE writing SSE headers, so errors return JSON 4xx (see `index.ts` ordering: 503 config → 413/400 body → 400 validation → 200 SSE).
- Error responses are generic Korean messages; never leak internal error details to the client.
- Compiled by `tsconfig.server.json`, which **excludes `*.test.ts`**. Tests colocated, run via root `vitest`.
- Port from `PORT` env (default 4173); secrets from `.env` (gitignored).

## ANTI-PATTERNS

- Do NOT add framework dependencies.
- Do NOT expose `LLM_API_KEY` or upstream error details to the browser.
- Do NOT write SSE headers before request validation completes.
