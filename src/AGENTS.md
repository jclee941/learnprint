# src/ — React Frontend

Feature-sliced React 19 app. Entry: `main.tsx` → `App.tsx` (integrates input, analysis, resume output).

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
  storage/  # localStorage wrapper
  id.ts     # id generation
types/      # learning.ts, resume.ts, agent.ts — shared contracts
styles/     # global.css (includes @media print rules)
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add/change competency keywords or scoring | `lib/ai/analyzer.ts` (`COMPETENCY_CATALOG`) |
| Change resume export format | `features/resume/exporters.ts` |
| Persisted state shape | `hooks/useLearningItems.ts` + `lib/storage/` |
| Print layout | `styles/global.css` (`@media print`) |

## CONVENTIONS

- `features/*` slices export via `index.ts`; import features through the barrel, not deep paths.
- Component files `PascalCase.tsx`; lib/hooks `camelCase.ts`. Tests colocated as `*.test.tsx`.
- Types imported with `import type` (verbatim module syntax under strict).

## ANTI-PATTERNS

- `analyzer.ts` MUST stay deterministic and dependency-free: pure keyword matching, no `Date.now()` in classification (only in result metadata), no network, no randomness. Same `LearningItem[]` → identical `AnalysisResult`.
- Do NOT call the LLM directly from the browser — route through the BFF (`/api/agent/chat`) via `lib/agent/client.ts`.
- The fallback competency ("기타 학습 경험") is intentional — don't drop unmatched items.
