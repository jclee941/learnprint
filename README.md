# learnprint — HYCU 학습 이력서

[![Status: Active development](https://img.shields.io/badge/status-active--development-blue)]()
[![React 19](https://img.shields.io/badge/React-19-149eca)]() [![Vite 6](https://img.shields.io/badge/Vite-6-646cff)]() [![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178c0)]()
[![Node.js 22](https://img.shields.io/badge/Node.js-22-339933)]() [![License: SEE LICENSE](https://img.shields.io/badge/license-SEE%20LICENSE-lightgrey)]()
[![2026 HYCU Contest](https://img.shields.io/badge/2026%20HYCU-AI%20%EC%8D%B8%EB%B6%80%EB%B2%95%20%EA%B3%B5%EB%AA%A8%EC%A0%84-ff6f00)]()

> 2026 HYCU AI 학습법 공모전 출품작. 흩어진 학습 기록을 **결정론적 규칙 엔진**이 역량·증거 기반 이력서로 재구성합니다. AI 코칭은 선택 보조 레이어입니다.

## 한 줄 요약

`learnprint`는 강의·프로젝트·자격·회고 등 학습 항목 입력을 결정론적 규칙으로 분류·정규화하고, 각 역량 주장에 원본 증거를 첨부한 이력서·증거 원장(evidence ledger)을 즉시 내보낼 수 있는 단일 페이지 웹앱입니다.

## 상태 (Status)

| 영역 | 상태 | 비고 |
| --- | --- | --- |
| 규칙 엔진 (`src/lib/ai/analyzer.ts`) | 안정 | 동일 입력 → 동일 출력, 단위 테스트로 잠김 |
| React 19 UI | 안정 | 기능 분할(feature-sliced) 구조 |
| Node.js BFF (`node:http`) | 안정 | AI SSE 프록시, 외부 프레임워크 없음 |
| 배포 (GitHub Pages) | 안정 | `VITE_BASE=/<repo>/`, SPA 404 fallback |
| 데이터 영속화 | localStorage 전용 | 백엔드 DB 없음 |
| AI 코칭 | 선택 | LLM 키 미설정 시 비활성, 비활성에서도 핵심 기능 동작 |
| 운영 안정화 (프로덕션) | 진행 중 | 공모전 출품 검증 단계(`verify:*`) 사용 |
| 라이선스 | 커스텀 | 저장소 `LICENSE` 참조 |

## 한눈에 보는 흐름

| 단계 | 책임 | 진입점 |
| --- | --- | --- |
| 1. 학습 항목 입력 | 사용자 직접 입력 + HYCU 시드 | `src/features/analysis/LearningItemForm.tsx` |
| 2. 결정론적 분류 | 규칙 엔진이 역량/증거 매핑 | `src/lib/ai/analyzer.ts` |
| 3. 영속화 | localStorage 어댑터 | `src/lib/storage/storage.ts` |
| 4. 이력서 조립 | 역량별 그룹핑 + 근거 링크 | `src/features/resume/ResumeView.tsx` |
| 5. 내보내기 | MD / JSON / evidence ledger | `src/features/resume/exporters.ts` |
| 6. AI 코칭 (선택) | BFF SSE 프록시 → OpenAI 호환 LLM | `server/agent-handler.ts` |
| 7. 제출 검증 | 출품 패키지 무결성 점검 | `scripts/verify-submission-package.mjs` |

## 목차

1. [목적 (Purpose)](#목적-purpose)
2. [패키지 구성 (Package Contents)](#패키지-구성-package-contents)
3. [아키텍처 (Architecture)](#아키텍처-architecture)
4. [첫 번째로 읽을 파일 (First Files to Read)](#첫-번째로-읽을-파일-first-files-to-read)
5. [진입점과 API (Entry Points and API)](#진입점과-api-entry-points-and-api)
6. [빠른 시작 (Quickstart)](#빠른-시작-quickstart)
7. [설정 (Configuration)](#설정-configuration)
8. [명령어 (Commands)](#명령어-commands)
9. [로컬 개발 (Local Development)](#로컬-개발-local-development)
10. [테스트 (Testing)](#테스트-testing)
11. [제출 검증 (Submission Verification)](#제출-검증-submission-verification)
12. [기여 (Contributing)](#기여-contributing)
13. [유지보수 및 문의 (Maintainers)](#유지보수-및-문의-maintainers)
14. [추가 문서 (Further Documentation)](#추가-문서-further-documentation)
15. [라이선스 (License)](#라이선스-license)
16. [English Summary](#english-summary-secondary)

## 목적 (Purpose)

`learnprint`는 학습자가 여러 곳에 흩어 둔 학습 기록(강의·과제·프로젝트·자격·회고 메모)을 한 곳에 모아, **객관적으로 검증 가능한 역량 이력서**로 다시 묶어 주는 도구입니다. 세 가지 핵심 설계 원칙을 따릅니다.

1. **결정론 (determinism)** — 분류·점수화는 외부 API 없이 로컬 규칙만으로 수행합니다. 같은 입력은 항상 같은 결과를 내야 하며, 이 약속은 `src/lib/ai/analyzer.ts`의 단위 테스트로 보호됩니다.
2. **증거 기반 (evidence-first)** — 모든 역량 주장에는 원본 학습 항목 ID가 함께 기록되며, 이를 `evidence ledger`로 내보낼 수 있습니다.
3. **AI는 보조 (coach, not judge)** — AI는 문장 다듬기나 표현 제안만 담당하고 최종 결정은 규칙 엔진이 내립니다.

이 저장소는 2026 HYCU AI 학습법 공모전 출품작이며, 출품 패키지 무결성은 `scripts/verify-submission-package.mjs`로 점검합니다.

### 누구를 위한 도구인가

- **학습자** — 강의·프로젝트·자격·회고를 한 곳에 모아 역량 이력서로 정리하고 싶을 때
- **교육 기관 / 공모전 심사위원** — 근거와 함께 검증 가능한 학습 포트폴리오를 검토해야 할 때
- **후속 개발자** — 결정론적 규칙 엔진을 참고하거나 확장하고 싶을 때

## 패키지 구성 (Package Contents)

```
.
├─ index.html                  # Vite 진입점
├─ src/                        # React 19 프런트엔드 (feature-sliced)
│  ├─ App.tsx, main.tsx
│  ├─ features/{resume,analysis,agent}
│  ├─ lib/{ai,storage,agent}
│  ├─ data/hycu-seed.{ts,json}
│  ├─ hooks/, types/, styles/, test/
├─ server/                     # node:http BFF, AI SSE 프록시 (AGENTS.md 기준)
├─ scripts/                    # readiness / submission 검증기
├─ docs/                       # 사례 보고서 + 출품 패키지
├─ public/                     # 정적 자산
├─ vite.config.ts              # /api → BFF 프록시
├─ tsconfig.{app,server,node}.json
└─ package.json
```

> `server/` 디렉터리는 `AGENTS.md`와 `package.json`이 참조하는 정식 컴포넌트입니다. 본 저장소 트리 발췌에는 일부 디렉터리가 생략되어 있을 수 있으므로, 실제 존재 여부는 저장소 루트를 직접 확인하세요.

### 주요 디렉터리 책임

| 경로 | 책임 |
| --- | --- |
| `src/features/resume` | 이력서 뷰, MD / JSON / evidence ledger 내보내기 |
| `src/features/analysis` | 학습 항목 입력 폼과 목록 |
| `src/features/agent` | AI 코칭 패널 (SSE 클라이언트) |
| `src/lib/ai` | 결정론적 분류·점수화 규칙 엔진 |
| `src/lib/storage` | localStorage 영속화 어댑터 |
| `src/lib/agent` | LLM 호출 컨텍스트·클라이언트 |
| `src/data` | HYCU 시드 데이터(`.ts` + `.json`) |
| `src/types` | 학습 / 이력서 / 에이전트 타입 계약 |
| `server` | `node:http` 기반 BFF (SSE, OpenAI 호환 프록시) |
| `scripts` | readiness 로그 / 제출 패키지 검증기 |
| `docs` | 사례 보고서, AI 증거, 코드 품질 체크리스트 |

## 아키텍처 (Architecture)

### 요청 흐름 — 학습 항목 → 이력서 → 내보내기 (결정론 경로)

1. 사용자가 `LearningItemForm`으로 학습 항목을 입력한다.
2. `useLearningItems` 훅이 `src/lib/storage`로 영속화한다(localStorage).
3. `src/lib/ai/analyzer.ts` 규칙 엔진이 항목을 정규화하고 역량 태그를 부착한다.
4. `ResumeView`가 역량별로 그룹핑해 근거 ID와 함께 표시한다.
5. `ExportControls`가 `exporters.ts`를 통해 MD / JSON / evidence ledger 파일을 생성한다.

### 요청 흐름 — AI 코칭 (선택 경로)

1. 사용자가 `AgentPanel`에 질의를 입력한다.
2. 브라우저가 `/api/agent`로 SSE 요청을 보낸다(Vite 프록시가 BFF로 전달).
3. BFF `agent-handler.ts`가 OpenAI 호환 LLM으로 SSE를 프록시한다(비밀키는 서버 측에서만).
4. 응답 토큰이 스트리밍되어 패널에 점진적으로 렌더링된다.

### 책임 경계

| 레이어 | 책임 | 금지 사항 |
| --- | --- | --- |
| 규칙 엔진 | 결정론적 분류·점수화 | 비결정론적 로직, 외부 API 호출 |
| React UI | 렌더링·상호작용 | 비즈니스 규칙 하드코딩, 비밀키 보관 |
| BFF | SSE 프록시·시크릿 로딩 | 상태 영속화, LLM 응답 직접 생성 |
| 브라우저 저장소 | localStorage 영속화 | 서버 전송, 사용자 간 공유 |

## 첫 번째로 읽을 파일 (First Files to Read)

순서대로 읽으면 전체 구조가 빠르게 잡힙니다.

| 순서 | 파일 | 이유 |
| --- | --- | --- |
| 1 | `AGENTS.md` | 저장소 지식 베이스, 규칙·제약·흐름 요약 |
| 2 | `src/lib/ai/analyzer.ts` | 결정론적 분류 규칙의 진실 공급원 |
| 3 | `src/types/{learning,resume,agent}.ts` | 타입 계약 |
| 4 | `src/features/resume/ResumeView.tsx` | 역량 그룹핑·근거 표시 패턴 |
| 5 | `src/features/resume/exporters.ts` | 내보내기 포맷 정의 |
| 6 | `server/agent-handler.ts` | BFF SSE 프록시 동작 |
| 7 | `scripts/verify-readiness.mjs` | canonical 검증 로그 생성기 |
| 8 | `docs/case-report.md` | 출품 의도·방법론 정리 |

## 진입점과 API (Entry Points and API)

### 프런트엔드 진입점

| 진입점 | 경로 | 설명 |
| --- | --- | --- |
| HTML 진입 | `index.html` | Vite가 주입하는 단일 진입 |
| React 부트 | `src/main.tsx` | React 19 루트 마운트 |
| 최상위 컴포넌트 | `src/App.tsx` | 라우팅·레이아웃 조합 |

### BFF API (개발 환경 기준)

| 메서드·경로 | 설명 | 인증 |
| --- | --- | --- |
| `GET /api/agent` (SSE) | OpenAI 호환 LLM 스트리밍 프록시 | 서버 측 `.env`의 API 키 사용 |

> 운영 시 정확한 베이스 경로는 배포 환경의 `VITE_BASE` 값을 따릅니다.

### 내보내기 포맷

| 포맷 | 책임 모듈 | 용도 |
| --- | --- | --- |
| Markdown | `src/features/resume/exporters.ts` | 사람이 읽는 이력서 |
| JSON | `src/features/resume/exporters.ts` | 기계가 읽는 정형 데이터 |
| Evidence Ledger | `src/features/resume/exporters.ts` | 역량 주장과 원본 항목의 매핑 |

## 빠른 시작 (Quickstart)

요구 사항: Node.js 22 이상, npm.

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 템플릿 복사 (AI 코칭을 쓰지 않으면 비워 둬도 됨)
cp .env.example .env   # 필요 시 편집

# 3. 개발 서버 (Vite + HMR, /api는 BFF로 프록시)
npm run dev

# 4. 빌드 + 프로덕션 모드 (정적 자산 + BFF)
npm run build && npm run serve

# 5. 브라우저에서 접속
#    프런트엔드: http://localhost:5173  (Vite 기본)
#    BFF SSE:    http://localhost:4173/api/agent
```

첫 화면에는 HYCU 시드 데이터가 일부 채워져 있어, 입력 폼 동작과 분류 결과를 바로 확인할 수 있습니다(`src/data/hycu-seed.json`).

## 설정 (Configuration)

| 변수 | 위치 | 용도 | 기본값 |
| --- | --- | --- | --- |
| `VITE_BASE` | 빌드 환경 | 자산 베이스 경로(`/`, `/<repo>/`) | `/` |
| LLM API 키 | 서버 `.env` (gitignored) | AI 코칭 활성화 | 미설정 시 비활성 |
| OpenAI 호환 엔드포인트 / 키 | 서버 `.env` | LLM 공급자 연결 | 공급자 기본값 |

> 시크릿은 절대 브라우저 번들에 포함되지 않습니다. `.env`는 git에서 제외되며 `.env.example`만 커밋됩니다.

## 명령어 (Commands)

| 명령 | 용도 |
| --- | --- |
| `npm run dev` | Vite 개발 서버(HMR) — 프런트만 |
| `npm run serve` | 빌드 결과 정적 서빙 + BFF |
| `npm start` | `serve`의 별칭 |
| `npm run build` | `tsc -b` + 서버 타입 체크 + `vite build` |
| `npm run preview` | Vite 프리뷰 |
| `npm run typecheck` | 앱 + 서버 타입 체크 (`noUnusedLocals` 활성) |
| `npm test` | Vitest 단일 실행 |
| `npm run test:watch` | Vitest 워치 모드 |
| `npm run verify:readiness` | test → typecheck → build, canonical readiness 로그 생성 |
| `npm run verify:submission` | 출품 패키지 무결성·시크릿 제외 검증 |

## 로컬 개발 (Local Development)

### 권장 워크플로

1. 작업을 시작하기 전 `AGENTS.md`, `src/AGENTS.md`, `scripts/AGENTS.md`를 먼저 읽는다.
2. `npm run dev`로 HMR 환경에서 작업한다.
3. 단위 테스트를 동행해서 작성·수정한다(`*.test.ts(x)` colocated).
4. 변경 후 `npm run typecheck`과 `npm test`를 통과시킨다.
5. 출품 패키지에 영향을 주면 `npm run verify:readiness`로 정식 로그를 갱신한다.

### 코딩 규칙 (요약)

- 사용자 노출 문자열·주석·에러 메시지는 한국어로 작성한다.
- 모든 tsconfig는 strict. `noUnusedLocals`, `noUnusedParameters`가 켜져 있어 죽은 코드는 타입 체크에서 실패한다.
- 프런트엔드는 `tsconfig.app.json`, 서버는 `tsconfig.server.json`(`*.test.ts` 제외), 노드 스크립트는 `tsconfig.node.json`으로 분리된다.
- 런타임 의존성은 React 19 단일 패키지뿐이다. BFF와 규칙 엔진은 `node:http` 및 표준 라이브러리만 사용한다.

### 금지 사항 (안티패턴)

- `analyzer.ts`를 비결정론적으로 만들지 않는다 (동일 입력 → 동일 출력).
- 서버 프레임워크(express, fastify 등)를 추가하지 않는다.
- LLM 비밀키를 브라우저로 유출하지 않는다.
- `dist/`를 수동 편집하지 않는다.
- 동결된 ZIP·비디오·docx 증거를 현재 HEAD의 증거처럼 단정하지 않는다.

### 디버깅 팁

- 결정론 위반 의심 시 `src/lib/ai/analyzer.test.ts`를 우선 실행해 회귀 여부를 빠르게 확인한다.
- AI 코칭 SSE 이슈는 BFF 로그와 `server/agent-handler.ts`를 함께 본다.
- 빌드 산출물은 `dist/`에 생성되며, 변경 검증은 `npm run preview`로도 가능하다.

## 테스트 (Testing)

| 종류 | 도구 | 위치 | 환경 |
| --- | --- | --- | --- |
| 단위 테스트 | Vitest | `src/**/*.test.ts(x)`, `vite-base.test.ts` | jsdom (기본) |
| 노드 전용 테스트 | Vitest + `// @vitest-environment node` | `src/lib/agent/*`, `src/data/hycu-seed.test.ts` 등 | node |
| 보안 테스트 | Vitest | `src/features/resume/exporters.security.test.ts` | jsdom |
| E2E | Playwright (설치되어 있으나 기본 파이프라인 외) | 필요 시 추가 | 브라우저 |

핵심 보장: 규칙 엔진은 동일 입력 → 동일 출력이 항상 성립하도록 단위 테스트로 잠겨 있습니다.

## 제출 검증 (Submission Verification)

2026 HYCU AI 학습법 공모전 출품작 특성상, 두 가지 검증 단계를 제공합니다.

| 스크립트 | 검사 항목 |
| --- | --- |
| `scripts/verify-readiness.mjs` | 현재 HEAD에서 test → typecheck → build를 돌리고 canonical readiness 로그 생성 |
| `scripts/verify-submission-package.mjs` | `docs/` 산출물, 시크릿·`.git`·`node_modules`·임의 dotenv 제외, 비-template 파일 부재 확인 |

`npm run verify:readiness`는 **canonical 로그 생성기**이므로 출력물을 손으로 수정하지 않습니다.

## 기여 (Contributing)

기여 절차는 [`CONTRIBUTING.md`](./CONTRIBUTING.md)를 따릅니다. 요약하면 다음과 같습니다.

1. 이슈 또는 PR로 변경 의도를 먼저 공유한다.
2. 변경 범위에 맞춰 단위 테스트를 함께 갱신한다.
3. `npm run typecheck && npm test`를 로컬에서 통과시킨다.
4. 출품 패키지에 영향이 있는 변경은 `npm run verify:readiness`로 로그를 갱신한다.
5. PR에는 변경 요약, 영향 범위, 테스트 결과를 첨부한다.

### 보안·윤리

- 개인 식별 정보, 비밀키, 학습자 본인이 동의하지 않은 콘텐츠를 커밋하지 않는다.
- 시드 데이터(`src/data/hycu-seed.json`)는 비식별·공개 가능한 자료만 포함한다.

## 유지보수 및 문의 (Maintainers)

| 항목 | 값 |
| --- | --- |
| 저장소명 | learnprint |
| 한 줄 설명 | HYCU 학습 이력서 — 결정론적 규칙 엔진 기반 역량·증거 이력서 재구성 |
| 목적 | 2026 HYCU AI 학습법 공모전 출품작 |
| 1차 문의 | 저장소 이슈 트래커 |
| 라이선스 | 커스텀 — 저장소 루트의 [`LICENSE`](./LICENSE) 참조 |

## 추가 문서 (Further Documentation)

| 주제 | 경로 |
| --- | --- |
| 사례 보고서 요약 | [`docs/case-report-summary.md`](./docs/case-report-summary.md) |
| 사례 보고서 전문 | [`docs/case-report.md`](./docs/case-report.md) |
| AI 증거 정리 | [`docs/ai-evidence.md`](./docs/ai-evidence.md) |
| HYCU 데이터 출처 | [`docs/hycu-data-provenance.md`](./docs/hycu-data-provenance.md) |
| 증거 원장 샘플 | [`docs/sample-evidence-ledger.md`](./docs/sample-evidence-ledger.md) |
| 코드 품질 체크리스트 | [`docs/code-quality-checklist.md`](./docs/code-quality-checklist.md) |
| 출품 양식 | [`docs/2026_HYCU_AI_Learning_Method_Contest_Submission_Form.docx`](./docs/2026_HYCU_AI_Learning_Method_Contest_Submission_Form.docx) |
| 지식 베이스 | [`AGENTS.md`](./AGENTS.md), [`src/AGENTS.md`](./src/AGENTS.md), [`scripts/AGENTS.md`](./scripts/AGENTS.md), [`docs/AGENTS.md`](./docs/AGENTS.md) |

## 라이선스 (License)

저장소 루트의 [`LICENSE`](./LICENSE) 파일이 적용됩니다(커스텀 라이선스). 사용·재배포 전 본문을 반드시 확인하세요.

## English Summary (secondary)

`learnprint` is a single-page web app that reconstructs scattered learning records (courses, projects, certifications, reflections) into a competency- and evidence-based resume through a deterministic rule engine. Built with React 19, Vite 6, and strict TypeScript, it persists data only in browser `localStorage` and ships no backend database. An optional AI coaching layer streams suggestions via a `node:http` BFF that proxies SSE to an OpenAI-compatible LLM; API secrets remain server-side. The rule engine is the single source of truth and is locked down by unit tests to guarantee the same input always yields the same output. This repository is a submission for the 2026 HYCU AI Learning Method Contest — see `docs/` for the case report and supporting artifacts, and run `npm run verify:readiness` and `npm run verify:submission` to validate the package locally.