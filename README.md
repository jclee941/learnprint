# HYCU 학습 이력서 (learnprint)

> 흩어진 학습 경험을 LLM 기반 AI 에이전트가 역량·증거 기반 이력서로 재구성하고, 학습 코칭·면접 대비까지 돕는 웹앱 (오프라인 규칙 기반 폴백 내장)

## 프로젝트 개요

HYCU 학습 이력서(learnprint)는 사이버대학교에서 쌓은 강의·과제·프로젝트·자격증·독학·대회 등 흩어진 학습 경험을 입력하면, **실제 LLM 기반 AI 학습 에이전트**가 이를 역량·증거 기반 "학습 이력서"로 재구성하고 학습 코칭·면접 질문까지 제안하는 웹 애플리케이션입니다. AI 백엔드는 OpenAI 호환 프록시(cliproxy)를 통하며, **API 키는 서버 측(BFF)에만 두어 브라우저로 절대 노출되지 않습니다.** AI 연결이 없을 때를 대비해 결정론적 규칙 기반 분석 엔진을 오프라인 폴백으로 함께 제공합니다. 2026학년도 HYCU AI 학습법 공모전 부문 5 "AI 또는 바이브코딩으로 나만의 학습도구 제작" 출품작입니다.

## 주요 기능

- **학습 경험 입력**: 강의, 과제, 프로젝트, 자격증, 독학, 대회, 기타 카테고리로 학습 흔적을 기록
- **AI 학습 에이전트 (LLM)**: 등록한 학습 이력을 컨텍스트로 주입하여 ① AI 역량 분석·자기소개 문단 작성 ② 학습 코칭 챗봇 ③ 예상 면접질문 생성 — 실시간 스트리밍 응답
- **오프라인 폴백 이력서 생성**: 네트워크/AI 없이도 결정론적 규칙 엔진으로 역량별 그룹화 이력서 생성 (동일 입력 → 동일 결과)
- **데이터 유지**: 브라우저 localStorage에 저장되어 새로고침 후에도 유지
- **내보내기**: Markdown, JSON 파일로 다운로드
- **인쇄**: 브라우저 인쇄 기능으로 깔끔하게 출력

## 설계 원칙

- **API 키 비노출**: LLM API 키는 서버 측 BFF(`server/`)에만 존재하며 브라우저 번들·커밋 파일에 포함되지 않음 (`.env` 는 gitignore, `.env.example` 만 제공)
- **개인정보 보호**: 학습 데이터는 브라우저 localStorage에만 저장. AI 요청은 BFF가 중계하며 쿠키/토큰/학번 미수집
- **오프라인 폴백**: AI 연결 실패 시에도 결정론적 규칙 기반 이력서 생성이 계속 동작
- **환경변수 구성**: `LLM_BASE_URL`·`LLM_API_KEY`·`LLM_MODEL`(기본 gemini-3-flash)·`PORT`

## 기술 스택

- React 19 + Vite 6 + TypeScript (strict)
- Vitest (현재 HEAD 기준 78개 테스트; 공모전 제출 동결본은 50개)
- Node.js `node:http` BFF — OpenAI 호환 LLM(cliproxy) SSE 스트리밍 프록시
- LLM 백엔드: cliproxy (OpenAI/Gemini/Claude/Codex 호환)

## 설치 및 실행

```bash
npm install

# 1) .env 구성 (커밋 금지) — .env.example 복사 후 값 채우기
cp .env.example .env   # LLM_BASE_URL / LLM_API_KEY / LLM_MODEL 설정

# 2) UI 개발 서버 (HMR). /api 는 BFF(4173)로 프록시됨
npm run dev

# 3) AI 백엔드(BFF) — dist 정적 + /api/agent/chat 중계 (포트 4173)
npm run build && npm run serve

# 테스트 / 타입체크
npm test
npm run typecheck
```

## 디렉터리 구조

```
src/
  App.tsx                 # 메인 애플리케이션
  features/
    analysis/             # 학습 경험 입력·목록·분석 패널
    resume/               # 이력서 보기·내보내기·인쇄
  hooks/                  # React hooks (useLearningItems 등)
  lib/
    ai/                   # 결정론적 규칙 기반 분석 엔진 (오프라인 폴백)
    agent/                # AI 에이전트 클라이언트(SSE) + 컨텍스트 빌더
    storage/              # localStorage 저장소
  types/                  # TypeScript 타입 정의
  test/                   # 테스트 설정
```
server/                   # node:http BFF — LLM 키 보호 + cliproxy SSE 프록시
  index.ts                # /healthz, /api/agent/chat, dist 정적 서빙
  env.ts / prompt.ts / cliproxy.ts / agent-handler.ts

## 라이선스 및 면책

- 본 프로젝트는 교육 목적의 출품작입니다.
- 개인정보를 수집하지 않으며 학습 데이터는 기본적으로 브라우저 localStorage에 저장됩니다. AI 학습 에이전트를 사용할 때는 사용자가 입력한 학습 이력 일부가 서버 측 BFF(/api/agent/chat)를 거쳐 LLM API로 전송될 수 있습니다. API key는 서버 .env에만 보관되어 브라우저 번들·저장소에는 포함되지 않습니다. 개인정보·학번·인증정보·비밀번호 등 민감정보는 입력하지 않는 것을 원칙으로 합니다. AI 연결이 없거나 사용하지 않을 때는 결정론적 규칙 기반 분석기가 오프라인 폴백으로 동작합니다.

## 공모전 정보

- **대회**: 2026학년도 HYCU AI 학습법 공모전
- **부문**: 부문 5 - AI 또는 바이브코딩으로 나만의 학습도구 제작
- **형식**: 수기(학습법 사례보고서)
