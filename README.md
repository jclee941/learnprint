# learnprint — HYCU 학습 이력서

[![License: Custom](./LICENSE)](./LICENSE)
[![Node ≥ 22](https://img.shields.io/badge/node-%E2%89%A522-339933)]()
[![React 19](https://img.shields.io/badge/React-19-149eca)]()
[![Vite 6](https://img.shields.io/badge/Vite-6-646CFF)]()
[![TypeScript strict](https://img.shields.io/badge/TS-strict-3178C6)]()

## 한 줄 요약

흩어진 학습 기록을 결정론적 규칙 엔진이 역량·증거 기반 이력서로 재구성하는
HYCU 학생용 단일 페이지 웹 앱. AI 코칭은 선택형 보조 수단이며, 핵심 분류는
동일 입력에 대해 항상 같은 결과를 보장합니다.

## At a glance

A single-page React 19 + Vite 6 app that turns scattered HYCU learning records
into a competency/evidence-based resume. Classification runs locally through a
deterministic rule engine; an optional AI coaching layer sits behind a
`node:http` BFF that proxies SSE to an OpenAI-compatible LLM.

## Quick-glance status

| 항목 | 상태 |
|------|------|
| 제품 성숙도 | 프로덕션-준비 (HYCU 2026 공모전 제출 동결 빌드) |
| 런타임 의존성 | React, React-DOM (프론트); `node:http` stdlib (BFF) |
| 데이터 저장 | 브라우저 `localStorage`만 사용, 서버 DB 없음 |
| 테스트 | Vitest + jsdom (소스 colocated) |
| 타입 검사 | `tsc --noEmit` (app + server, strict) |
| CI | GitHub Actions: typecheck → test → build (Node 22) |
| 배포 | GitHub Pages, SPA 404 fallback |
| 다국어 | 한국어 우선, 영어 보조 |

## 운영자가 보는 흐름

1. 학생이 `src/data/hycu-seed.json` 또는 UI 폼으로 학습 항목을 등록합니다.
2. `src/lib/ai/analyzer.ts`의 결정론적 규칙 엔진이 역량·증거 코드를 분류합니다.
3. `src/features/resume/` 뷰가 결과를 이력서 형태로 렌더링합니다.
4. 학생이 Markdown / JSON / 증거 원장 중 하나로 내보냅니다.
5. AI 코칭 요청 시 `node:http` BFF가 SSE로 OpenAI 호환 LLM에 프록시합니다.

## 목차

- [개요](#개요)
- [주요 기능](#주요-기능)
- [아키텍처](#아키텍처)
- [빠른 시작](#빠른-시작)
- [설정](#설정)
- [명령어](#명령어)
- [로컬 개발](#로컬-개발)
- [테스트](#테스트)
- [문서](#문서)
- [유지보수](#유지보수)
- [라이선스](#라이선스)
- [상태](#상태)

## 개요

learnprint는 한양사이버대학교 학생의 산발적인 학습 기록을 역량·증거 기반 이력서로
재구성하는 단일 페이지 웹 애플리케이션입니다. 핵심 분류는
`src/lib/ai/analyzer.ts`에 구현된 결정론적 규칙 엔진이 담당하며, 같은 입력에
대해 항상 같은 역량 매핑과 증거 점수를 산출합니다. AI 코칭은 이 결과 위에
선택적으로 첨부되는 보조 수단이며, 분류 근거 자체가 비결정적이 되는 일은
없도록 설계되어 있습니다.

## 주요 기능

- **결정론적 분류**: 로컬 규칙 엔진이 학습 항목마다 동일한 역량·증거 코드를 부여합니다.
- **이력서 렌더링**: 역량 그룹, 학습 항목, 증거 링크를 한 화면에 모아 보여줍니다.
- **다중 내보내기**: Markdown, JSON, 증거 원장(evidence ledger) 세 가지를 지원합니다.
- **선택형 AI 코칭**: `node:http` BFF가 SSE로 LLM 응답을 프록시하고, 키는 서버 측에만 보관합니다.
- **로컬 우선 저장**: 사용자 데이터는 `localStorage`에만 보관되어 네트워크 없이도 동작합니다.
- **GitHub Pages 배포 호환**: `VITE_BASE` 환경 변수로 베이스 경로를 제어합니다.

## 아키텍처

프론트엔드는 feature-sliced 구조이며, BFF는 의도적으로 `node:http`만 사용합니다.

| 영역 | 위치 | 책임 |
|------|------|------|
| UI 진입점 | `src/main.tsx`, `src/App.tsx` | React 마운트와 최상위 레이아웃 |
| 결정론적 엔진 | `src/lib/ai/analyzer.ts` | 역량·증거 분류 (항상 동일 결과) |
| 영속화 | `src/lib/storage/storage.ts` | `localStorage` 추상화 |
| 에이전트 클라이언트 | `src/lib/agent/client.ts` | SSE 구독, 재연결 로직 |
| 이력서 도메인 | `src/features/resume/` | 뷰, 폼, 익스포트 |
| 분석 도메인 | `src/features/analysis/` | 항목 리스트, 입력 폼 |
| AI 패널 | `src/features/agent/` | 코칭 UI |
| 공유 타입 | `src/types/` | `learning`, `resume`, `agent` 계약 |
| 시드 데이터 | `src/data/hycu-seed.json` | HYCU 1학년 기본 항목 |
| BFF | `server/index.ts`, `server/agent-handler.ts` | LLM SSE 프록시, 환경 로딩 |
| 환경/시크릿 | `server/env.ts`, `server/dotenv.ts` | LLM 키 로딩 (브라우저 비공개) |

요청 흐름:

1. 사용자가 학습 항목을 추가/편집하면 `useLearningItems` 훅이 로컬 스토리지를 갱신합니다.
2. `analyzer.ts`가 항목 배열을 받아 역량 코드와 증거 점수를 계산합니다.
3. `features/resume/ResumeView`가 결과를 그룹핑해 렌더링합니다.
4. 내보내기는 `features/resume/exporters.ts`에서 MD / JSON / 원장으로 직렬화합니다.
5. AI 코칭은 `lib/agent/client.ts` → BFF `/api/agent` → OpenAI 호환 LLM 순으로 흐릅니다.

먼저 읽을 파일:

- 제품 지식 베이스: [AGENTS.md](./AGENTS.md), [src/AGENTS.md](./src/AGENTS.md)
- 분류 규칙의 기준선: [src/lib/ai/analyzer.ts](./src/lib/ai/analyzer.ts)
- 도메인 계약: [src/types/learning.ts](./src/types/learning.ts), [resume.ts](./src/types/resume.ts)

## 빠른 시작

요구 사항: Node.js 22 이상, npm.

```bash
npm install
npm run dev
```

기본 포트:

| 서비스 | 포트 |
|--------|------|
| Vite 개발 서버 | 5173 |
| BFF (`npm run serve`) | 4173 |

Vite 개발 서버는 `/api` 경로를 BFF :4173으로 프록시합니다. 규칙은
`vite.config.ts`에 정의되어 있습니다. AI 코칭을 시도하려면 별도 터미널에서
`npm run serve`를 실행하고, `.env`에 LLM 키를 채워주세요.

## 설정

| 변수 | 위치 | 용도 |
|------|------|------|
| `VITE_BASE` | 프론트엔드 빌드 | 정적 자산 베이스 (`/` 또는 `/<repo>/`) |
| LLM 키 (`.env`) | BFF (`server/env.ts`) | AI 코칭 호출용, 브라우저 비공개 |
| `PORT` | BFF | BFF 포트 (기본 4173) |

`.env`는 gitignore 대상이며, 커밋된 템플릿은 저장소 내 `.env.example`을
참고하세요. LLM 키는 절대 브라우저 번들에 포함되지 않습니다.

## 명령어

| 명령어 | 동작 |
|--------|------|
| `npm run dev` | Vite 개발 서버 (HMR) |
| `npm run build` | `tsc -b` + 서버 타입체크 + Vite 빌드 |
| `npm run serve` | 빌드 산출물 정적 서빙 + BFF (:4173) |
| `npm start` | `serve`의 별칭 |
| `npm run preview` | 빌드 결과 로컬 미리보기 |
| `npm test` | Vitest 단일 실행 |
| `npm run test:watch` | Vitest 워치 모드 |
| `npm run typecheck` | 앱 + 서버 타입 검사 |
| `npm run verify:submission` | 공모전 제출 패키지 검증 |
| `npm run verify:readiness` | 제출 준비 상태 점검 |

## 로컬 개발

- 세 개의 tsconfig(`tsconfig.app.json`, `tsconfig.server.json`,
  `tsconfig.node.json`)가 분리되어 있고 `noUnusedLocals`,
  `noUnusedParameters`가 켜져 있습니다. 죽은 코드는 타입 검사에서 실패합니다.
- 테스트는 `*.test.ts(x)`로 소스 옆에 동거하며, 별도 디렉터리는
  `src/test/setup.ts` 하나만 사용합니다.
- 사용자 대면 문자열, 주석, 에러 메시지는 한국어로 작성합니다.
- `analyzer.ts`는 비결정적으로 만들지 않습니다. 동일 입력 → 동일 출력.
- 서버 프레임워크(express, fastify 등)를 새로 도입하지 않습니다. BFF는 의도적으로
  `node:http`만 사용합니다.
- `dist/`는 빌드 산출물이므로 수동으로 편집하지 않습니다.

## 테스트

```bash
npm test                # 단일 실행
npm run test:watch      # 워치 모드
```

Vitest + jsdom 환경이며, React 컴포넌트는 Testing Library로 검증합니다.
`scripts/`의 검증 스크립트(`verify-submission-package.mjs`,
`verify-readiness.mjs`)는 Vitest와 별개로 제출 패키지 무결성을 확인합니다.

## 문서

| 문서 | 위치 |
|------|------|
| AI 활용 증빙 | [docs/ai-evidence.md](./docs/ai-evidence.md) |
| 사례 보고서 | [docs/case-report.md](./docs/case-report.md), [요약](./docs/case-report-summary.md) |
| HYCU 데이터 출처 | [docs/hycu-data-provenance.md](./docs/hycu-data-provenance.md) |
| 샘플 증거 원장 | [docs/sample-evidence-ledger.md](./docs/sample-evidence-ledger.md) |
| 코드 품질 체크리스트 | [docs/code-quality-checklist.md](./docs/code-quality-checklist.md) |
| 제출 체크리스트 | [docs/submission-checklist.md](./docs/submission-checklist.md) |
| 점수 추정 검토 | [docs/score-estimate-review.md](./docs/score-estimate-review.md) |
| 검증 로그 | [docs/verification-log.txt](./docs/verification-log.txt), [build 로그](./docs/submission/build-test-log.txt) |
| 동결 제출 패키지 | [docs/submission/](./docs/submission/) |
| 제품 지식 베이스 | [AGENTS.md](./AGENTS.md), [src/AGENTS.md](./src/AGENTS.md) |
| 협업 절차 | [CONTRIBUTING.md](./CONTRIBUTING.md) |

## 유지보수

| 역할 | 위치 |
|------|------|
| 제품 책임 | 한양사이버대학교 AI 학습법 공모전 제출자 |
| 1차 응답 창구 | 저장소 이슈 트래커 |
| 협업 규칙 | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| 자동 지식 베이스 | [AGENTS.md](./AGENTS.md) |

## 라이선스

저장소는 비공개 공모전 제출 목적으로 운영됩니다. 자세한 조건은
[./LICENSE](./LICENSE)를 참조하세요.

## 상태

마스터 브랜치는 HYCU 2026 AI 학습법 공모전 제출을 위해 동결된 빌드를 기준으로
합니다. 기능 개선은 이슈 트래커에서 별도 라운드로 진행하며, 운영 변경은
`AGENTS.md`와 `docs/`에 먼저 기록한 뒤 코드에 반영합니다.