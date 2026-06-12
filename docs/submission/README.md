# 제출물 (Submission Artifacts)

> 2026학년도 HYCU AI 학습법 공모전 — "HYCU 학습 이력서(learnprint)" 출품 증빙 자료 모음

실제 구동 중인 앱을 브라우저로 직접 조작하여 캡처한 실행 화면과, 실제 HYCU 수강 과목을 기반으로 작성한 내보내기 산출물, 빌드·테스트 통과 로그입니다.

**라이브 배포(공개 DNS)**: https://learnprint.jclee.me — Cloudflare Tunnel(named)로 노출된 실제 구동 주소.

> **제출 스냅샷 안내**: 최종 제출 패키지는 릴리즈 `v1.0.0` (master 최신 커밋) 기준입니다. `docs/submission/final/`의 docx·PDF·증빙(evidence)이 실제 제출본입니다. 초기 제출 검증 스냅샷은 테스트 50개 기준이었고, 현행 HEAD는 118개 통과·빌드 OK로 개선되었습니다 (`docs/verification-log.txt`).

> **파일명 넘버링 안내**: `final/` 제출본은 제출 순서대로 넘버링되어 있습니다 — `00_제출안내`, `01_참가신청서_AI증빙_이재철`, `02_사례보고서_이재철`, `evidence/03_소스코드`~`07_이력서샘플`. 참가신청서·동의서·AI증빙은 공식 양식 1개 파일로 통합되어 있으며 신청자 정보·체크·날림체 서명이 기입되어 있습니다. 이메일 제출 시 파일명은 요강 규칙(`2026AI학습법공모전_대표자명_학번_제목`)에 맞춰 지정하면 됩니다.

## 1. 실행 화면 캡처 (screenshots/)

| 파일 | 화면 | 설명 |
|------|------|------|
| `01_main_seeded.png` | 메인 화면 | 첫 실행 시 HYCU 수강 과목 6건이 자동 시드된 초기 상태 |
| `02_resume_generated.png` | 이력서 생성 | "이력서 생성" 클릭 후 역량별로 그룹화된 학습 이력서 + 내보내기 버튼 |
| `03_print_preview.png` | 인쇄 미리보기 | `@media print` 적용 — 입력/버튼이 숨겨지고 이력서 문서만 출력 |
| `04_input_form_demo.png` | 입력 시연 | 새 학습 경험(정보처리기사) 입력 폼 작성 화면 |
| `05_resume_with_certificate.png` | 7건 이력서 | 자격증 항목 추가 후 재생성한 역량별 이력서 |
| `06_live_deploy_learnprint_jclee_me.png` | 라이브 배포 | 공개 도메인 https://learnprint.jclee.me 에서 구동되는 실제 화면 |
| `07_ai_agent_competency.png` | AI 에이전트(선택) | 선택 기능인 AI 학습 에이전트가 등록 이력을 컨텍스트로 역량을 분석·제안한 화면 |

## 2. 내보내기 산출물 (학습 데이터 기반)

| 파일 | 설명 |
|------|------|
| `sample-resume-export.md` | 앱의 "Markdown 내보내기" 기능이 학습 데이터로 생성한 이력서 |
| `sample-resume-export.json` | 앱의 "JSON 내보내기" 기능 산출물 (역량/증거/항목 직렬화) |

## 3. 빌드·테스트 증빙

| 파일 | 설명 |
|------|------|
| `final/evidence/06_빌드테스트로그.txt` | `npm test`(현행 HEAD 118개 통과) · `npm run typecheck`(클린) · `npm run build`(dist 생성) 통과 로그 (동결 스냅샷은 50개 기준) |

## 4. 시연 영상 ✅ 완료

전체 사용 흐름을 자동 녹화한 시연 영상입니다 (1280×720, ~55초, H.264):
- `final/evidence/05_시연영상.mp4`
- 흐름: 메인·시드 6과목 → 학습 경험 입력(자격증) → 이력서 생성 → 역량별 그룹 → 내보내기 → **AI 에이전트 실시간 응답**(역량 분석·자기소개 생성, 예상 면접질문)

## 재현 방법

```bash
cd /home/jclee/dev/learnprint
npm install
npm run build
npm run serve     # http://localhost:4173 — dist 정적 서빙 (AI 에이전트 사용 시 .env 구성)
```

> 데이터 출처 및 개인정보 제외 내역은 `docs/hycu-data-provenance.md` 참고.
