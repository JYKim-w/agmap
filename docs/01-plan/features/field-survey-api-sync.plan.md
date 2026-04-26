# Field Survey API Sync — Plan

> **Summary**: 명세서 v1.1/v1.2 기준 API 타입·엔드포인트 최신화 + 미구현 API 연동
>
> **Project**: agmap
> **Author**: JY Kim
> **Date**: 2026-04-22
> **Status**: Draft

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 명세서 v1.1/v1.2와 현재 구현 간 타입 불일치, 잘못된 필드 전송, farmfield 외부 API 의존, 미구현 엔드포인트 다수 |
| **Solution** | (1) 타입/필드 수정 → (2) farmfield → 자체 geom API 교체 → (3) 미구현 API 순차 연동 |
| **UX Effect** | 서버 오동작 방지, 강제 로그아웃 사유 안내, 필지 폴리곤 정확도 향상, 공지·실적 화면 활성화 |
| **Core Value** | 명세 기준 완전한 서버 통신 — 데이터 정합성 확보 |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 명세 v1.1/v1.2 갱신으로 상태값·필드·엔드포인트 변경사항 발생, farmfield 외부 호출 금지 규칙 위반 존재 |
| **WHO** | 현장 조사원 (SURVEYOR) — 제출 오류 감소, 강제 로그아웃 사유 이해, 필지 폴리곤 정확 표시 |
| **RISK** | ownerContact 타입(enum vs 전화번호) Web팀 확인 전 수정 불가 |
| **SUCCESS** | 서버 request body 명세 일치, farmfield 호출 완전 제거, 신규 API 4종 이상 연동 |
| **SCOPE** | lib/api/types.ts · lib/store/ · lib/api/client.ts · lib/map/ + 신규 API 연동 |

---

## 1. 갭 분석 결과 요약

### 1.1 수정 필요 (잘못 구현)

| # | 항목 | 현재 | 명세 |
|---|------|------|------|
| F-01 | 필지 GeoJSON 소스 | `farmfield.kr/proxy.jsp` WFS | `GET /mobile/api/survey/assignment/{assignId}/geom` |
| F-02 | request body — `resultStatus` | 포함해서 전송 | 명세 2.4에 없음 (서버 자동 결정) |
| F-03 | request body — `validationWarnings` | 포함해서 전송 | 명세 2.4에 없음 (response 전용) |
| F-04 | `resultStatus` 값 `REVIEWING` | `REVIEWING` | 명세 3.2 = `UNDER_REVIEW` |
| F-05 | `regionCode` 누락 | `AuthUser` 타입에 없음 | 명세 1.1 응답 `regionCode: string\|null` |
| F-06 | `surveyLocation` 필드 누락 | request body에 없음 | 명세 2.4 = `surveyLocation: string` |
| F-07 | `ownerContact` 타입 | 코드 enum (`CONTACTED/ABSENT/REFUSED`) | 명세 예시 = 전화번호 문자열 ⚠️ Web팀 확인 필요 |
| F-08 | `FORCED_LOGOUT_*` 처리 | 401 → 단순 refresh 실패 시 로그아웃 | `code` 값으로 사유별 메시지 → 토큰 폐기 |

### 1.2 신규 구현 필요

| # | API | 설명 |
|---|-----|------|
| N-01 | `GET /assignment/{id}/geom` (M3) | 필지 폴리곤 GeoJSON (F-01 수정과 동일) |
| N-02 | `GET /codes` (M9) | 마스터코드 동적 로딩 (codes.ts 하드코딩 대체) |
| N-03 | `GET /my-stats` (M12) | 내 실적 집계 |
| N-04 | `GET /notices` (M10) | 공지사항 목록 |
| N-05 | `PUT /device-token` (M11) | FCM 푸시 토큰 등록 |
| N-06 | `POST /auth/api/change-password` (A6) | 비밀번호 변경 |
| N-07 | A3/A4/A5 | 회원가입 (signup, check-id, company/search) |

---

## 2. Scope

### 2.1 In Scope (이번 사이클)

**Phase A — 타입/필드 수정 (F-01~F-08)**
- [ ] `lib/api/types.ts` — `SurveyResultInput`에서 `resultStatus`, `validationWarnings` 제거, `surveyLocation` 추가
- [ ] `lib/api/types.ts` — `LoginResponse`, `AuthUser`에 `regionCode` 추가
- [ ] `lib/store/auth.ts` — 로그인 시 `regionCode` 저장
- [ ] `lib/store/assignments.ts` — `REVIEWING` → `UNDER_REVIEW`
- [ ] `lib/store/surveyForm.ts` — `resultStatus`, `validationWarnings` 제거, `surveyLocation` 추가
- [ ] `lib/api/client.ts` — 401 응답에서 `code: FORCED_LOGOUT_*` 분기, 사유별 메시지 처리

**Phase B — farmfield 완전 제거 + geom API (F-01, N-01)**
- [ ] `lib/map/hooks/useParcelCentroid.ts` → `useParcelGeom.ts` 재작성 (자체 geom API)
- [ ] `lib/api/survey.ts` — `getAssignmentGeom(assignId)` 추가
- [ ] 지도에서 geom API 결과로 필지 폴리곤 표시

**Phase C — 마스터코드 동적 로딩 (N-02)**
- [ ] `lib/api/survey.ts` — `getCodes(codeGroup)` 추가
- [ ] `lib/survey/codes.ts` — 하드코딩 유지하되 서버 응답으로 override 구조
- [ ] 앱 부팅 시 주요 코드 그룹 캐싱 (CROP_TYPE, FACILITY_TYPE 등)

**Phase D — 신규 API 연동 (N-03~N-06)**
- [ ] `GET /my-stats` — 내 실적 (홈 화면 위젯)
- [ ] `GET /notices` — 공지사항 목록 화면
- [ ] `PUT /device-token` — 로그인 직후 FCM 토큰 등록
- [ ] `POST /auth/api/change-password` — 마이페이지 비밀번호 변경

### 2.2 Out of Scope

- N-07 회원가입 플로우 (A3/A4/A5) — 별도 사이클
- FCM 푸시 수신 처리 (device-token 등록만)
- ADMIN/MANAGER 전용 API

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | 요구사항 | 우선순위 |
|----|----------|:---:|
| FR-01 | `SurveyResultInput` request body가 명세 2.4와 정확히 일치 | High |
| FR-02 | `resultStatus` 값이 명세 3.2 기준 (`UNDER_REVIEW` 등) | High |
| FR-03 | 로그인 응답 `regionCode` 저장·사용 | High |
| FR-04 | 401 + `FORCED_LOGOUT_*` 수신 시 사유별 한국어 메시지 Alert 후 로그인 화면 이동 | High |
| FR-05 | 필지 폴리곤을 farmfield 아닌 자체 geom API로 조회 | High |
| FR-06 | 앱 부팅 시 마스터코드 서버에서 로딩, AsyncStorage 캐싱 | Medium |
| FR-07 | 홈 화면에 내 실적 위젯 (`weekly` 기본) | Medium |
| FR-08 | 공지사항 목록 화면 | Medium |
| FR-09 | 로그인 직후 FCM 디바이스 토큰 등록 | Medium |
| FR-10 | 마이페이지 비밀번호 변경 | Medium |

### 3.2 Non-Functional Requirements

| 카테고리 | 기준 |
|----------|------|
| 정합성 | 서버 전송 필드가 명세와 100% 일치 |
| 보안 | farmfield.kr 외부 호출 완전 제거 |
| 성능 | 마스터코드 부팅 시 1회 로딩 후 캐시 사용 |

---

## 4. Success Criteria

| # | 기준 | 검증 방법 |
|---|------|----------|
| SC-1 | `resultStatus`, `validationWarnings` request body에 미포함 | 네트워크 탭 request payload 확인 |
| SC-2 | `surveyLocation` request body 포함 | 네트워크 탭 확인 |
| SC-3 | farmfield.kr 네트워크 호출 0건 | 네트워크 탭 확인 |
| SC-4 | geom API 응답으로 필지 폴리곤 지도 표시 | 지도 화면 육안 확인 |
| SC-5 | 강제 로그아웃 시 사유 메시지 Alert 표시 | 서버 모의 응답으로 확인 |
| SC-6 | 부팅 후 코드 그룹 AsyncStorage에 캐싱 | AsyncStorage 키 확인 |

---

## 5. Risks

| # | 리스크 | 대응 |
|---|--------|------|
| R-1 | `ownerContact` 타입 불명확 (enum vs 전화번호) | Web팀 확인 전 현행 유지, 확인 후 Phase A에서 수정 |
| R-2 | geom API — ekrGIS FDW 미연동 시 null 반환 | null 시 기존 centroid 좌표 폴백 유지 |
| R-3 | 마스터코드 서버 미구현 가능성 | 서버 실패 시 codes.ts 하드코딩 폴백 |

---

## 6. Architecture

### 6.1 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `lib/api/types.ts` | `SurveyResultInput` 필드 수정, `LoginResponse`/`AuthUser`에 `regionCode` 추가 |
| `lib/api/survey.ts` | `getAssignmentGeom()`, `getCodes()`, `getMyStats()`, `getNotices()`, `registerDeviceToken()` 추가 |
| `lib/api/auth.ts` | `changePassword()` 추가 |
| `lib/api/client.ts` | `FORCED_LOGOUT_*` 코드 분기 처리 |
| `lib/store/auth.ts` | `regionCode` 저장 |
| `lib/store/assignments.ts` | `UNDER_REVIEW` 수정 |
| `lib/store/surveyForm.ts` | `resultStatus`/`validationWarnings` 제거, `surveyLocation` 추가 |
| `lib/map/hooks/useParcelCentroid.ts` | geom API 사용으로 재작성 |

### 6.2 신규 파일

| 파일 | 역할 |
|------|------|
| `lib/store/codes.ts` | 마스터코드 Zustand store + AsyncStorage 캐싱 |
| `lib/store/stats.ts` | 내 실적 store |
| `lib/store/notices.ts` | 공지사항 store |

---

## 7. Implementation Order

### Phase A — 타입·필드 수정 (우선 처리, 부작용 최소)
1. [ ] `lib/api/types.ts` — 필드 수정
2. [ ] `lib/store/surveyForm.ts` — 불필요 필드 제거, surveyLocation 추가
3. [ ] `lib/store/auth.ts` — regionCode 저장
4. [ ] `lib/store/assignments.ts` — REVIEWING → UNDER_REVIEW
5. [ ] `lib/api/client.ts` — FORCED_LOGOUT_* 처리

### Phase B — farmfield 제거 + geom API
6. [ ] `lib/api/survey.ts` — getAssignmentGeom() 추가
7. [ ] `lib/map/hooks/useParcelCentroid.ts` → geom API 교체

### Phase C — 마스터코드 동적 로딩
8. [ ] `lib/store/codes.ts` 신규 생성
9. [ ] `lib/api/survey.ts` — getCodes() 추가
10. [ ] 앱 부팅 시 codes 로딩 연결

### Phase D — 신규 API 연동
11. [ ] my-stats API + 홈 위젯
12. [ ] notices API + 화면
13. [ ] device-token 로그인 직후 등록
14. [ ] change-password 마이페이지

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-22 | Initial draft (갭 분석 기반) | JY Kim |
