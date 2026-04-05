# Field Survey Mobile App — Completion Report

> PDCA 1차 사이클: Phase 0~3 (핵심 조사 플로우)
> 기간: 2026-04-04 ~ 2026-04-05
> 커밋: 40건 | 80 files changed, +4,797 / -2,965 lines

---

## 1. Executive Summary

### 1.1 Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | Web 백엔드 완성 → 현장 조사원이 실제 사용할 모바일 앱이 없음 |
| **WHO** | SURVEYOR (현장 조사원, 외주/알바 5,000명) |
| **RISK** | 마스터코드 API SURVEYOR 접근 불가(하드코딩), 할당 상세 필지정보 미포함 |
| **SUCCESS** | 로그인 → 할당 확인 → 조사 입력 → 사진 첨부 → 제출 플로우 완성 |
| **SCOPE** | 1순위: 로그인, 홈, 조사폼, 제출 |

### 1.2 Plan vs Delivered

| 관점 | 계획 | 실제 결과 |
|------|------|----------|
| **Problem** | 현장 조사 모바일 도구 없음 | JWT 인증 + 할당 목록 + 7단계 위저드 + 사진 + 제출 완성 |
| **Solution** | 6 Phase 구현 | Phase 0~3 완료 (1순위 전체), Phase 4~6 후속 PDCA로 분리 |
| **UX Effect** | 비전문 조사원 즉시 사용 가능 | 목업 기반 UI + 필수값 하이라이트 + 자동 임시저장 + 다음 필지 이동 |
| **Core Value** | Web 시스템과 연동 | 서버 API 연동 확인 (로그인, 할당 조회, 조사 제출, 사진 업로드) |

### 1.3 Value Delivered

| 지표 | 값 |
|------|---|
| Success Criteria 충족 | 7/7 (100%) |
| Gap Analysis Match Rate | 83% → 90%+ (Quick fix 후) |
| 신규 파일 | 35+ |
| 제거된 패키지 | 9개 (NativeBase, gorhom 등) |
| 서버 연동 API | 7 endpoints |

---

## 2. Success Criteria Final Status

| # | 기준 | 상태 | 근거 |
|---|------|:---:|------|
| SC-1 | 로그인 → 토큰 저장 → API 호출 | ✅ Met | `lib/store/auth.ts` JWT + AsyncStorage + 자동 갱신 |
| SC-2 | 할당 목록 + 진행률 | ✅ Met | `app/(tabs)/index.tsx` ProgressCard |
| SC-3 | 7단계 위저드 + 조건부 표시 | ✅ Met | `components/survey/steps/` 8 Step + 조건부 로직 |
| SC-4 | 사진 촬영 + 업로드 | ✅ Met | `StepPhotos.tsx` + `uploadPhoto()` |
| SC-5 | 임시저장 + 제출 분리 | ✅ Met | DRAFT/SUBMITTED + 로컬 자동저장 + 서버 DRAFT 복원 |
| SC-6 | 반려 + 재조사 | ✅ Met | `ResultCard` 재조사 버튼 + 위저드 재진입 |
| SC-7 | NativeBase/gorhom 제거 | ✅ Met | package.json 9패키지 제거 완료 |

**Overall: 7/7 criteria met (100%)**

---

## 3. Key Decisions & Outcomes

| 결정 | 출처 | 결과 |
|------|------|------|
| Option B (Clean Architecture) | Design | 구현됨 — `lib/` 모듈 분리, 이식 가능 구조 |
| JWT (session → token) | Plan | 구현됨 + refreshToken 자동 갱신 추가 |
| zustand 상태관리 | Design | 구현됨 — auth, assignments, surveyForm 3 store |
| BottomSheet 자체 구현 | Design | 구현됨 — RNGH waitFor 기반 (~560줄) |
| NativeBase → RN StyleSheet | Design | 구현됨 — 47파일 import 교체 |
| 마스터코드 하드코딩 | Plan C-1 | 구현됨 — `lib/survey/codes.ts` 서버 DB 기준 |
| 지도 현행 유지 | Do 단계 결정 | 채택 — `src/map/` 마이그레이션 보류 |

---

## 4. Implementation Summary

### 4.1 Phase별 구현

| Phase | 내용 | 커밋 | 상태 |
|-------|------|:---:|:---:|
| **Phase 0** | 기술 스택 정비 (9패키지 제거 + BottomSheet) | 3 | ✅ |
| **Phase 1** | 로그인 + JWT 인증 | 3 | ✅ |
| **Phase 2** | 홈 탭 (할당/진행률/반려) + 탭 네비게이션 | 4 | ✅ |
| **Phase 3** | 조사 위저드 8단계 + 사진 + 제출 | 8 | ✅ |
| 추가 | 검증/GPS/자동저장/토큰갱신/서버연동 수정 | 22 | ✅ |

### 4.2 생성된 주요 파일

**lib/ (비즈니스 로직)**
- `lib/config.ts` — 서버 URL + API 경로
- `lib/api/client.ts` — fetch wrapper + 자동 토큰 갱신
- `lib/api/auth.ts` — 로그인 API
- `lib/api/survey.ts` — 7개 조사 API
- `lib/api/types.ts` — ApiResponse, Assignment, SurveyResultInput
- `lib/store/auth.ts` — JWT + AsyncStorage 영속화
- `lib/store/assignments.ts` — 할당 목록 상태
- `lib/store/surveyForm.ts` — 위저드 폼 + 자동 임시저장
- `lib/survey/codes.ts` — 마스터코드 13그룹
- `lib/survey/validation.ts` — 필수/사진/GPS/시간/논리 검증

**components/ (UI)**
- `components/BottomSheet.tsx` — 커스텀 바텀시트 (RNGH waitFor)
- `components/FormYesNo.tsx` — 예/아니오 + 에러 하이라이트
- `components/FormSelect.tsx` — 버튼 그리드 2/3열
- `components/FormTextInput.tsx` — 텍스트 + 숫자 입력
- `components/FormSection.tsx` — 섹션 래퍼 + 조건부 디바이더
- `components/StatusBadge.tsx` — 7종 상태 + 3종 위험도
- `components/ValidationModal.tsx` — 제출 전 경고 모달
- `components/survey/SurveyWizard.tsx` — 위저드 프레임
- `components/survey/steps/Step*.tsx` — 8개 Step 컴포넌트

**app/ (화면)**
- `app/(tabs)/_layout.tsx` — 4탭 네비게이션
- `app/(tabs)/index.tsx` — 홈 (할당/진행률/제출현황)
- `app/(tabs)/survey.tsx` — 조사 탭 (DRAFT/미조사 목록)
- `app/(tabs)/map.tsx` — 지도 탭 (기존 유지)
- `app/(tabs)/profile.tsx` — 내정보 (placeholder)
- `app/survey/[id].tsx` — 위저드 풀스크린 라우트
- `app/login/index.tsx` — 로그인 (목업 UI)

### 4.3 설계 외 추가 구현

| 기능 | 설계 유무 | 가치 |
|------|:---:|------|
| 자동 토큰 갱신 (refreshToken) | ❌ | 30분 만료 무감지, 7일 사용 |
| GPS 자동 기록 | ❌ | 위저드 진입 시 자동 |
| 소요시간 측정 | ❌ | 시작~제출 자동 기록 |
| 자동 임시저장 (AsyncStorage) | ❌ | 앱 종료/크래시 복구 |
| 다음 필지 자동 이동 | ❌ | 제출 후 다음 미조사 건 자동 진입 |
| Step 8 확인 화면 | ❌ (목업은 있음) | 제출 전 전체 요약 |
| Step별 필수값 검증 + 하이라이트 | ❌ | 미선택 시 빨간 테두리 |
| 서버 DRAFT 불러오기 | ❌ | 서버 임시저장 건 이어쓰기 |

---

## 5. Gap Analysis Summary

### 최종 Match Rate: ~90% (Phase 0-3 범위)

| 축 | 점수 |
|---|:---:|
| Structural | 73% → 보류 항목 제외 시 ~88% |
| Functional | 88% |
| API Contract | 86% → Quick fix 후 ~92% |

### 의도적 보류 (후속 PDCA)

| 항목 | 사유 | 후속 |
|------|------|------|
| `lib/map/` 마이그레이션 | Phase 4 범위, 현행 유지 결정 | `field-survey-map` PDCA |
| 레거시 코드 60+ 파일 | 마이그레이션 완료 후 | `field-survey-cleanup` |
| 내정보 탭 보강 | 서버 API 필요 (my-stats) | `field-survey-profile` |
| 오프라인 모드 | Phase 6, 대규모 작업 | `field-survey-offline` PDCA |
| Push 알림 | Phase 6, 서버 FCM 필요 | `field-survey-push` PDCA |

---

## 6. Known Issues & Lessons

### 서버 호환 이슈 (해결됨)

| 이슈 | 원인 | Mobile 대응 | 서버 근본 해결 |
|------|------|-----------|-------------|
| Boolean null → VARCHAR | MyBatis jdbcType 미지정 | null → false 전송 | `#{field,jdbcType=BOOLEAN}` |
| Numeric null → VARCHAR | 동일 | null → 0 전송 | `#{field,jdbcType=NUMERIC}` |
| LocalDateTime 배열 직렬화 | Jackson 기본 설정 | 배열/문자열 둘 다 파싱 | `write-dates-as-timestamps=false` |
| AuditLog user_id 타입 | 동일 | - | `#{userId,jdbcType=BIGINT}` |

**가이드 문서**: `docs/field-survey/server-known-issues.md`

### Lessons Learned

1. **목업 먼저 확인** — 로그인 UI를 farmfield 이미지로 구현했다가 목업 기준으로 재작성
2. **서버 DB가 진실** — 설계 문서 마스터코드와 서버 `tb_survey_code` 불일치 → 서버 기준으로 통일
3. **farmfield ≠ agmap** — 별도 시스템, farmfield 코드 참조 금지
4. **BottomSheet 제스처** — 네이티브 스크롤과 pan gesture 충돌은 RNGH `waitFor`로 해결
5. **MyBatis null 타입** — nullable 필드는 반드시 `jdbcType` 명시 또는 Mobile에서 기본값 전송

---

## 7. Recommended Next PDCA Cycles

| PDCA | 범위 | 우선순위 | 예상 규모 |
|------|------|:---:|------|
| `field-survey-map` | 지도 필지 상태 색상 + 마이그레이션 | 중 | 1 session |
| `field-survey-offline` | 오프라인 모드 (SQLite + 동기화 큐) | 높 | 2-3 session |
| `field-survey-cleanup` | 레거시 코드 60+ 파일 제거 | 낮 | 1 session |
| `field-survey-push` | FCM Push 알림 | 중 | 1 session |
