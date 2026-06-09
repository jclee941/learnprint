# 제출물 점수 예상값 점검 결과 (Score Estimate Review)

> 2026학년도 HYCU AI 학습법 공모전 부문5 출품작 "HYCU 학습 이력서 (learnprint)"
> 점검 일시: 2026-06-08 / 기준: 현행 HEAD + `docs/submission/final/` 동결본
> 심사기준 출처: `docs/submission-checklist.md` (구체성·진실성·활용성·참신성·전달성 각 20점 + AI 증빙 가산점)

---

## 1. 항목별 예상 점수

| 평가항목 | 예상 | 범위 | 핵심 근거 / 감점 요인 |
|---|---|---|---|
| 구체성 | 18 | 17–19 | 3-루프 절차 + ASCII 다이어그램 + §3 컴퓨터구조론 7단계 전과정(실패 프롬프트→교정→수용/거절→오답노트) + §5 재사용 템플릿 5개. 감점: 보고서가 길고 앱 기능설명서로 읽힐 위험, 시연영상 부재 |
| 진실성 | 18 | 17–19 | 실패 프롬프트 비공개 안 함, latency 수치 거절 이유 명시, §5 "AI가 틀린 5개 사례" 표, §7 한계·정직성 선언. 검증됨: 주장한 테스트 115개 실제 통과. 감점: 장기 사용 입증 원본 증거(타임라인) 부족 |
| 활용성 | 17 | 15–18 | 6개 실수강 과목 적용, §3.6 learnprint 역량 분류 연결. 감점: 완전한 3-루프 깊은 사례가 1과목(컴구론)에 편중, 나머지 5개는 얕음 |
| 참신성 | 17 | 15–18 | "AI=답안생성기 아닌 역량언어 변환기" 프레이밍, Evidence Ledger, 결정론 엔진+LLM 이중화. 감점: 기술 핵심이 키워드 매칭이라 기술적 독창성은 중상위 |
| 전달성 | 16 | 14–18 | 문제→방법→사례→확장→템플릿→한계 논리흐름, Before/After 표. 감점: ~14k자 과밀(1.5~3쪽 기대 대비), 시연영상 부재, 기술어가 학습경험을 가림 |

### 총점 예상

| 시나리오 | 점수 |
|---|---|
| 보수적 | 78–81 |
| 현실적(기대값) | 85–88 (기본 86 + AI 가산점 +2~4) |
| 낙관적 | 90–92 |

---

## 2. 검증 항목 (Oracle 지적 #1~#5 적용 결과)

### #2. 라이브 배포 상태 — **✅ 복구 완료**

- 최초 증상: `curl https://learnprint.jclee.me` → **HTTP 404** (`/healthz`도 404)
- 근본 원인: cloudflare tunnel 설정 불일치. systemd가 실제 사용하는 `/etc/cloudflared/config.yml`에 `learnprint.jclee.me` ingress가 **누락**돼 catch-all `http_status:404`로 떨어짐. (로컬 서버 `localhost:4173`은 HTTP 200으로 정상 동작 중이었음)
- 조치: `/etc/cloudflared/config.yml`에 catch-all 앞으로 `learnprint.jclee.me → http://localhost:4173` ingress 추가 → `cloudflared ... ingress validate` OK → `systemctl restart cloudflared`.
- 재검증: `https://learnprint.jclee.me` → **HTTP 200**, `/healthz` → **`{"status":"ok"}`**. 라이브 데모 정상 회복.

### #1. 라이브 데모 주장 vs 404 모순 수정 — **✅ 적용 (복구 후 정리)**

- 문제: `README.md`가 "설치 없이 브라우저에서 바로 체험" / "공개 도메인에서 구동"을 단정적으로 서술해 404 현실과 모순.
- 조치: #2에서 라이브가 복구되어 모순 자체는 해소. `README.md` L5·L28은 라이브 정상 상태로 서술하되, 견고성을 위해 "라이브 비활성 시 `npm run build && npm run serve`로 로컬 재현 가능"이라는 폴백 안내를 한 줄 유지.

### #3. 최종 docx placeholder 검사 — **✅ 작성 완료**

`docs/submission/final/` 내 docx의 `word/document.xml` 직접 검사 결과:

| 파일 | "본인 작성" | "○○" | 판정 |
|---|---|---|---|
| appendix1_application-form.docx | 입력칸 0 (안내문만 잔존) | ✅ 완성 (이재철·2024112536·소속·연락처·이메일·신청일·서명) |
| appendix2_consent-form.docx | 입력칸 0 (안내문만 잔존) | ✅ 완성 (제출일·서명·동의) |
| case-report.docx | 0 | 0 | ✅ 완성 |
| appendix3_ai-evidence.docx | 0 | 0 | ✅ 완성 |

- 조치 완료: 참가신청서·동의서의 개인정보 필드(성명/학번/학과/연락처/서명)를 원본 docx 표 셀에 직접 기입함 (서식·XML 무결성 유지). 안내 문장의 「○○ (본인 작성)」은 설명용 텍스트라 의도적 보존. 제출 전 육안 확인만 필요.

### #4. 제출 zip 민감정보·용량 검사 — **✅ 통과**

- `learnprint-source.zip` (3.6M), `source-code_learnprint.zip` (3.6M), `screenshots.zip` (3.4M) — **모두 50MB 한도 내**
- `.env`/secret/`.key`/credential/`node_modules`/`.git` 포함 없음 (`.env.example`만 존재)
- **실제 secret 값·private key 미검출**: API key 할당 패턴(`sk-...`, `api_key=...`), private key(`BEGIN ... PRIVATE`) 모두 없음. (단, `API_KEY` 같은 **환경변수명**은 `.env.example`·`server/env.ts`·테스트 코드에 존재하나 이는 키 값이 아닌 이름·예제·테스트용임)

### (참고) 기술 주장 검증 — **✅ 통과**

- `npx vitest run` → 22 파일 / **115 테스트 통과** (제출 주장과 정확히 일치)
- `npm run typecheck`, `npm run build` 정상 (dist 산출물 생성)
- 동결 제출본 `build-test-log.txt`는 13파일/50테스트 기준 (체크리스트의 "동결 50 / 현행 115" 명시와 모순 없음)

---

## 3. 마감(2026-06-14) 전 우선 개선 — points-per-effort 순

1. ~~신청서·동의서 개인정보 작성~~ (#3) — **✅ 완료** (원본 docx에 이재철/2024112536/연락처/서명 기입). 제출 전 육안 확인만 권장.
2. ~~라이브 배포 404 복구~~ — **✅ 완료** (cf 터널 ingress 추가, 현재 HTTP 200). 제출 직전 재확인 권장.
3. **60–90초 시연영상 MP4** (현재 미녹화) — +2~4점, 구체성·활용성·전달성 동시 상승.
4. **1–2쪽 심사용 요약본** 본문 앞 삽입 — 14k자 과밀 완화. +2~3점.
5. **타 과목 2개 미니 3-루프 사례** 추가 — 활용성 편중 해소. +2~3점.

## 4. 실격/중대감점 리스크

- ✅ 신청서·동의서 — 작성 완료(final docx 기입), 해소됨
- ✅ 라이브 배포 — cf 터널 ingress 복구 완료(HTTP 200), 해소됨 (제출 직전 재확인 권장)
- 🟡 형식 불일치(14k자 vs 1.5~3쪽 기대) → 형식 감점 가능
- 🟡 시연영상 부재 → 필수면 major penalty, 선택이면 2~4점 손해
- ✅ zip 민감정보/용량 — 검사 통과, 문제 없음
- ✅ 과대주장 — §7 No Over-Claim Boundary로 통제됨

---

**결론**: 내용 완성도는 88점급(상위권). 라이브 배포(HTTP 200)·신청서·동의서 작성 모두 완료됨. 남은 선택 개선은 시연영상 녹화(+2~4점)이며, 이까지 처리하면 86 → 89~91점권 가능.
