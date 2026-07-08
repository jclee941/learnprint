# scripts/ — Verification Utilities

Node stdlib `.mjs` scripts for readiness logs and submission-package integrity. No runtime app code lives here.

## STRUCTURE

```
verify-readiness.mjs          # runs test -> typecheck -> build, writes canonical logs
verify-submission-package.mjs # validates docs/submission/final artifacts
lib/
  submission-files.mjs        # file walking + git status helpers
  submission-scanner.mjs      # required files, size limits, secret scans
  zip-inspector.mjs           # zip/docx entry inspection
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Change readiness command order/log text | `verify-readiness.mjs` |
| Change required final-package files | `lib/submission-scanner.mjs` |
| Change secret/path exclusions | `lib/submission-scanner.mjs` |
| Change zip/docx inspection | `lib/zip-inspector.mjs` |
| Change target final package path | `verify-submission-package.mjs` (`SUBMISSION_FINAL_DIR`) |

## CONVENTIONS

- Use Node stdlib only; keep scripts runnable with `node`, not `tsx`.
- Messages are Korean because outputs are submission evidence.
- `verify-readiness.mjs` writes both the public docs log and the `.omo` evidence log; do not print env values.
- `verify-submission-package.mjs` defaults to `docs/submission/final` and fails closed on required ZIP/docx inspection.

## ANTI-PATTERNS

- Do NOT hard-code passing test counts; parse command output or omit stale counts.
- Do NOT make dirty git status a failure by itself; record it for evidence.
- Do NOT weaken secret scans for API keys, private keys, dotenv files, `.git`, or `node_modules`.
- Do NOT add external npm dependencies for archive scanning or hashing.
