# PROJECT KNOWLEDGE BASE

**Generated:** 2026-06-10 · **Commit:** 05978e4 · **Branch:** master

## OVERVIEW

learnprint (HYCU 학습 이력서) — web app that reconstructs scattered learning records into a competency/evidence-based resume via a **deterministic rule engine**. React 19 + Vite 6 + TypeScript (strict). Optional AI coaching layer via a `node:http` BFF that proxies SSE to an OpenAI-compatible LLM.

## STRUCTURE

```
src/        # React frontend (feature-sliced) — see src/AGENTS.md
server/     # node:http BFF, AI SSE proxy — see server/AGENTS.md
scripts/    # empty (.gitkeep)
docs/       # case report + frozen submission archive (docs/submission/)
public/     # static assets
dist/       # build output (gitignored conceptually; do not edit)
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Competency classification logic | `src/lib/ai/analyzer.ts` (core, deterministic) |
| HYCU seed data | `src/data/hycu-seed.ts` + `.json` |
| Resume export (MD/JSON/evidence ledger) | `src/features/resume/exporters.ts` |
| AI agent SSE endpoint | `server/agent-handler.ts`, `server/index.ts` |
| LLM config / secrets loading | `server/env.ts`, `server/dotenv.ts` |
| Shared type contracts | `src/types/{learning,resume,agent}.ts` |

## CONVENTIONS (deviations only)

- **Three tsconfigs**: `tsconfig.app.json` (frontend, `src/`), `tsconfig.server.json` (`server/`, excludes `*.test.ts`), `tsconfig.node.json`. `typecheck` runs both app and server. `noUnusedLocals`/`noUnusedParameters` are on — dead code fails typecheck.
- **Tests colocated**: `*.test.ts(x)` next to source (Vitest, jsdom). No separate test dir except `src/test/setup.ts`.
- **No runtime deps beyond React** — rule engine and BFF use only stdlib (`node:http`, no express). Keep it that way.
- **Korean** for user-facing strings, comments, and error messages.
- `VITE_BASE` env controls asset base path (`/` for BFF/dev, `/<repo>/` for GitHub Pages).

## ANTI-PATTERNS

- Do NOT make `analyzer.ts` non-deterministic — same input must always yield same output (see `src/AGENTS.md`).
- Do NOT add server frameworks (express/fastify) — BFF is intentionally `node:http` only.
- Do NOT leak LLM secrets to the browser — keys live server-side in `.env` (gitignored); only `.env.example` is committed.
- Do NOT edit `dist/`.

## COMMANDS

```bash
npm run dev                    # Vite dev server (HMR); /api proxied to BFF :4173
npm run build && npm run serve # build + static serve + AI BFF (:4173)
npm test                       # vitest run
npm run typecheck              # tsc --noEmit (app) + tsconfig.server.json
```

## NOTES

- CI (`.github/workflows/ci.yml`): typecheck → test → build on Node 22, pushes/PRs to `master`.
- Deploy (`deploy-pages.yml`): GitHub Pages with `VITE_BASE=/<repo>/` + SPA 404 fallback.
- Data persists only in browser `localStorage`; no backend DB.
