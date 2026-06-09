# 제출물 (Submission Artifacts)

> 2026학년도 HYCU AI 학습법 공모전 — "HYCU 학습 이력서(learnprint)" 출품 증빙 자료 모음

실제 구동 중인 앱을 브라우저로 직접 조작하여 캡처한 실행 화면과, 실제 HYCU 수강 과목을 기반으로 작성한 내보내기 산출물, 빌드·테스트 통과 로그입니다.

**라이브 배포(공개 DNS)**: https://learnprint.jclee.me — Cloudflare Tunnel(named)로 노출된 실제 구동 주소.

> **제출 스냅샷 안내**: 최종 제출 패키지는 릴리즈 `v1.0.0` (커밋 `54a0e9e`) 기준입니다. `docs/submission/final/`의 docx·PDF·증빙(evidence)이 실제 제출본입니다. 초기 제출 검증 스냅샷은 테스트 50개 기준이었고, 현행 HEAD는 115개 통과·빌드 OK로 개선되었습니다 (`docs/verification-log.txt`).

> **파일명 영문화 안내**: 저장소 정리 차원에서 한글 파일·폴더명을 영문으로 변경했습니다(`별첨1_참가신청서`→`appendix1_application-form`, `제출본`→`final`, `증빙자료`→`evidence`, `학습법사례보고서`→`case-report` 등). 실제 공모전 이메일 제출 시 파일명은 요강 규칙(`2026AI학습법공모전_대표자명_학번_제목`)에 맞춰 지정하면 됩니다. (신청자 정보·서명은 final docx에 기입 완료)

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
| `build-test-log.txt` | `npm test`(50개 통과) · `npm run typecheck`(클린) · `npm run build`(dist 생성) 통과 로그 |

## 4. 시연 영상 (별도 녹화 권장)

스크린샷으로 정적 화면은 확보했으며, 동적 시연 영상은 다음 흐름으로 녹화하면 됩니다(`docs/submission-checklist.md` 참고):
입력 → 목록 → 이력서 생성 → 내보내기/인쇄.

## 재현 방법

```bash
cd /home/jclee/dev/learnprint
npm install
npm run build
npm run serve     # http://localhost:4173 — dist 정적 서빙 (AI 에이전트 사용 시 .env 구성)
```

> 데이터 출처 및 개인정보 제외 내역은 `docs/hycu-data-provenance.md` 참고.
