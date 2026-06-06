# 제출 안내 (최종 패키징 가이드)

> 2026학년도 HYCU AI 학습법 공모전 — 제출 직전 최종 점검 및 패키징 안내.

## 1. 제출 개요
| 항목 | 내용 |
|------|------|
| 제출처 | parkjw@hycu.ac.kr (교육성과혁신팀) |
| 접수 마감 | 2026년 6월 14일(일) 24:00 |
| 메일 제목·파일명 규칙 | `2026AI학습법공모전_대표자명_학번_제목` |
| 예시 | `2026AI학습법공모전_「대표자명」_「11자리학번」_HYCU학습이력서learnprint` |
| AI 증빙 용량 | 50MB 이내 (초과 시 클라우드/링크 대체) |
| 문의 | 02-2290-0197 / parkjw@hycu.ac.kr |

## 2. 제출 파일 목록
| 구분 | 파일 | 작성본 위치 | 비고 |
|------|------|------------|------|
| 수기(본문) | 학습법 사례보고서 | `docs/case-report.md` | 공식 제출은 docx/PDF로 변환 |
| 별첨1 | 참가신청서 | `docs/submission/appendix1_application-form.md` | 공식 양식 docx에 옮겨 기입 |
| 별첨2 | 동의서 | `docs/submission/appendix2_consent-form.md` | 공식 양식 docx에 옮겨 기입 |
| 별첨3 | AI 활용 증빙자료 | `docs/submission/appendix3_ai-evidence.md` | 선택/가산점 |
| 증빙 | 소스코드 ZIP | `docs/submission/learnprint-source.zip` | node_modules·.git·dist 제외 |
| 증빙 | 실행 화면 캡처 | `docs/submission/screenshots/01~07_*.png` | 7장 |
| 증빙 | 빌드/테스트 로그 | `docs/submission/build-test-log.txt` | 50개 테스트 통과 |
| 증빙 | 이력서 내보내기 샘플 | `docs/submission/sample-resume-export.md / .json` | 6과목 역량 분류 결과 |
| 데모 | 라이브 배포 | https://learnprint.jclee.me | 실제 구동 URL |

## 3. 본인이 직접 채워야 하는 항목 (작성본의 「○○ (본인 작성)」)
- 성명, 11자리 학번, 정확한 학부·학과·전공명
- 휴대전화, 이메일
- 신청일 / 제출일
- 서명

> 위 항목 외에는 작성본에 모두 채워져 있습니다. 작성본을 공식 docx 양식에 옮겨 적은 뒤, 위 항목만 본인이 기입·서명하면 됩니다.

## 4. 사례보고서(수기) 본문 사용 안내
- 최종 수기 본문은 `docs/case-report.md` 입니다. **다시 쓰지 마세요.**
- 워드/한글 또는 PDF 편집기에 그대로 붙여넣고, 맞춤법·서식만 점검한 뒤 docx/PDF로 내보내 제출합니다.
- 1인칭 학습법 서술을 유지하고, 표지에 제목·성명·학번만 추가하면 됩니다.

## 5. 공식 양식(docx) 작성 방법
- `docs/2026_HYCU_AI_Learning_Method_Contest_Submission_Form.docx`(공식 빈 양식)을 열고, 별첨1·2·3 작성본(.md)의 내용을 각 표/항목에 옮겨 적습니다.
- 체크박스(☑)는 양식의 □에 직접 체크합니다.
- 본 저장소의 .md는 **옮겨 적기용 작성본**이며, 자동 docx 변환은 서식 손실 위험이 있어 수동 기입을 권장합니다.

## 6. 최종 제출 전 검증 체크리스트
- [ ] 별첨1/2/3의 「본인 작성」 항목 모두 기입·서명 완료
- [ ] 수기(case-report) docx/PDF 변환 및 맞춤법 점검
- [ ] 메일 제목·파일명이 `2026AI학습법공모전_대표자명_학번_제목` 규칙 준수
- [ ] 첨부에 개인정보·계정정보·비밀번호·API Key 미포함 확인
- [ ] AI 증빙 50MB 이내 (초과 시 링크 대체)
- [ ] `npm test`(50개 통과)·`npm run build` 로그 첨부
- [ ] 마감(2026.6.14 24:00) 이전 발송
