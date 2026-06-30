# Contributing / 기여 가이드

English | [한국어](#한국어)

## English

learnprint is a HYCU learning resume web app. Contributions should keep the
app reproducible, deterministic, and accurate as contest/submission evidence.

### How to Contribute

1. Fork the repository.
2. Create a branch with a standard prefix such as `feat/`, `fix/`, or `docs/`.
3. Keep the change focused and atomic.
4. Use a Conventional Commits PR title, for example `fix(resume): escape evidence links`.
5. Run the relevant checks and include the results in the PR.

### Local Setup

```bash
npm install
npm run dev
```

### Verification

Use the narrowest check that covers the change, and run the full readiness
check before release/submission updates.

```bash
npm run typecheck
npm test
npm run build
npm run verify:readiness
npm run verify:submission
```

### Project Rules

- Keep `src/lib/ai/analyzer.ts` deterministic. The same input must produce the same competency/evidence result; no network, randomness, or LLM dependency belongs in the classifier.
- Keep runtime dependencies limited to React unless a change explicitly justifies otherwise. The BFF intentionally uses `node:http`, not Express/Fastify.
- Do not edit `dist/` by hand. Build output must come from project commands.
- Do not commit `.env`, API keys, private keys, access tokens, or source archives containing `.git`, `node_modules`, or non-template dotenv files.
- User-facing strings, docs, and errors should remain Korean unless a bilingual open-source document is intentional.
- Do not present frozen submission artifacts as current HEAD evidence unless they were regenerated and reverified.

### Automated Checks

PRs may be checked by:

- **jclee-bot / pr-metadata**: PR size, title, and branch-name validation.
- **jclee-bot / secret-scan**: secret scanning.
- **jclee-bot / actionlint**: workflow linting when workflow files change.
- **jclee-bot**: AI code review and PR automation. Korean responses are expected; findings are advisory unless branch protection requires them.

---

## 한국어

learnprint는 HYCU 학습 이력서를 만드는 웹앱입니다. 기여는 재현 가능한 검증, 결정론적 동작, 제출 증빙의 정확성을 우선합니다.

### 기여 방법

1. 레포지토리를 fork합니다.
2. `feat/`, `fix/`, `docs/` 같은 표준 prefix로 브랜치를 만듭니다.
3. 변경은 집중적이고 원자적으로 유지합니다.
4. PR 제목은 `fix(resume): escape evidence links`처럼 Conventional Commits 형식을 따릅니다.
5. 관련 검증 명령을 실행하고 결과를 PR에 남깁니다.

### 로컬 실행

```bash
npm install
npm run dev
```

### 검증

변경 범위를 덮는 가장 좁은 검증을 먼저 실행하고, 릴리스/제출 패키지 갱신 전에는 전체 readiness 검증을 실행합니다.

```bash
npm run typecheck
npm test
npm run build
npm run verify:readiness
npm run verify:submission
```

### 프로젝트 원칙

- `src/lib/ai/analyzer.ts`의 결정론을 깨지 않습니다. 같은 입력은 같은 역량·증거 결과를 내야 하며, 분류기는 네트워크·랜덤·LLM 호출에 의존하면 안 됩니다.
- 런타임 의존성은 React 중심으로 유지합니다. 서버 BFF는 의도적으로 Express/Fastify가 아닌 `node:http` 표준 라이브러리를 사용합니다.
- `dist/`는 직접 편집하지 않습니다. 빌드 산출물은 명령으로만 생성합니다.
- `.env`, API key, 개인키, access token, `.git`/`node_modules`/비템플릿 dotenv 파일을 포함한 소스 ZIP은 커밋하지 않습니다.
- 사용자-facing 문서, 문자열, 오류 문구는 이중언어 공개 문서가 아닌 한 한국어를 기본으로 작성합니다.
- frozen 제출 산출물은 재생성·재검증하지 않았다면 현재 HEAD 증거처럼 표현하지 않습니다.

### 자동화 검증

PR에는 다음 자동 검증이 붙을 수 있습니다.

- **jclee-bot / pr-metadata**: PR 크기, 제목, 브랜치 이름 검증.
- **jclee-bot / secret-scan**: 민감정보 스캔.
- **jclee-bot / actionlint**: 워크플로우 파일 변경 시 워크플로우 린트.
- **jclee-bot**: AI 코드 리뷰 및 PR 자동화. 한국어 응답을 기본으로 하며, 브랜치 보호에서 요구하지 않으면 권고 성격입니다.
