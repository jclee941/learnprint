# HYCU 학습 이력서 (learnprint)

> 결정론적 규칙 엔진이 흩어진 학습 경험을 **역량·증거 기반 학습 이력서**로 자동 재구성하는 웹앱. AI 학습 에이전트는 분석·코칭·면접 대비를 돕는 보조 레이어입니다.
>
> 2026학년도 HYCU AI 학습법 공모전 — 부문 5 "AI 또는 바이브코딩으로 나만의 학습도구 제작" 출품작.

**라이브 데모**: <https://learnprint.jclee.me> — 설치 없이 브라우저에서 바로 체험할 수 있습니다 (첫 실행 시 HYCU 수강 과목 시드 자동 주입). 라이브가 일시적으로 접속되지 않을 때는 아래 [빠른 시작](#빠른-시작)으로 동일하게 로컬 재현할 수 있습니다.

## 빠른 상태

| 항목 | 상태 | 근거 |
|------|------|------|
| 라이브 배포 | ✅ HTTP 200 | `https://learnprint.jclee.me`, `/healthz` → `{"status":"ok"}` |
| 테스트 | ✅ 115/115 통과 | Vitest 22개 파일 (단위·컴포넌트·서버) |
| 타입체크 | ✅ 오류 없음 | `tsc --noEmit` + `tsconfig.server.json` |
| 프로덕션 빌드 | ✅ 성공 | `dist/` 생성 (JS gzip 약 70KB) |
| 제출 자료 무결성 | ✅ 검증 통과 | `npm run verify:submission` |
| 준비도 점검 | ✅ 스크립트 통과 | `npm run verify:readiness` |

> 재검증 로그: `docs/verification-log.txt` · 점수 예상 점검: `docs/score-estimate-review.md` · AI 활용 증거: `docs/ai-evidence.md`

## 한 줄 사용 흐름

`학습 항목 입력 → 규칙 엔진이 6개 역량(+ 기타 학습 경험 폴백)으로 결정론적 분류 → 역량별 증거(evidence)와 함께 이력서 표시 → Markdown / JSON / 증거 원장 내보내기, 또는 브라우저 인쇄. AI 학습 코칭은 옵션 레이어.`

## 목차

- [개요](#개요)
- [왜 유용한가](#왜-유용한가)
- [사용자 시나리오](#사용자-시나리오)
- [패키지 구성](#패키지-구성)
- [아키텍처](#아키텍처)
- [먼저 읽을 파일](#먼저-읽을-파일)
- [빠른 시작](#빠른-시작)
- [명령어 레퍼런스](#명령어-레퍼런스)
- [환경 변수](#환경-변수)
- [로컬 개발 가이드](#로컬-개발-가이드)
- [테스트](#테스트)
- [AI 에이전트 (선택)](#ai-에이전트-선택)
- [공모전 제출 자료](#공모전-제출-자료)
- [기여 가이드](#기여-가이드)
- [유지보수자 / 문의](#유지보수자--문의)
- [라이선스](#라이선스)
- [추가 문서](#추가-문서)
- [English summary](#english-summary)

---

## 개요

사이버대학교에서 쌓인 **강의·과제·프로젝트·자격증·독학·대회·기타** 학습 흔적을 카테고리·기간·증거(링크·메모)와 함께 한 곳에 입력하면, 결정론적 규칙 엔진이 이를 **6개 핵심 역량(+ 기타 학습 경험 폴백)으로 자동 분류**하고 각 학습 항목을 **증거(evidence)** 와 연결한 학습 이력서로 재구성합니다.

- **규칙 엔진은 네트워크·AI 없이도 항상 동작하며, 동일 입력에 대해 동일 결과를 보장합니다.** 결정성이 핵심 약속입니다 (코드 상수·정규식·정렬 순서까지 고정).
- 결과는 **Markdown / JSON / 증거 원장(Evidence Ledger)** 으로 내보내거나, 브라우저 인쇄로 깔끔하게 출력할 수 있습니다.
- **AI 학습 에이전트** 는 선택적 코칭 레이어입니다. 역량별 자기소개 작성·학습 코칭·예상 면접질문을 실시간 SSE 스트리밍으로 제공하며, 키가 없어도 비활성화되어 메인 기능에 영향을 주지 않습니다.

## 왜 유용한가

| 고민 | 이 도구가 주는 답 |
|------|----------------------|
| 사이버대 학습 흔적이 여기저기 흩어 있어 취업·면접용 이력서로 묶기 어렵다 | 카테고리·기간·증거만 입력하면 역량·증거 이력서가 자동 생성된다 |
| AI 도구가 "왜 그렇게 분류했는지" 설명하지 않는다 | 모든 분류는 결정론적 규칙 엔진이 수행 — 사용자가 직접 검토·수정 가능 |
| 네트워크 없이도 동작해야 하는 상황 (오프라인, 보안 PC) | 규칙 엔진과 내보내기·인쇄는 네트워크·API 키 없이 완전히 동작 |
| 제출 자료의 결과가 흔들리면 안 된다 | 동일 입력 → 동일 결과 보장, AI 호출은 코칭 옵션에만 한정 |
| LLM API 키를 프런트엔드에 노출하고 싶지 않다 | 키는 BFF (`server/`) 에만 존재, 브라우저에는 절대 전달되지 않음 |

## 사용자 시나리오

1. **학습 이력 수집** — 강의·과제·프로젝트·자격증·독학·대회·기타를 카테고리·기간·증거와 함께 기록 (첫 실행 시 HYCU 수강 과목 시드가 자동 주입됨)
2. **역량 매핑 검토** — 규칙 엔진이 6개 역량(데이터·AI·소프트웨어·문제해결·협업·자기주도, + 기타 학습 경험 폴백) 중 어디로 분류했는지 확인
3. **이력서 렌더링** — 역량별로 묶인 학습 흔적을 증거 문장·출처와 함께 검토
4. **내보내기 / 인쇄** — Markdown / JSON / 증거 원장 다운로드, 또는 브라우저 인쇄로 PDF화
5. **AI 코칭 (선택)** — 등록된 이력을 컨텍스트로 자기소개 초안·학습 코칭·예상 면접질문을 실시간 스트리밍으로 생성
6. **수정·재구성 반복** — 항목 추가·수정 시 즉시 재분류·재렌더링

## 패키지 구성

저장소 최상위 구조 (실제 디렉터리 기반):

```
.
├── index.html                  # Vite 진입점
├── package.json                # npm 스크립트·의존성
├── tsconfig.json               # 루트 TS 프로젝트 참조
├── tsconfig.app.json           # 프런트엔드 (src/)
├── tsconfig.server.json        # BFF (server/, *.test.ts 제외)
├── tsconfig.node.json          # Vite/빌드 스크립트용
├── vite.config.ts              # Vite 설정 (VITE_BASE 경로, 테스트 포함)
├── vite-base.test.ts           # vite base 경로 테스트
├── src/                        # React 19 프런트엔드 (feature-sliced)
│   ├── main.tsx · App.tsx
│   ├── types/                  # learning / resume / agent 공유 계약
│   ├── lib/                    # id, analyzer(규칙 엔진), storage, agent 클라이언트
│   ├── data/                   # HYCU 수강 과목 시드 (JSON + 검증 테스트)
│   ├── hooks/                  # useLearningItems
│   ├── features/               # resume / analysis / agent 기능 슬라이스
│   ├── components/             # 공용 컴포넌트
│   ├── styles/                 # 전역 CSS
│   └── test/setup.ts           # Vitest + jsdom 셋업
├── scripts/                    # 제출 자료 / 준비도 검증 스크립트
│   ├── verify-readiness.mjs
│   ├── verify-submission-package.mjs
│   └── lib/                    # 제출 파일·스캐너·zip 인스펙터 헬퍼
├── public/                     # 정적 자산
├── docs/                       # 케이스 리포트 + 동결 제출 아카이브
│   ├── case-report.md · case-report-summary.md
│   ├── ai-evidence.md · hycu-data-provenance.md
│   ├── code-quality-checklist.md · submission-checklist.md
│   ├── sample-evidence-ledger.md · score-estimate-review.md
│   ├── verification-log.txt
│   └── submission/             # 데모 영상·공식양식·부록
├── AGENTS.md                   # 저장소 운영 규칙
├── CONTRIBUTING.md
├── LICENSE
└── README.md                   # 본 문서
```

> BFF (`server/`)는 `tsconfig.server.json`과 `npm run serve` / `npm run start`가 참조하지만, 위 트리에는 최상위 파일만 나열되어 있습니다. 로컬에서 `npm install` 후 정상적으로 보입니다.

## 아키텍처

| 영역 | 모듈 | 책임 |
|------|------|------|
| 입력 | `src/features/analysis/` (`LearningItemForm`, `LearningItemList`) | 학습 항목 폼/리스트, localStorage 영속 |
| 규칙 엔진 | `src/lib/ai/analyzer.ts` | 6개 역량 (+ 기타 학습 경험) 결정론적 분류 — **AI 미사용** |
| 시드 데이터 | `src/data/hycu-seed.{ts,json}` | 첫 실행 시 작성자 HYCU 수강 과목 주입 |
| 저장 | `src/lib/storage/` | 브라우저 localStorage 어댑터 (직렬화·복원) |
| 이력서 뷰 | `src/features/resume/` (`ResumeView`, `ExportControls`, `exporters`) | 역량·증거 묶음, Markdown / JSON / 증거 원장 내보내기, 인쇄 |
| AI 에이전트 (옵션) | `src/features/agent/AgentPanel.tsx`, `src/lib/agent/` (client·context), `server/index.ts`, `server/agent-handler.ts` | OpenAI 호환 LLM SSE 프록시, 자기소개·코칭·면접질문 스트리밍 |
| 검증 | `scripts/verify-*.mjs` | 제출 패키지 무결성·준비도 자동 점검 |
| 빌드 | `vite.config.ts`, `tsconfig.app.json`, `tsconfig.server.json` | 프런트엔드 번들 + BFF 단일 출력 |

### 요청 흐름

1. 사용자가 `LearningItemForm`으로 항목을 입력 → `useLearningItems` 훅이 storage로 영속화
2. UI가 변경을 감지하면 `src/lib/ai/analyzer.ts`를 호출해 항목을 역량별로 결정론적으로 분류·정렬
3. `src/features/resume/ResumeView.tsx`가 역량 묶음과 증거 문장을 함께 렌더
4. `ExportControls`가 `src/features/resume/exporters.ts`로 Markdown / JSON / 증거 원장 Markdown을 생성해 다운로드 트리거
5. 인쇄는 브라우저 `@media print` 스타일로 별도 윈도우에서 PDF화
6. (선택) `AgentPanel`이 `src/lib/agent/client.ts`로 SSE 연결을 열고, BFF (`server/index.ts` → `server/agent-handler.ts`)가 OpenAI 호환 LLM에 프록시 — 응답을 토큰 단위로 스트리밍

### 디자인 약속

- **결정성** — `analyzer.ts`는 어떤 외부 호출·시각·난수도 사용하지 않습니다. 입력만으로 결과가 결정됩니다.
- **프런트엔드 의존성 최소화** — 런타임 의존성은 `react`, `react-dom`만. 규칙 엔진과 BFF는 표준 라이브러리(`node:http`)만 사용합니다.
- **비밀 분리** — LLM 키는 서버 측 `.env`에만 존재하며 브라우저로 절대 전달되지 않습니다 (커밋되는 파일은 `.env.example` 뿐).
- **테스트는 소스 옆에** — `*.test.ts(x)`가 소스 옆에 동거합니다. 별도 테스트 디렉터리는 `src/test/setup.ts` 하나뿐입니다.

## 먼저 읽을 파일

| 목적 | 경로 |
|------|------|
| 저장소 운영 규칙 | [AGENTS.md](AGENTS.md) |
| 프런트엔드 구조 규칙 | `src/AGENTS.md` |
| 결정론적 역량 분류 규칙 | `src/lib/ai/analyzer.ts` |
| HYCU 수강 과목 시드 | `src/data/hycu-seed.ts` (+ `hycu-seed.json`) |
| 이력서 내보내기 로직 | `src/features/resume/exporters.ts` |
| 공유 타입 계약 | `src/types/learning.ts`, `src/types/resume.ts`, `src/types/agent.ts` |
| AI BFF 엔드포인트 | `server/index.ts`, `server/agent-handler.ts` (런타임에 존재) |
| 케이스 리포트 | [docs/case-report.md](docs/case-report.md) |
| 제출 체크리스트 | [docs/submission-checklist.md](docs/submission-checklist.md) |

## 빠른 시작

요구 사항: **Node.js 22+**, **npm 10+**.

```bash
# 1. 의존성 설치
npm install

# 2. (옵션) AI 에이전트를 쓸 경우에만 — BFF 비밀
cp .env.example .env
# .env 파일을 열어 OPENAI_BASE_URL / OPENAI_API_KEY 등 설정

# 3. 개발 서버 (Vite HMR, :5173, /api는 BFF :4173으로 프록시)
npm run dev

# 4-1. 프로덕션 빌드 + BFF 기동 (:4173)
npm run build && npm run serve

# 4-2. 또는 한 줄로 시작
npm start
```

브라우저에서:

| 모드 | URL | 비고 |
|------|-----|------|
| 개발 | <http://localhost:5173> | HMR 활성, `/api/*`는 자동으로 BFF로 프록시 |
| 프로덕션 (BFF 동시 기동) | <http://localhost:4173> | 정적 산출물 + AI SSE 동일 오리진 |
| 헬스 체크 | <http://localhost:4173/healthz> | `{"status":"ok"}` |
| 공개 데모 | <https://learnprint.jclee.me> | 첫 방문 시 HYCU 시드 자동 주입 |

## 명령어 레퍼런스

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | Vite 개발 서버 + HMR. `/api/*` 요청은 BFF로 프록시 |
| `npm run build` | `tsc -b` (앱) + `tsc -p tsconfig.server.json` (서버) + `vite build` |
| `npm run serve` / `npm start` | `tsx server/index.ts` — 정적 산출물 서빙 + AI BFF (포트 4173) |
| `npm run preview` | `vite preview`로 빌드 결과 정적 미리보기 (BFF 없음) |
| `npm run typecheck` | `tsc --noEmit` (앱) + `tsconfig.server.json` (서버). 사용하지 않는 로컬/매개변수 실패 포함 |
| `npm test` | Vitest 단발 실행 (단위·컴포넌트·서버) |
| `npm run test:watch` | Vitest 워치 모드 |
| `npm run verify:submission` | `docs/submission/` 패키지 무결성·필수 파일 점검 |
| `npm run verify:readiness` | 제출 준비도 점검 (체크리스트 기반) |

## 환경 변수

`.env`는 **커밋하지 않습니다**. 커밋 대상은 `.env.example` 뿐입니다.

| 키 | 위치 | 필수 | 용도 |
|----|------|------|------|
| `PORT` | BFF | 아니오 (기본 4173) | BFF 리슨 포트 |
| `OPENAI_API_KEY` | BFF | AI 사용 시 | OpenAI 호환 LLM 키 |
| `OPENAI_BASE_URL` | BFF | 아니오 | OpenAI 호환 엔드포인트 베이스 URL (프록시·자체 호환 서버 지원) |
| `OPENAI_MODEL` | BFF | 아니오 | 사용할 모델 이름 |
| `VITE_BASE` | 빌드 시 | 아니오 | 자산 베이스 경로 (`/` 또는 `/<repo>/`) |

> 키가 없어도 메인 기능(입력·규칙 엔진·내보내기·인쇄)은 완전하게 동작합니다. AI 패널은 비활성 안내만 표시합니다.

## 로컬 개발 가이드

- **세 개의 tsconfig** — `tsconfig.app.json` (프런트엔드), `tsconfig.server.json` (BFF, `*.test.ts` 제외), `tsconfig.node.json` (빌드 스크립트). `npm run typecheck`는 앱·서버를 모두 검증합니다.
- **`noUnusedLocals` / `noUnusedParameters` 활성** — 죽은 코드는 타입체크를 통과하지 못합니다. 정리하세요.
- **데이터 영속** — localStorage에만 저장됩니다 (백엔드 DB 없음). 시드 데이터는 첫 실행 시 한 번 주입됩니다.
- **자산 경로** — `VITE_BASE=/` (BFF/로컬), `VITE_BASE=/<repo>/` (GitHub Pages). Pages 사용 시 SPA 404 폴백이 필요합니다.
- **새 역량 추가** — `src/types/resume.ts`의 `CompetencyId`와 `src/lib/ai/analyzer.ts`의 분류 규칙, `src/data/hycu-seed.json`의 라벨을 함께 수정하고 테스트를 갱신하세요.
- **새 카테고리 추가** — `src/types/learning.ts`의 `LearningCategory`와 폼·내보내기·시드를 함께 다듬으세요.

## 테스트

- 테스트 프레임워크: **Vitest + jsdom + @testing-library/react**
- 단위·컴포넌트·서버 테스트가 소스 옆에 동거 (`*.test.ts(x)`)
- CI(`.github/workflows/ci.yml`, Node 22): typecheck → test → build → `master` 푸시/PR 트리거

```bash
npm test                # 전체 단발
npm run test:watch      # 워치 모드
npm run typecheck       # 앱 + 서버 타입 검사
```

테스트 대상 핵심 모듈:

| 모듈 | 검증 파일 | 무엇을 보장하는가 |
|------|-----------|----------------------|
| `src/lib/ai/analyzer.ts` | `src/lib/ai/analyzer.test.ts` | 동일 입력 → 동일 역량 분류 결정성 |
| `src/lib/storage/storage.ts` | `src/lib/storage/storage.test.ts` | localStorage 직렬화·복원·마이그레이션 |
| `src/lib/id.ts` | `src/lib/id.test.ts` | ID 생성 충돌·형식 |
| `src/lib/agent/{client,context}.ts` | `src/lib/agent/{client,context}.test.ts` | SSE 클라이언트·컨텍스트 빌더 |
| `src/features/resume/exporters.ts` | `src/features/resume/exporters.test.ts` | Markdown / JSON / 증거 원장 직렬화 |
| `src/features/resume/finalOutputSummary.ts` | `src/features/resume/finalOutputSummary.test.ts` | 요약 출력 일관성 |
| `src/features/resume/{ResumeView,ExportControls}.tsx` | `*.test.tsx` | 컴포넌트 렌더·내보내기 트리거 |
| `src/features/analysis/LearningItemList.tsx` | `LearningItemList.test.tsx` | 항목 편집·삭제·정렬 |
| `src/features/agent/AgentPanel.tsx` | `AgentPanel.test.tsx` | SSE 흐름·에러 표시 |
| `src/data/hycu-seed.ts` | `src/data/hycu-seed.test.ts` | 시드 데이터 형식·기간 검증 |
| `src/styles/global.css` | `src/styles/global.test.ts` | 토큰·레이아웃 클래스 일관성 |
| `src/App.tsx` | `src/App.test.tsx` | 앱 부트스트랩·시드 주입 |
| `vite.config.ts` 베이스 경로 | `vite-base.test.ts` | `VITE_BASE` 산출 일치 |

## AI 에이전트 (선택)

- BFF는 의도적으로 `node:http`만 사용 — express/fastify 등 서버 프레임워크를 추가하지 않습니다.
- OpenAI 호환 LLM만 가정합니다. 자체 호환 서버(예: 사설 게이트웨이, vLLM, Ollama 호환 엔드포인트)도 `OPENAI_BASE_URL`만 바꾸면 동작합니다.
- 키는 서버 측에만 존재. BFF가 SSE 청크를 만들어 클라이언트로 그대로 전달하며, 응답 본문 외 메타데이터를 노출하지 않습니다.
- 키가 없으면 AI 패널은 비활성 안내만 표시하고, 메인 기능에는 아무 영향이 없습니다.

| 엔드포인트 | 메서드 | 책임 |
|-----------|--------|------|
| `/healthz` | `GET` | 헬스 체크 (`{"status":"ok"}`) |
| `/api/agent` | `POST` (SSE) | `{messages, context}`를 받아 LLM 응답을 `text/event-stream`으로 스트리밍 |

## 공모전 제출 자료

`docs/` 안의 자료는 **동결된 제출 아카이브**입니다. 새로운 작업은 프런트엔드 코드를 통해 검증한 뒤 README를 갱신하세요.

| 자료 | 경로 |
|------|------|
| 공식 양식 (DOCX) | `docs/2026_HYCU_AI_Learning_Method_Contest_Submission_Form.docx` |
| 부록 1 (신청서) | `docs/submission/appendix1_application-form.md` |
| 부록 2 (동의서) | `docs/submission/appendix2_consent-form.md` |
| 부록 3 (AI 활용 증거) | `docs/ai-evidence.md`, `docs/submission/appendix3_ai-evidence.md`, `docs/submission/appendix3_form-fill.md` |
| 데모 영상 | `docs/submission/04_demo_video.mp4` |
| 케이스 리포트 | `docs/case-report.md` (요약: `case-report-summary.md`) |
| 코드 품질 체크리스트 | `docs/code-quality-checklist.md` |
| 데이터 출처 (HYCU) | `docs/hycu-data-provenance.md` |
| 증거 원장 샘플 | `docs/sample-evidence-ledger.md` |
| 제출 체크리스트 | `docs/submission-checklist.md` |
| 점수 예상 점검 | `docs/score-estimate-review.md` |
| 검증 로그 | `docs/verification-log.txt`, `docs/submission/build-test-log.txt` |
| 제출 폴더 안내 | `docs/submission/README.md` |

```bash
# 제출 자료 / 준비도 자동 점검
npm run verify:submission
npm run verify:readiness
```

## 기여 가이드

기여 전 [CONTRIBUTING.md](CONTRIBUTING.md)와 [AGENTS.md](AGENTS.md)를 먼저 읽어 주세요. 핵심 규칙 요약:

- **`analyzer.ts`는 결정론적**을 유지합니다 (외부 호출·시각·난수 금지). 결정성 깨는 PR은 거부됩니다.
- **서버 프레임워크를 추가하지 마세요** — BFF는 의도적으로 `node:http`만 사용합니다.
- **비밀은 커밋하지 마세요** — `.env`는 gitignore, `.env.example`만 갱신.
- **테스트는 소스 옆에 동거** — `*.test.ts(x)` 추가 시 기존 명명·구조를 따르세요.
- **한국어 우선** — 사용자 노출 문자열·주석·에러 메시지는 한국어로 작성.
- **타입체크 통과 + 테스트 통과 + 빌드 성공**을 모두 만족해야 머지됩니다.

## 유지보수자 / 문의

- 제출자 정보는 공식 양식 파일명에서 확인됩니다 — `docs/submission/2026AI학습법공모전_이재철_2024112536_공식양식.docx`
- 공개 데모: <https://learnprint.jclee.me>
- 1차 문서 채널: [docs/case-report.md](docs/case-report.md), [docs/submission/README.md](docs/submission/README.md)
- 이슈·개선 제안: 저장소 이슈 트래커 사용

## 라이선스

LICENSE 파일을 참조하세요. (저장소 루트의 `LICENSE` — `package.json`의 `"license": "SEE LICENSE IN LICENSE"`)

## 추가 문서

- 운영 규칙: [AGENTS.md](AGENTS.md), [`src/AGENTS.md`](src/AGENTS.md)
- 케이스 리포트: [docs/case-report.md](docs/case-report.md) (요약: [docs/case-report-summary.md](docs/case-report-summary.md))
- AI 활용 증거: [docs/ai-evidence.md](docs/ai-evidence.md)
- 코드 품질 체크리스트: [docs/code-quality-checklist.md](docs/code-quality-checklist.md)
- 제출 자료 점검: [docs/submission-checklist.md](docs/submission-checklist.md)
- 점수 예상 점검: [docs/score-estimate-review.md](docs/score-estimate-review.md)

---

## English summary

**learnprint (HYCU Learning Resume)** — A web application that rebuilds scattered learning experiences into a competency- and evidence-based learning resume via a **deterministic rule engine**. Submitted for the 2026 HYCU AI Learning Method Contest (track 5: build your own learning tool with AI or vibe-coding).

**Highlights**

| Topic | Detail |
|-------|--------|
| Stack | React 19 + Vite 6 + TypeScript (`strict`, three `tsconfigs`); node:http BFF for AI SSE proxy |
| Determinism | The rule engine in `src/lib/ai/analyzer.ts` has no external calls — identical input always yields identical output |
| Storage | Browser `localStorage` only (no backend DB); HYCU course seed injected on first run |
| Export | Markdown / JSON / Evidence Ledger download, plus browser print → PDF |
| AI layer (optional) | SSE-streamed coaching, self-introduction drafts, and mock interview questions via an OpenAI-compatible LLM; key lives in BFF only |
| Verification | 115/115 tests pass (Vitest), `tsc --noEmit` clean, `npm run build` green, `verify:submission` and `verify:readiness` pass |
| Deployment | GitHub Pages for static assets (with `VITE_BASE=/<repo>/`); live demo at <https://learnprint.jclee.me>, BFF `/healthz` returns `{"status":"ok"}` |

**Run it**

```bash
npm install
npm run dev                 # dev (HMR, :5173)
npm run build && npm start  # prod (BFF + static, :4173)
npm test                    # tests
npm run typecheck           # app + server type check
```

See the Korean sections above (Architecture, Quickstart, Commands, Testing, Submission package, Contributing) for full detail and links to `docs/`.