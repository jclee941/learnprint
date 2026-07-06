# HYCU 학습 이력서 (learnprint)

[![license](https://img.shields.io/badge/license-SEE%20LICENSE-blue)]()[![node](https://img.shields.io/badge/node-22-green)]()[![react](https://img.shields.io/badge/react-19-61dafb)]()[![status](https://img.shields.io/badge/status-verified-brightgreen)]()

흩어진 학습 경험을 **역량·증거 기반 학습 이력서**로 자동 재구성하는 결정론적 웹앱. AI 학습 에이전트는 보조 코칭 레이어이며, 핵심 기능은 네트워크·AI 없이도 동일 입력에 항상 동일 결과를 보장합니다. (2026 HYCU AI 학습법 공모전, 부문 5 출품작)

A deterministic web app that reconstructs scattered learning records into a competency/evidence-based resume. AI agent is an optional coaching layer; the core pipeline is non-AI, non-network.

## 한눈에 보기

| 항목 | 상태 | 다음 행동 |
|------|------|-----------|
| 라이브 데모 | ✅ HTTP 200 | <https://learnprint.jclee.me> — `npm run build && npm run serve`로 로컬 재현 가능 |
| 테스트 | ✅ 통과 | `npm test` (Vitest, jsdom, 22 파일, 단위·컴포넌트·서버) |
| 타입체크 | ✅ 오류 없음 | `npm run typecheck` (앱 + `tsconfig.server.json`) |
| 프로덕션 빌드 | ✅ 성공 | `npm run build` (`dist/`, JS gzip ≈ 69.8KB) |
| 데이터 저장 | 브라우저 `localStorage`만 사용, 백엔드 DB 없음 | — |
| LLM 시크릿 | 서버 측 `.env` (gitignored), 브라우저 누출 없음 | `server/.env.example` 참고 |
| 운영 책임 | 작성자 1인 (이재철, HYCU 2024112536) | "유지보수" 절 |

## 사용 흐름 (오퍼레이터/사용자 관점)

1. **입력** — 강의·과제·프로젝트·자격증·독학·대회·기타 7개 카테고리로 학습 경험과 증거(링크·메모) 등록
2. **분류** — 결정론적 규칙 엔진(`src/lib/ai/analyzer.ts`)이 6개 핵심 역량 + 기타 학습 경험 폴백으로 자동 그룹화
3. **검토** — 역량별 묶인 학습 흔적과 증거 문장·출처를 브라우저에서 확인·수정
4. **내보내기** — Markdown / JSON / 증거 원장(Evidence Ledger) 다운로드 또는 브라우저 인쇄
5. **AI 코칭 (선택)** — 등록한 이력을 컨텍스트로 자기소개·코칭·예상 면접질문 스트리밍 (`/api/agent/stream`)

## 목차

1. [목적](#목적)
2. [패키지 구성](#패키지-구성)
3. [상세 상태](#상세-상태)
4. [우선 확인할 파일](#우선-확인할-파일)
5. [API / 진입점](#api--진입점)
6. [빠른 시작](#빠른-시작)
7. [명령어](#명령어)
8. [테스트](#테스트)
9. [유지보수](#유지보수)
10. [추가 문서](#추가-문서)
11. [License](#license)

---

## 목적

사이버대학교에서 쌓인 강의·과제·프로젝트·자격증·독학·대회 등 **흩어진 학습 경험을 한 곳에 입력**하면, 결정론적 규칙 엔진이 이를 **6개 핵심 역량 + 기타 학습 경험 폴백**으로 자동 분류·정렬하고 각 학습 흔적을 증거로 연결한 학습 이력서로 재구성합니다. 결과는 Markdown·JSON·증거 원장(Evidence Ledger)으로 내보내거나 브라우저 인쇄로 깔끔하게 출력할 수 있습니다.

- **대상 사용자** — 사이버대 학습자, 취업 준비생, 포트폴리오 재구성이 필요한 일반 사용자
- **가치** — 분산된 학습 흔적을 역량·증거 자산으로 전환, 동일 입력에 항상 동일 결과 (결정론)
- **AI 정책** — 핵심 기능은 무네트워크·무AI로 항상 동작, AI는 보조 코칭 레이어 (`docs/ai-evidence.md`)

### 무엇을 할 수 있는가

| 기능 | 설명 | 핵심 위치 |
|------|------|----------|
| 학습 이력 입력 | 강의/과제/프로젝트/자격증/독학/대회/기타 7개 카테고리 + 기간·증거·메모 | `src/features/analysis/` |
| 역량 자동 분류 | 6개 역량 + 폴백, 결정론적·테스트 가능 | `src/lib/ai/analyzer.ts` |
| 이력서 미리보기 | 역량별 묶인 학습 흔적과 증거 문장·출처 | `src/features/resume/ResumeView.tsx` |
| 내보내기 | Markdown / JSON / 증거 원장(Evidence Ledger) | `src/features/resume/exporters.ts` |
| 브라우저 인쇄 | `@media print` 스타일로 깔끔한 출력 | `src/styles/global.css` |
| AI 코칭 (선택) | 자기소개·코칭·예상 면접질문 SSE 스트리밍 | `src/features/agent/`, `server/agent-handler.ts` |
| HYCU 시드 자동 주입 | 첫 실행 시 작성자 실제 HYCU 수강 과목 주입 | `src/data/hycu-seed.ts` (+ `.json`) |

## 패키지 구성

```
.
├── AGENTS.md                # 프로젝트 지식 베이스 (구조·컨벤션·안티패턴)
├── CONTRIBUTING.md          # 기여 가이드
├── LICENSE                  # 라이선스 전문 (npm: SEE LICENSE IN LICENSE)
├── README.md                # 본 문서
├── index.html               # Vite 엔트리 HTML
├── package.json             # name: learnprint, type: module, private
├── package-lock.json
├── tsconfig.json            # 루트 (참조)
├── tsconfig.app.json        # 프론트엔드 (src/) strict
├── tsconfig.node.json
├── tsconfig.server.json     # BFF (server/) strict, *.test.ts 제외
├── vite.config.ts           # VITE_BASE, /api 프록시 설정
├── vite-base.test.ts
├── src/                     # React 19 프론트엔드 (feature-sliced)
│   ├── App.tsx, main.tsx
│   ├── types/               # learning, resume, agent 타입 계약
│   ├── lib/
│   │   ├── id.ts            # 결정론적 ID 생성
│   │   ├── storage/         # localStorage 영속화
│   │   ├── ai/analyzer.ts   # 결정론적 역량 분류 엔진
│   │   └── agent/           # client, context (SSE 클라이언트)
│   ├── features/
│   │   ├── resume/          # ResumeView, ExportControls, exporters
│   │   ├── analysis/        # AnalysisPanel, LearningItemForm/List
│   │   └── agent/           # AgentPanel
│   ├── components/
│   ├── hooks/useLearningItems.ts
│   ├── data/                # HYCU 수강 과목 시드 + 검증 테스트
│   ├── styles/global.css    # @media print 포함 글로벌 스타일
│   └── test/setup.ts        # Vitest jsdom 셋업
├── scripts/                 # 제출/준비 검증 Node 스크립트 (mjs)
│   ├── verify-readiness.mjs
│   ├── verify-submission-package.mjs
│   └── lib/                 # submission scanner / zip inspector / 파일 유틸
├── public/                  # 정적 자산
└── docs/                    # 사례 보고서 + 동결된 제출 패키지
    ├── case-report.md, case-report-summary.md
    ├── ai-evidence.md, hycu-data-provenance.md
    ├── sample-evidence-ledger.md
    ├── score-estimate-review.md
    ├── code-quality-checklist.md, submission-checklist.md
    ├── verification-log.txt
    └── submission/          # 공식양식 docx, 데모 mp4, 부록 md
```

> `server/` 디렉터리는 BFF와 AI SSE 프록시를 담고 있으며 `tsconfig.server.json`과 `package.json`의 `serve`/`start`가 가리킵니다 (`server/index.ts`, `server/agent-handler.ts`, `server/env.ts`, `server/dotenv.ts`). 런타임 의존성은 React 두 개뿐 — BFF는 `node:http`만 사용합니다.

## 상세 상태

| 영역 | 상태 | 다음 명령/링크 |
|------|------|----------------|
| 라이브 데모 | ✅ HTTP 200, `/healthz` → `{"status":"ok"}` | <https://learnprint.jclee.me> |
| GitHub Pages | ✅ 빌드·배포 워크플로 존재, `VITE_BASE=/<repo>/`, SPA 404 폴백 | `.github/workflows/deploy-pages.yml` |
| 테스트 | ✅ 통과 — Vitest + jsdom, 소스에 colocation | `npm test` |
| 타입체크 | ✅ 오류 없음 — `tsc --noEmit` + `tsconfig.server.json` | `npm run typecheck` |
| 빌드 | ✅ 성공 — `dist/`, JS gzip ≈ 69.8KB | `npm run build` |
| 데이터 영속성 | 브라우저 `localStorage`만 사용, 백엔드 DB 없음 | — |
| LLM 시크릿 | 서버 측 `.env` (gitignored), 브라우저 누출 없음 | `server/env.ts`, `server/dotenv.ts` |
| 운영 책임 | 작성자 1인 (이재철, HYCU 2024112536) | "유지보수" 절 |
| CI | typecheck → test → build, Node 22 | `.github/workflows/ci.yml` |

### 프로덕션 준비도

- **운영 중** — 실제 데이터(작성자 HYCU 수강 과목) 시드, 공개 도메인 배포, 검증 로그 보관
- **알려진 제약** — LLM 코칭은 `OPENAI_API_KEY` (또는 호환 키) 설정 시에만 활성화. 미설정이면 비활성만 되고 핵심 이력서 기능은 영향 없음
- **폐기/지원 정책** — 2026 HYCU AI 학습법 공모전 출품 시점 기준으로 유지보수 중. 기능 추가/제안은 본 리포지토리 이슈 트래커

> 재검증 로그: `docs/verification-log.txt` · 점수 예상 점검: `docs/score-estimate-review.md` · AI 증거: `docs/ai-evidence.md`.

## 우선 확인할 파일

| 작업 | 위치 |
|------|------|
| 역량 분류 핵심 로직 (결정론적) | `src/lib/ai/analyzer.ts` (+ `analyzer.test.ts`) |
| HYCU 수강 과목 시드 | `src/data/hycu-seed.ts` (+ `hycu-seed.json`, `.test.ts`) |
| 이력서 내보내기 (MD/JSON/Ledger) | `src/features/resume/exporters.ts` (+ `.test.ts`) |
| 최종 출력 요약 | `src/features/resume/finalOutputSummary.ts` |
| AI 에이전트 SSE 엔드포인트 | `server/agent-handler.ts`, `server/index.ts` |
| LLM 설정/시크릿 로딩 | `server/env.ts`, `server/dotenv.ts` |
| 공유 타입 계약 | `src/types/{learning,resume,agent}.ts` |
| 인쇄 스타일 | `src/styles/global.css` (`@media print`) |
| 이력서 미리보기 | `src/features/resume/ResumeView.tsx` |
| 내보내기 컨트롤 | `src/features/resume/ExportControls.tsx` |
| 제출 패키지 검증 | `scripts/verify-submission-package.mjs` (+ `lib/`) |
| 사례 보고서 | `docs/case-report.md` (+ `case-report-summary.md`) |

## API / 진입점

### 프론트엔드 (Vite + React 19)

| 진입점 | 역할 |
|--------|------|
| `index.html` | Vite 엔트리 HTML |
| `src/main.tsx` | React 부트스트랩 |
| `src/App.tsx` | 최상위 컴포넌트 (레이아웃·라우팅) |
| `src/lib/ai/analyzer.ts` | 역량 분류 규칙 엔진 (결정론적) |
| `src/lib/storage/storage.ts` | `localStorage` 영속화 |
| `src/hooks/useLearningItems.ts` | 학습 항목 상태 훅 |

### BFF (`node:http`, Express 미사용)

| 경로 | 메서드 | 설명 |
|------|--------|------|
| `/api/agent/stream` | POST (SSE) | AI 학습 에이전트 스트리밍 (OpenAI 호환) |
| `/healthz` | GET | 헬스체크 → `{"status":"ok"}` |
| 정적 자산 | GET | `dist/` 서빙 (프로덕션 모드) |

> 모든 SSE·LLM 호출은 BFF가 중계하며 LLM 키는 브라우저로 전달되지 않습니다 (`docs/ai-evidence.md`). Vite 개발 모드에서는 `/api`가 BFF `:4173`으로 프록시됩니다 (`vite.config.ts`).

### CLI / 검증 스크립트

| 명령 | 용도 |
|------|------|
| `npm run verify:readiness` | 제출 준비 점검 |
| `npm run verify:submission` | 제출 패키지 (zip/파일) 검증 |
| `node scripts/lib/submission-scanner.mjs` | 제출 디렉터리 스캔 |
| `node scripts/lib/zip-inspector.mjs` | zip 내부 검사 |
| `node scripts/lib/submission-files.mjs` | 제출 파일 목록 |

## 빠른 시작

### 1) 설치

```bash
nvm use 22   # Node 22+
npm ci
```

### 2) 개발 모드 (HMR, `/api` 프록시 포함)

```bash
npm run dev
# 기본 http://localhost:5173  (Vite), /api → BFF :4173
```

### 3) 프로덕션 로컬 재현 (라이브 데모 미가동 시)

```bash
npm run build && npm run serve
# http://localhost:4173  (정적 + BFF)
```

### 4) 검증

```bash
npm test
npm run typecheck
```

### 5) 선택 — AI 코칭 활성화

`server/.env` (gitignored) 작성. 형식은 `server/.env.example` 참고.

```
OPENAI_API_KEY=...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

> 키가 없으면 AI 코칭만 비활성 — 핵심 이력서 기능은 영향 없음 (결정론적 규칙 엔진 + 내보내기 + 인쇄는 항상 동작).

### 6) 배포 (GitHub Pages)

- `.github/workflows/deploy-pages.yml` 사용, `VITE_BASE=/<repo>/`로 정적 빌드 + SPA 404 폴백
- 커스텀 도메인 `learnprint.jclee.me`는 DNS/리포지토리 Pages 설정으로 운영 중

## 명령어

| 스크립트 | 동작 |
|---------|------|
| `npm run dev` | Vite 개발 서버 (HMR, :5173) |
| `npm run serve` / `npm start` | `tsx server/index.ts` — 정적 + BFF (:4173) |
| `npm run build` | `tsc -b && tsc -p tsconfig.server.json && vite build` |
| `npm run preview` | `vite preview` |
| `npm run typecheck` | `tsc --noEmit` (앱) + `tsconfig.server.json` (서버) |
| `npm test` | Vitest 단회 실행 (CI 진입점) |
| `npm run test:watch` | Vitest 워치 모드 |
| `npm run verify:readiness` | 제출 준비 점검 스크립트 |
| `npm run verify:submission` | 제출 패키지 검증 스크립트 |

## 테스트

- **도구** — Vitest + jsdom + `@testing-library/react`
- **배치** — `src/**/*.test.ts(x)` 소스에 colocation, `vite-base.test.ts`는 Vite 설정 검증, `src/test/setup.ts`가 jsdom 셋업
- **실행** — `npm test` (CI에서 `npm test && npm run build`)
- **강조 항목**
  - **결정론성** — 동일 입력 → 동일 결과 (`analyzer.test.ts`)
  - **직렬화** — Markdown / JSON / Evidence Ledger 라운드트립 (`exporters.test.ts`, `finalOutputSummary.test.ts`)
  - **영속화** — `localStorage` 직렬화·복원 (`storage.test.ts`)
  - **에이전트 컨텍스트** — SSE 클라이언트·컨텍스트 조립 (`client.test.ts`, `context.test.ts`)
  - **글로벌 스타일** — `@media print` 포함 (`global.test.ts`)
  - **시드 무결성** — HYCU 시드 라운드트립 (`hycu-seed.test.ts`)

## 유지보수

| 항목 | 값 |
|------|-----|
| 작성자 | 이재철 (HYCU 2024112536) |
| 소속 | 한양사이버대학교 |
| 연락처 | 본 리포지토리 이슈 트래커 |
| 공모전 | 2026 HYCU AI 학습법 공모전, 부문 5 "AI 또는 바이브코딩으로 나만의 학습도구 제작" |
| 운영 시간대·대응 | 비동기 이슈 트래커 기반 |
| 보안 정책 | LLM 키는 서버 측에서만 — 브라우저로 절대 전달되지 않음. 본 리포지토리에서 외부 노출된 LLM 자격증명은 없음 |

## 추가 문서

| 문서 | 용도 |
|------|------|
| `AGENTS.md` | 프로젝트 지식 베이스 (구조, 컨벤션, 안티패턴) |
| `src/AGENTS.md` | 프론트엔드 모듈 지식 베이스 |
| `CONTRIBUTING.md` | 기여 가이드 |
| `docs/case-report.md` | 사례 보고서 본문 |
| `docs/case-report-summary.md` | 사례 보고서 요약 |
| `docs/ai-evidence.md` | AI 사용 증거 (프롬프트·재현 절차 포함) |
| `docs/hycu-data-provenance.md` | HYCU 데이터 출처 |
| `docs/sample-evidence-ledger.md` | 증거 원장 샘플 |
| `docs/score-estimate-review.md` | 점수 예상 점검 |
| `docs/code-quality-checklist.md` | 코드 품질 점검표 |
| `docs/submission-checklist.md` | 제출 점검표 |
| `docs/verification-log.txt` | 재검증 로그 |
| `docs/submission/` | 동결된 제출 패키지 (공식양식 docx, 데모 영상 mp4, 부록 md, 빌드/테스트 로그) |

## License

`LICENSE` 파일 참조 (npm 필드: `"license": "SEE LICENSE IN LICENSE"`).