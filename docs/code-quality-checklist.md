# 코드 품질 개선 체크리스트 (Code-Quality Improvements Checklist)

> learnprint — 공모전 제출(검증 커밋 `b0d438b`) **이후** 진행한 코드 품질 개선 작업의 항목·근거·검증 상태 기록.
> 본 작업은 제출 패키지(`docs/submission/`, 50개 테스트 기준으로 동결)에 포함되지 않는 **제출 이후 개선**입니다.

## 요약

| 항목 | 값 |
|------|-----|
| 기준 커밋 (제출 검증본) | `b0d438b` |
| 개선 커밋 범위 | `4131856` … `6eac233` (10개 커밋) |
| 변경 규모 | 20개 파일, +821 / −47 |
| 테스트 | 50개 → **90개** (20개 파일) 전부 통과 |
| 타입체크 | `tsc --noEmit && tsc -p tsconfig.server.json` 통과 |
| 빌드 | `vite build` 정상 |
| 검토 | Oracle 리뷰 1차 지적(3건) 수정 후 재검증 통과 |

검증 재현:

```bash
npm test         # 90 passed (20 files)
npm run typecheck
npm run build
```

---

## 1. 안정성 / 견고성 (Robustness)

- [x] **F1. localStorage 예외 내성** — `4131856`
  - 파일: `src/lib/storage/storage.ts`, `src/lib/storage/storage.test.ts`
  - 무엇: `getItem`/`setItem`/`removeItem`를 `try/catch`로 감쌈. 읽기는 안전한 기본값(`[]`/`false`) 반환, 쓰기/삭제는 실패 시 무시(no-op).
  - 왜: 사생활 보호 모드·용량 초과(QuotaExceeded)·저장소 비활성 환경에서 `useLearningItems` effect가 앱 렌더를 크래시시키던 문제 방지.
  - 검증: 단위 테스트(getItem throw → 기본값, setItem throw → no-throw).

- [x] **F7. 손상된 SSE JSON 블록 건너뛰기** — `265197c`, `94a4db0`
  - 파일: `src/lib/agent/client.ts`, `server/cliproxy.ts`(+ 각 테스트)
  - 무엇: 블록 단위 `JSON.parse`를 `try/catch`로 보호 — 잘못된 `data:` 한 블록은 건너뛰고 스트림을 계속 처리.
  - 왜: 단일 비정상 청크가 전체 AI 응답 스트림을 중단시키던 문제 방지. 명시적 `{error}` 페이로드 처리는 그대로 유지.
  - 검증: client/cliproxy 테스트(정상 A → 손상 → 정상 B → done; 출력 "AB", onError 미호출).

- [x] **F8. AI 요청 취소 / 오래된 콜백 무시** — `94a4db0`, `8e8b9e3`
  - 파일: `src/lib/agent/client.ts`, `src/features/agent/AgentPanel.tsx`(+ 테스트)
  - 무엇: `streamAgentChat`에 선택적 `AbortSignal` 추가. `AgentPanel`은 `AbortController` + `requestId` + `mountedRef`로 이전 요청 취소·언마운트 시 취소·오래된 콜백 무시·`AbortError` 조용히 처리. 완료 시 `abortRef` 정리.
  - 왜: 연속 요청/언마운트 시 경쟁 상태(stale state, setState-after-unmount) 방지.
  - 검증: AgentPanel 테스트(abort signal 전달, 언마운트 abort, 언마운트 후 콜백 무시·경고 없음), client 테스트(silent AbortError).

---

## 2. 서버 / 보안 (Server & Security)

- [x] **F2. 정적 파일 경로 강화** — `b4279e5`
  - 파일: `server/static.ts`, `server/static.test.ts`
  - 무엇: `decodeURIComponent`를 `try/catch`로 보호(잘못된 `%` 이스케이프 → `index.html` 폴백). 컨테인먼트 체크를 `startsWith(root)`에서 `path.relative()` 기반(`..`/절대경로 거부)으로 교체.
  - 왜: 잘못된 URI로 핸들러 크래시 방지, 경로 탈출(traversal) 방어 강화(`/tmp/dist` vs `/tmp/dist2` 접두사 혼동 제거).
  - 검증: static 테스트(malformed URI 폴백, 상대경로 탈출 거부, 정상 자산 서빙).

- [x] **F3. /api/agent/chat 요청 검증 + 크기 제한** — `4002dec`, `b8dde4e`
  - 파일: `server/validation.ts`(신규), `server/read-body.ts`(신규), `server/index.ts`(+ `validation.test.ts`, `read-body.test.ts`)
  - 무엇: SSE 헤더를 보내기 **전에** 본문 검증 — `mode` 열거값, `messages` 형식·개수·내용 길이, `items` 배열을 확인하고 위반 시 `400 JSON` 반환. 1MB 본문 크기 제한 초과 시 `413 JSON`(소켓을 파괴하지 않고 `pause` → 응답 작성). 클라이언트 오류 문구는 일반화(상위 LLM URL/키 미노출).
  - 왜: 신뢰할 수 없는 입력에 의한 자원 남용·TypeError 경로·정보 노출 방지.
  - 검증: validation 단위 테스트 9건, read-body 테스트 3건; curl SURFACE — invalid mode/json/empty → `400 JSON`, oversized → `413 JSON {"error":"요청 본문이 너무 큽니다."}`, valid → `200 text/event-stream`.

---

## 3. 접근성 / UX (Accessibility & UX)

- [x] **F4. 삭제 버튼 항목별 접근성 레이블** — `1bdfb1c`
  - 파일: `src/features/analysis/LearningItemList.tsx`(+ 테스트)
  - 무엇: 각 삭제 버튼에 `aria-label={`${item.title} 삭제`}` 부여(표시 텍스트는 "삭제" 유지).
  - 왜: 스크린리더·음성 제어 사용자가 어떤 항목을 삭제하는지 구분 가능.
  - 검증: RTL 테스트(`getByRole("button", { name: "<제목> 삭제" })`), 브라우저 접근성 스냅샷.

- [x] **F5. 버튼·링크 포커스 가시성(focus-visible) 링** — `74460c9`
  - 파일: `src/styles/global.css`(+ `global.test.ts`)
  - 무엇: 공통 `button:focus-visible, a:focus-visible` 포커스 링(`--focus-ring` 토큰 + outline) 추가. 기존 hover/disabled 스타일 보존.
  - 왜: 키보드 사용자에게 일관된 포커스 표시(전달성/사용성 향상).
  - 검증: CSS 존재 테스트, 브라우저에서 `matches(:focus-visible)` + 2px outline 확인.

- [x] **F6. AI 응답 영역 aria-busy** — `94a4db0`
  - 파일: `src/features/agent/AgentPanel.tsx`(+ 테스트)
  - 무엇: 로딩/스트리밍 중 응답 영역에 `aria-busy={true}` 부여(기존 `aria-live="polite"` 유지).
  - 왜: 보조기술에 진행 상태 노출.
  - 검증: RTL 테스트, 브라우저 DOM 속성 확인.

---

## 4. 정확성 (Correctness)

- [x] **F9. 증거 링크 엄격 판별(http/https)** — `1bdfb1c`
  - 파일: `src/features/analysis/LearningItemList.tsx`(+ 테스트)
  - 무엇: 링크 판별을 `startsWith("http")`에서 `startsWith("http://") || startsWith("https://")`로 강화.
  - 왜: `http-not-a-url` 같은 문자열이 잘못된 링크로 렌더되던 문제 방지.
  - 검증: RTL 테스트(`https://…` → anchor, `http-not-a-real-url` → 일반 텍스트).

---

## 5. 문서 / 정책 (Docs & Policy)

- [x] **제출 패키지 동결(frozen) 정책 명시** — `6eac233`
  - 파일: `docs/submission/README.md`
  - 무엇: `docs/submission/` 전체가 검증 커밋 `b0d438b`(테스트 50개) 시점으로 의도적으로 동결되었음을 명시. 이후 커밋은 제출에 포함되지 않는 제출 후 개선임을 문서화.
  - 왜: 제출 패키지의 "50개 테스트" 로그가 stale가 아니라 동결본임을 분명히 함(현재 HEAD의 90개와 혼동 방지).
  - 검증: README 내용 확인.

---

## 6. 제외(의도적 미적용) 항목 — Oracle 권고 "건드리지 말 것"

> 검증된 제출물의 출력/거동을 바꿔 회귀 위험이 있어 **의도적으로 적용하지 않음**.

- [ ] ~~분석기 키워드 카탈로그/랭킹 변경~~ — 이력서 서사·역량 분류 결과가 바뀔 위험(회귀). 적용 안 함.
- [ ] ~~인쇄 스타일시트 변경~~ — 단위 테스트 곤란, 인쇄 회귀 위험. 적용 안 함.
- [ ] ~~멀티턴 대화에 assistant 메시지 이력 누적~~ — 프롬프트 컨텍스트·토큰·표시 거동을 바꾸는 제품 변경. 안전한 정정이 아니므로 적용 안 함.
- [ ] ~~분석기 `generatedAt` 결정론화~~ — 콘텐츠 결정론은 이미 보장되며 테스트 범위도 적절. 변경 불필요.

---

## 7. 최종 검증 체크리스트 (Definition of Done)

- [x] 모든 변경은 RED → GREEN(테스트 우선) → SURFACE 절차로 구현
- [x] `npm test` 90개 전부 통과(테스트 삭제/스킵 없음)
- [x] `npm run typecheck` 클린(앱 + 서버 tsconfig)
- [x] `npm run build` 정상(`dist/` 생성)
- [x] 변경 파일 LSP 진단 클린
- [x] 브라우저 수동 QA: 항목별 삭제 레이블, 포커스 링, aria-busy, 오프라인 이력서 생성 회귀 없음
- [x] curl SURFACE QA: `400`/`413`/`200` 경로 확인, 오류 문구 일반화(키/URL 미노출)
- [x] 소스에 API Key·비밀키 미포함(브라우저 번들·커밋 모두)
- [x] 원자적 커밋(개선 단위별), 작업 트리 클린
- [x] Oracle 리뷰 1차 지적 3건(413·언마운트·동결정책) 수정 후 재검증 통과
- [x] 제출 패키지(`docs/submission/`)는 `b0d438b` 동결본으로 미변경
