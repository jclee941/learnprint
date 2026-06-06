# 별첨 3. AI 활용 증빙자료 (초안)

> 본 문서는 공모전 별첨 3 "AI 활용 증빙자료" 양식(docx)을 작성하기 위한 Markdown 초안입니다. 내용을 참고하여 공식 양식에 옮겨 주세요.

---

## 1. AI 활용 개요

| 항목 | 내용 |
|------|------|
| 사용한 AI 도구명 | OpenCode AI 코딩 어시스턴트 (바이브코딩) |
| 활용 환경 | 로컬 개발 환경 (VS Code + Vite + React) |
| 활용 목적 | 학습도구 설계·구현 및 학습 이력 구조화 |
| 활용 단계 | 기획 → 도메인 설계 → TDD 구현 → UI 구현 → 학습 데이터 구성 → 검증 |
| 최종 산출물 | "HYCU 학습 이력서" 웹앱 (learnprint) |

---

## 2. 결과물 종류 (해당 항목에 ☑ 표시)

- [x] 바이브코딩 (Vibe Coding)
- [x] AI Agent/도구 제작
- [ ] AI 학습 콘텐츠
- [ ] AI 기반 학습법 사례
- [ ] 기타: ________________

---

## 3. 대표 프롬프트 및 활용 결과 기록

### 예시 1. 분석 엔진 구현

**프롬프트 (사용자 입력)**

> "학습 경험을 역량별로 분류하는 결정론적 규칙 기반 엔진을 TypeScript로 TDD 방식으로 구현해줘. 입력은 LearningItem 배열이고, 출력은 6개 역량(데이터·AI 활용, 문제해결·논리력, 협업·커뮤니케이션, 자기주도학습, 전공·직무역량, 기획·문서작성) + 기타로 그룹화해야 해. 키워드 매칭 방식으로 결정론적으로 동작해야 하고, 네트워크 호출은 절대 하면 안 돼."

**AI 결과 요약**

AI는 `LearningAnalyzer` 인터페이스와 `analyzeLearningItems` 함수를 제안했습니다. 각 역량에 키워드 배열을 할당하고, 입력 텍스트에서 키워드 매칭 개수로 점수를 계산한 뒤 최고점 역량에 배당하는 구조를 생성했습니다.

**본인 검토·수정 내용**

- AI가 제안한 초안 키워드에서 중복과 누락을 검토하여 한국어 학습 맥락에 맞게 키워드 사전을 재구성했습니다.
- "기타 학습 경험" 폴백(fallback) 처리와 빈 입력 가이드 메시지를 추가했습니다.
- `isEmpty`, `generatedAt` 등 메타데이터 필드를 추가하여 UI에서 상태를 명확히 표현하도록 개선했습니다.
- 네트워크 미사용을 명시적으로 검증하는 테스트(`analyzer:uses-no-network-or-secrets`)를 추가했습니다.

**최종 반영 결과**

- `src/lib/ai/analyzer.ts` 구현 완료
- 관련 단위 테스트 작성 및 전체 통과

---

### 예시 2. 저장소 계층 구현

**프롬프트 (사용자 입력)**

> "React 앱에서 localStorage를 사용해 LearningItem 배열을 저장·로드·삭제하는 저장소 계층을 TypeScript로 구현해줘. JSON 파싱 에러가 나도 앱이 죽지 않도록 복구 로직을 넣고, TDD로 테스트부터 작성해줘."

**AI 결과 요약**

AI는 `saveLearningItems`, `loadLearningItems`, `clearLearningItems` 함수와 `STORAGE_KEY` 상수를 제안했습니다. JSON 파싱 실패 시 빈 배열을 반환하는 try/catch 복구 패턴을 포함했습니다.

**본인 검토·수정 내용**

- AI가 제안한 초안에서 `localStorage` 접근 함수의 시그니처를 일관되게 정리했습니다.
- 손상된 JSON 복구 테스트(`storage:corrupt-json-returns-default`)를 추가하여 복구 로직이 실제로 작동하는지 검증했습니다.
- 저장소 계층이 네트워크를 사용하지 않는다는 테스트(`storage:does-not-require-network-or-env`)를 추가했습니다.

**최종 반영 결과**

- `src/lib/storage/storage.ts` 구현 완료
- 관련 단위 테스트 작성 및 전체 통과

---

### 예시 3. UI 컴포넌트 구현

**프롬프트 (사용자 입력)**

> "React로 학습 경험 입력 폼(LearningItemForm)과 목록(LearningItemList), 그리고 역량별로 그룹화된 이력서 보기(ResumeView) 컴포넌트를 구현해줘. 입력 폼에는 제목, 유형(select), 기간, 설명, 증거 필드가 필요하고, 인쇄 시 버튼이 안 보이도록 no-print 클래스를 적용해줘."

**AI 결과 요약**

AI는 React 함수 컴포넌트 구조와 상태 관리 로직, 기본 CSS 클래스를 제안했습니다.

**본인 검토·수정 내용**

- AI가 생성한 초안에서 접근성 속성(`aria-label`)을 추가하여 스크린리더 사용자를 고려했습니다.
- 인쇄용 CSS(`@media print`)를 직접 작성하여 버튼 숨김, 여백 조정, 페이지 분리 등을 세밀하게 조정했습니다.
- `ExportControls` 컴포넌트에서 Markdown/JSON 파일 다운로드와 브라우저 인쇄 기능을 연동했습니다.
- 컴포넌트간 props 인터페이스를 직접 설계하여 타입 안전성을 확보했습니다.

**최종 반영 결과**

- `src/features/analysis/LearningItemForm.tsx`
- `src/features/analysis/LearningItemList.tsx`
- `src/features/resume/ResumeView.tsx`
- `src/features/resume/ExportControls.tsx`

---

## 4. 첨부 증빙자료 목록

| 번호 | 자료명 | 형식 | 비고 |
|------|--------|------|------|
| 1 | 소스코드 | ZIP / GitHub 링크 | 전체 소스코드 포함 |
| 2 | 실행 화면 캡처 | PNG/JPG | 입력 폼, 목록, 이력서 생성 화면 |
| 3 | 시연 영상 | MP4 (3분 이내 권장) | 실제 사용 흐름 녹화 |
| 4 | 사례보고서 | Markdown/PDF | `docs/case-report.md` |
| 5 | 빌드/테스트 통과 로그 | 텍스트/스크린샷 | `npm test`, `npm run build` 결과 |
| 6 | AI 활용 증빙 초안 | Markdown | 본 문서 (`docs/ai-evidence.md`) |

---

## 5. 확인사항 (해당 항목에 ☑ 표시)

- [x] 결과물에 개인정보(주민등록번호, 주소, 연락처 등)가 포함되지 않았습니다.
- [x] 결과물에 외부 API Key, 비밀키, 환경변수가 포함되지 않았습니다.
- [x] AI가 생성한 결과는 본인이 직접 검토하고 수정·보완하여 최종 반영했습니다.
- [x] 타인의 결과물을 무단 복제하거나 표절하지 않았습니다.
- [x] 제출한 결과물의 저작권에 대한 법적 문제가 없습니다.
