# docs/ — Reports And Evidence

Working Korean documentation plus contest submission artifacts. Root docs explain the case, evidence, score/readiness history, and data provenance; `docs/submission/` holds the submission package.

## STRUCTURE

```
case-report.md              # main Korean case report source
ai-evidence.md              # AI usage evidence appendix source
submission-checklist.md     # current packaging checklist
verification-log.txt        # historical verification record
submission/                 # final package + screenshots + frozen artifacts
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Case report wording | `case-report.md`, `case-report-summary.md` |
| AI usage disclosure | `ai-evidence.md`, `submission/appendix3_ai-evidence.md` |
| HYCU data provenance | `hycu-data-provenance.md` |
| Current readiness reference | `submission/final/evidence/06_빌드테스트로그.txt` |
| Submission package inventory | `submission/final/00_제출안내.md`, `submission/README.md` |

## CONVENTIONS

- User-facing docs are Korean.
- Separate historical records from current HEAD. Use `npm run verify:readiness` for current test/typecheck/build status.
- When documenting generated exports, keep wording aligned with `src/features/resume/exporters.ts` and `finalOutputSummary.ts`.
- Mention privacy boundaries plainly: localStorage by default; optional AI agent sends selected learning context through the BFF.

## ANTI-PATTERNS

- Do NOT present old test counts or release snapshots as current verification.
- Do NOT claim LMS attendance, grades, certificates, or artifact authenticity are automatically verified.
- Do NOT add personal secrets, API keys, tokens, or authentication data to examples.
- Do NOT hand-edit generated readiness logs unless documenting that they are historical.
