markdown
# learnprint — HYCU 학습 이력서

> 흩어진 학습 경험을 결정론적 규칙 엔진이 역량·증거 기반 이력서로 재구성합니다.
> AI 코칭은 옵션 보조 수단이며, 본 프로젝트는 **2026 HYCU AI 학습법 공모전** 출품작입니다.

![Status: Contest submission](https://img.shields.io/badge/status-contest_submission-1f6feb)
![React 19](https://img.shields.io/badge/React-19-149eca)
![Vite 6](https://img.shields.io/badge/Vite-6-646cff)
![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178c6)
![Node 22 BFF](https://img.shields.io/badge/Node-22%20BFF-339933)
![License: Custom](https://img.shields.io/badge/license-SEE_LICENSE-orange)

## 한눈에 보기

| 항목 | 값 |
| --- | --- |
| 제품명 | learnprint (HYCU 학습 이력서) |
| 핵심 가치 | 결정론적 규칙 엔진으로 학습 이력을 역량·증거 기반 이력서로 재구성 |
| AI 보조 | OpenAI 호환 LLM SSE 프록시 (BFF, 키는 서버 측에만 보관) |
| 프런트엔드 | React 19 + Vite 6 + TypeScript strict |
| 백엔드 | `node:http` BFF — Express/Fastify 미사용 |
| 영속화 | 브라우저 `localStorage` 전용 (서버 DB 없음) |
| 시드 데이터 | `src/data/hycu-seed.json` |
| 검증 | `npm run verify:readiness` 통과 |
| 제출 검증 | `npm run verify:submission` |
| 배포 | GitHub Pages (SPA 404 폴백 포함) |
| 라이선스 | 커스텀 — [`LICENSE`](LICENSE) 참조 |

## 동작 흐름

1. 사용자가 학습 항목(강의·프로젝트·자격·봉사 등)을 입력 또는 시드 데이터로 부트스트랩.
2. `src/lib/ai/analyzer.ts` 결정론적 규칙 엔진이 역량 태그·증거·요약을 산출 (동일 입력 → 동일 출력).
3. `src/features/resume/`이 Markdown·JSON·증거 원장 출력으로 이력서를 조립.
4. (옵션) `src/features/agent/AgentPanel`이 BFF `/api/agent` SSE 스트림으로 코칭을 수신.
5. BFF(`node:http`)가 OpenAI 호환 LLM에 프록시하고 키는 서버 측 `.env`에만 보관.

## 다음에 실행할 명령

```bash
npm install
cp .env.example .env   # 코칭 기능을 쓸 때만 (선택)
npm run dev            # Vite HMR + /api → BFF :4173 프록시
npm run verify:readiness # test · typecheck · build → 표준 준비 로그
```

## 목차

- [목적과 패키지 구성](#목적과-패키지-구성)
- [상태](#상태)
- [먼저 읽을 파일](#먼저-읽을-파일)
- [API와 진입점](#api와-진입점)
- [빠른 시작](#빠른-시작)
- [명령 참조](#명령-참조)
- [구성](#구성)
- [로컬 개발](#로컬-개발)
- [테스트](#테스트)
- [문서](#문서)
- [기여 가이드](#기여-가이드)
- [유지보수와 연락처](#유지보수와-연락처)
- [라이선스](#라이선스)
- [English Summary](#english-summary)

## 목적과 패키지 구성

learnprint는 흩어진 학습 기록(강의·프로젝트·자격증·봉사 등)을 표준화된 **역량·증거 기반 이력서**로 재구성하는 단일 페이지 웹 앱입니다. 핵심은 비결정론적 LLM에 의존하지 않는 **결정론적 규칙 엔진**이며, AI 코칭은 보조 수단으로만 제공됩니다.

- 학습 항목 입력·편집·삭제 (HYCU 시드로 부트스트랩)
- 결정론적 역량 분류 및 증거 매핑
- 이력서 미리보기 + Markdown / JSON / 증거 원장 내보내기
- 옵션 AI 코칭 패널 (OpenAI 호환 LLM, SSE 스트리밍)
- 인쇄 친화 CSS (`src/styles/print.css`)

```
src/        프런트엔드 (React, feature-sliced)
scripts/    준비·제출 검증기
docs/       사례 보고서·제출 패키지·증거 문서
public/     정적 자산
```

서측 컴포넌트(BFF)는 `server/index.ts` 및 `server/agent-handler.ts`에 위치하며 `npm run serve`로 기동됩니다 (자세한 위치는 [API와 진입점](#api와-진입점) 참조).

## 상태

- **제출 단계**: 2026 HYCU AI 학습법 공모전 출품 준비 완료.
- **빌드/테스트**: `npm run verify:readiness`가 표준 HEAD 검증 로그를 생성.
- **제출 패키지**: `npm run verify:submission`이 `docs/` 산출물의 시크릿 누출과 무결성을 점검.
- **프로덕션 배포**: `.github/workflows/deploy-pages.yml`로 GitHub Pages 자동 배포.

## 먼저 읽을 파일

| 작업 | 위치 |
| --- | --- |
| 결정론적 역량 분류 | `src/lib/ai/analyzer.ts` |
| HYCU 시드 데이터 | `src/data/hycu-seed.ts`, `src/data/hycu-seed.json` |
| 이력서 내보내기 | `src/features/resume/exporters.ts` |
| AI 에이전트 SSE | `server/agent-handler.ts`, `server/index.ts` |
| LLM 환경/시크릿 | `server/env.ts`, `server/dotenv.ts` |
| 공유 타입 계약 | `src/types/{learning,resume,agent}.ts` |
| 준비 로그 생성 | `scripts/verify-readiness.mjs` |
| 제출 무결성 | `scripts/verify-submission-package.mjs`, `scripts/lib/` |
| 보조 라이브러리 | `src/lib/storage`, `src/lib/agent`, `src/lib/id` |

## API와 진입점

| 진입점 | 경로 | 역할 |
| --- | --- | --- |
| 앱 부트 | `src/main.tsx` → `src/App.tsx` | React 19 루트 |
| 규칙 엔진 | `src/lib/ai/analyzer.ts` | 결정론적 분류 |
| 에이전트 클라이언트 | `src/lib/agent/client.ts` | SSE 수신 |
| AI 코칭 패널 | `src/features/agent/AgentPanel.tsx` | UI |
| 이력서 패널 | `src/features/resume/ResumeView.tsx` | 미리보기/내보내기 |
| 입력/분석 패널 | `src/features/analysis/AnalysisPanel.tsx` | 항목 입력·분류 |
| BFF 부트 | `server/index.ts` | `node:http` 서버 |
| AI 엔드포인트 | `POST /api/agent` (SSE) | LLM 프록시 |
| 정적 자산 베이스 | `VITE_BASE` | `/` 또는 `/<repo>/` |

## 빠른 시작

요구 사항: Node.js 22+ 및 npm.

```bash
npm install
cp .env.example .env     # LLM 키 등 (코칭 기능을 쓸 때만)
npm run dev              # http://localhost:5173 (HMR) + BFF :4173
```

AI 코칭을 사용하지 않는 경우 `.env` 없이도 학습 입력·규칙 엔진·이력서 내보내기는 동작합니다.

## 명령 참조

| 명령 | 용도 |
| --- | --- |
| `npm run dev` | Vite 개발 서버 (HMR), `/api` → BFF `:4173` 프록시 |
| `npm run build` | 타입체크 + 서버 빌드 + Vite 프로덕션 빌드 |
| `npm run serve` | 정적 서빙 + AI BFF (프로덕션 실행) |
| `npm start` | `serve`의 별칭 |
| `npm run preview` | Vite 프리뷰 서버 |
| `npm test` | Vitest 단일 실행 |
| `npm run test:watch` | Vitest 워치 모드 |
| `npm run typecheck` | 앱 + 서버 타입체크 |
| `npm run verify:readiness` | 테스트·타입체크·빌드 통합 → 표준 준비 로그 |
| `npm run verify:submission` | `docs/` 제출 패키지 시크릿·무결성 검증 |

## 구성

| 키 | 위치 | 설명 |
| --- | --- | --- |
| `VITE_BASE` | 환경 변수 | 자산 베이스 경로 (`/` 또는 `/<repo>/`) |
| `LLM_*` | 서버 `.env` | OpenAI 호환 LLM 엔드포인트/키 |
| HYCU 시드 | `src/data/hycu-seed.json` | 학습 이력 부트스트랩 |

`.env`, 개인 키, 액세스 토큰은 커밋 금지 — 템플릿은 `.env.example`만 저장소에 포함됩니다.

## 로컬 개발

- TypeScript strict + `noUnusedLocals`/`noUnusedParameters` — 사용하지 않는 코드는 타입체크에서 실패합니다.
- 테스트는 소스 옆에 `*.test.ts(x)`로 배치 (Vitest, 기본 jsdom). Node 전용 테스트는 `// @vitest-environment node` 명시.
- 사용자 노출 문자열·주석·에러 메시지는 한국어로 작성.
- 런타임 의존성은 React 19만 허용. 서버는 `node:http` 표준 라이브러리만 사용 (Express/Fastify 등 추가 금지).
- `dist/`는 수동 편집하지 않습니다.

## 테스트

```bash
npm test                  # 전체 단일 실행
npm run test:watch        # 워치 모드
npm run verify:readiness  # test · typecheck · build 통합
```

테스트는 단위(규칙 엔진·스토리지·익스포터)와 컴포넌트(`*.test.tsx`)를 포함합니다. 변경 후 `verify:readiness`로 표준 HEAD 검증 로그를 갱신하세요.

## 문서

- 사례 보고서: [`docs/case-report.md`](docs/case-report.md)
- 사례 보고서 요약: [`docs/case-report-summary.md`](docs/case-report-summary.md)
- AI 증거 정리: [`docs/ai-evidence.md`](docs/ai-evidence.md)
- 코드 품질 체크리스트: [`docs/code-quality-checklist.md`](docs/code-quality-checklist.md)
- 데이터 출처: [`docs/hycu-data-provenance.md`](docs/hycu-data-provenance.md)
- 증거 원장 샘플: [`docs/sample-evidence-ledger.md`](docs/sample-evidence-ledger.md)
- 제출 양식(참고): [`docs/2026_HYCU_AI_Learning_Method_Contest_Submission_Form.docx`](docs/2026_HYCU_AI_Learning_Method_Contest_Submission_Form.docx)
- AI 에이전트 운영 메모: [`src/AGENTS.md`](src/AGENTS.md), [`AGENTS.md`](AGENTS.md), [`docs/AGENTS.md`](docs/AGENTS.md), [`scripts/AGENTS.md`](scripts/AGENTS.md)

## 기여 가이드

1. 저장소 이슈 또는 작업 항목을 먼저 생성.
2. 작업 브랜치에서 변경 후 `npm run verify:readiness` 통과 확인.
3. 커밋 메시지는 한국어 또는 영문으로 의도·검증 결과를 명시.
4. 절차가 있다면 [`CONTRIBUTING.md`](CONTRIBUTING.md)를 우선 적용.

규칙 엔진의 결정론성을 깨는 변경은 거부될 수 있습니다. 새 의존성 추가는 React 런타임 외에는 신중히 검토합니다.

## 유지보수와 연락처

- 제품·공모전 담당: learnprint 제출팀.
- 이슈 트래커: 저장소 Issues 탭.
- 보안: 시크릿은 절대 커밋하지 마세요. 누출 발견 시 즉시 회전·삭제하고 이슈로 보고.

## 라이선스

저장소 루트의 [`LICENSE`](LICENSE) 파일을 참조하세요. 본 프로젝트는 공모전 출품작으로 커스텀 라이선스를 사용합니다.

## English Summary

learnprint is a single-page web app submitted to the **2026 HYCU AI Learning Method Contest**. It reconstructs scattered learning records into a competency- and evidence-based resume using a **deterministic rule engine**. An optional AI coaching layer proxies SSE requests through a `node:http` BFF to an OpenAI-compatible LLM; the rule engine itself never depends on the LLM.

- Deterministic classification in `src/lib/ai/analyzer.ts` (same input → same output)
- React 19 + Vite 6 + TypeScript strict frontend, feature-sliced
- Stdlib-only BFF (`node:http`); no Express/Fastify
- Browser `localStorage` only — no backend database
- Optional SSE AI coaching with server-side secrets

### Quick start

```bash
npm install
npm run dev
npm run verify:readiness
```

See [Commands Reference](#명령-참조) for the full list. Full documentation lives under [`docs/`](docs/).