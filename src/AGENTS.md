# src/ — React Frontend

Feature-sliced React 19 app. Entry: `main.tsx` -> `App.tsx` (integrates input, analysis, resume output, optional AI agent).

## STRUCTURE

```
data/       # HYCU course seed (hycu-seed.json + .ts loader); auto-injected on first run
features/
  analysis/ # LearningItemForm, LearningItemList, AnalysisPanel
  resume/   # ResumeView, ExportControls, exporters.ts (MD/JSON/evidence ledger)
  agent/    # AgentPanel (optional AI coaching UI)
hooks/      # useLearningItems.ts — state + localStorage sync
lib/
  ai/       # analyzer.ts — CORE deterministic competency engine
  agent/    # client.ts (SSE consumer) + context.ts (LLM context builder)
  storage/  # localStorage wrapper; first-run seed detection
  id.ts     # id generation
types/      # learning.ts, resume.ts, agent.ts — shared contracts
styles/     # global.css imports split CSS modules; print.css owns @media print
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add/change competency keywords or scoring | `lib/ai/analyzer.ts` (`COMPETENCY_CATALOG`) |
| Change resume export format | `features/resume/exporters.ts` |
| Change final output/readiness summary | `features/resume/finalOutputSummary.ts` |
| Change optional AI panel behavior | `features/agent/AgentPanel.tsx`, `lib/agent/client.ts` |
| Persisted state shape | `hooks/useLearningItems.ts` + `lib/storage/` |
| Print layout | `styles/print.css` |
| Visual tokens / CSS module order | `styles/tokens.css`, `styles/global.css` |

## CONVENTIONS

- `features/resume` and `features/agent` have barrels; `features/analysis` currently imports components directly.
- Component files `PascalCase.tsx`; lib/hooks `camelCase.ts`. Tests colocated as `*.test.ts` or `*.test.tsx`.
- Types imported with `import type` (verbatim module syntax under strict).
- CSS is split by concern and imported only through `styles/global.css`; keep token definitions in `tokens.css`.
- User-visible text is Korean except intentional labels such as compact UI eyebrows.

## ANTI-PATTERNS

- `analyzer.ts` MUST stay deterministic and dependency-free: pure keyword matching, no `Date.now()` in classification (only in result metadata), no network, no randomness. Same `LearningItem[]` → identical `AnalysisResult`.
- Do NOT call the LLM directly from the browser — route through the BFF (`/api/agent/chat`) via `lib/agent/client.ts`.
- The fallback competency ("기타 학습 경험") is intentional — don't drop unmatched items.
- Do NOT turn invalid URL-looking evidence text into links; `LearningItemList` only links valid URLs.
- Do NOT bypass request cancellation/current-request guards in `AgentPanel`; stale SSE callbacks must not update unmounted or superseded UI.
