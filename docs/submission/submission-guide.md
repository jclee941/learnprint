# 제출 안내 (최종 패키징 가이드)

> 2026학년도 HYCU AI 학습법 공모전 — 제출 직전 최종 점검 및 패키징 안내.

## 1. 제출 개요
| 항목 | 내용 |
|------|------|
| 제출처 | parkjw@hycu.ac.kr (교육성과혁신팀) |
| 접수 마감 | 2026년 6월 14일(일) 24:00 |
| 메일 제목·파일명 규칙 | `2026AI학습법공모전_대표자명_학번_제목` |
| 적용값 | `2026AI학습법공모전_이재철_2024112536_HYCU학습이력서learnprint` |
| AI 증빙 용량 | 50MB 이내 (초과 시 클라우드/링크 대체) |
| 문의 | 02-2290-0197 / parkjw@hycu.ac.kr |

## 2. 제출 파일 목록
| 구분 | 파일 | 최종 제출본 위치 | 비고 |
|------|------|------------|------|
| 수기(본문) | 학습법 사례보고서 | `docs/submission/final/case-report.pdf` / `.docx` | ✅ 완성 (변환 완료) |
| 별첨1 | 참가신청서 | `docs/submission/final/appendix1_application-form.docx` | ✅ 이재철/2024112536/서명 기입됨 |
| 별첨2 | 동의서 | `docs/submission/final/appendix2_consent-form.docx` | ✅ 제출일·서명 기입됨 |
| 별첨3 | AI 활용 증빙자료 | `docs/submission/final/appendix3_ai-evidence.docx` | ✅ 완성 (선택/가산점) |
| 증빙 | 소스코드 ZIP | `docs/submission/final/evidence/source-code_learnprint.zip` | node_modules·.git·dist 제외 |
| 증빙 | 실행 화면 캡처 | `docs/submission/final/evidence/screenshots.zip` | 7장 |
| 증빙 | 빌드/테스트 로그 | `docs/submission/final/evidence/build-test-log.txt` | 현행 HEAD 115개 통과 |
| 증빙 | 이력서 내보내기 샘플 | `docs/submission/final/evidence/resume-export-sample.md / .json` | 6과목 역량 분류 결과 |
| 증빙 | 시연 영상 | `docs/submission/final/evidence/demo-video.mp4` | ✅ 1280×720 ~55초 |
| 데모 | 라이브 배포 | https://learnprint.jclee.me | 실제 구동 URL (HTTP 200) |

## 3. 작성 상태 (모두 완료)
`docs/submission/final/`의 docx·PDF·증빙(evidence)이 실제 제출본입니다. 별첨1·2 docx에는 신청자 정보·서명이 기입되어 있으며, 주제·제목·작품개요·동의 체크·AI 증빙도 완성되어 있습니다.

> 제출 전 **개인정보와 서명을 육안으로 한 번 확인**하면 됩니다. 수동 재작성·재변환은 필요하지 않습니다. (편집이 필요하면 `docs/submission/final/`의 docx를 직접 열어 수정)

## 6. 최종 제출 전 검증 체크리스트
- [x] 별첨1/2/3의 「본인 작성」 항목 기입·서명 완료 (final docx 기준, 제출 전 육안 확인만 필요)
- [x] 수기(case-report) docx/PDF 변환 완료 (`final/case-report.pdf` / `.docx`) — 제출 전 맞춤법 육안 확인만 권장
- [ ] 메일 제목·파일명이 `2026AI학습법공모전_대표자명_학번_제목` 규칙 준수
- [ ] 첨부에 개인정보·계정정보·비밀번호·API Key 미포함 확인
- [ ] AI 증빙 50MB 이내 (초과 시 링크 대체)
- [x] `npm test`(현행 HEAD 115개 통과)·`npm run build` 로그 첨부 (`final/evidence/build-test-log.txt`)
- [ ] 마감(2026.6.14 24:00) 이전 발송
