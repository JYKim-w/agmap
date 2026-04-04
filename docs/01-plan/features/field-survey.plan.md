# Field Survey Mobile App — Plan

> 현장조사 조사원용 Mobile 앱 구현 계획
> 작성일: 2026-04-04

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 5,000명 조사원이 현장에서 농지 상태를 기록할 모바일 도구가 없음 |
| **Solution** | JWT 인증 + 할당 목록 + 7단계 위저드 폼 + 사진 촬영 + 지도 기반 모바일 앱 |
| **UX Effect** | 비전문 외주/알바 조사원이 교육 최소화로 즉시 현장 조사 가능 |
| **Core Value** | Web 관리 시스템과 연동되는 현장 데이터 수집 채널 완성 |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | Web 백엔드 완성 → 현장 조사원이 실제 사용할 모바일 앱이 없음 |
| **WHO** | SURVEYOR (현장 조사원, 외주/알바 5,000명) |
| **RISK** | 마스터코드 API SURVEYOR 접근 불가(하드코딩 임시 대응), 할당 상세 필지정보 미포함 |
| **SUCCESS** | 로그인 → 할당 확인 → 조사 입력 → 사진 첨부 → 제출 플로우 완성 |
| **SCOPE** | 1순위: 로그인, 홈, 조사폼, 제출 / 2순위: 지도, 재조사, 품질검증 / 3순위: 정사영상, 오프라인, Push |

---

## 1. 요구사항 참조

> 상세 요구사항은 기존 문서에 정의됨. 중복 기술하지 않고 참조.

| 영역 | 참조 문서 | 핵심 내용 |
|------|----------|----------|
| 전체 범위 + 탭 구조 + 우선순위 | [`README.md`](../field-survey/README.md) | 4탭(홈/지도/조사/내정보), 구현 3단계 우선순위 |
| API 스펙 (7 endpoints) | [`mobile-api-spec.md`](../field-survey/mobile-api-spec.md) | my-assignments, assignment/{id}, result, photo/upload, rejected, resubmit |
| 조사 폼 7단계 + 마스터코드 13그룹 | [`survey-form-spec.md`](../field-survey/survey-form-spec.md) | 위저드 Step 1~7, UX 원칙, 품질 검증 규칙 |
| 인증 (JWT + 테스트 계정) | [`auth-guide.md`](../field-survey/auth-guide.md) | POST /auth/api/login, SURVEYOR/MANAGER/ADMIN 역할 |
| 설계 대비 미구현/불일치 | [`known-gaps.md`](../field-survey/known-gaps.md) | G-1~G-6 미구현, D-1~D-6 불일치, W-1~W-5 Web 추가필요, M-1~M-6 Mobile 자체구현 |
| 기술 스택 정비 | [`tech-stack-cleanup.md`](../field-survey/tech-stack-cleanup.md) | 제거 8개(NativeBase, Paper, gorhom 등), 유지 스택, bottom sheet 직접 구현 |

---

## 2. 성공 기준

| # | 기준 | 검증 방법 |
|---|------|----------|
| SC-1 | 테스트 계정으로 로그인 → 토큰 저장 → 인증 API 호출 성공 | surveyor01/test1234 로그인 후 my-assignments 호출 |
| SC-2 | 오늘 할당 목록 표시 + 진행률(완료/전체) 계산 | my-assignments API 응답 → resultId 유무 기반 집계 |
| SC-3 | 7단계 위저드 폼 전체 입력 + 조건부 표시 동작 | cultivationYn=true → 작물 항목 표시 등 |
| SC-4 | 사진 촬영(OVERVIEW + CLOSEUP 최소 2장) + 업로드 성공 | photo/upload API 호출 + 썸네일 확인 |
| SC-5 | 임시저장(DRAFT) + 제출(SUBMITTED) 분리 동작 | resultStatus 값에 따른 POST/PUT 분기 |
| SC-6 | 반려 건 목록 확인 + 재조사 제출 | rejected API → resubmit API 플로우 |
| SC-7 | NativeBase/Paper/gorhom 완전 제거, RN 기본 + StyleSheet만 사용 | package.json에 제거 대상 없음 |

---

## 3. 제약 조건

| # | 제약 | 영향 | 대응 |
|---|------|------|------|
| C-1 | 마스터코드 API `/admin/` 경로 → SURVEYOR 접근 불가 | 드롭다운 코드 서버 조회 불가 | 앱 내 하드코딩 (`survey-form-spec.md` 코드 목록 사용) |
| C-2 | 할당 상세에 필지 정보(PNU, 지목, 면적 등) 미포함 | Step 1 자동 로드 정보 부족 | 현재 반환 필드(address, riskGrade)만 우선 표시. Web 쿼리 확장 후 추가 |
| C-3 | 공지사항/내실적/오프라인 API 미구현 | 홈 탭 공지, 내정보 탭 실적 비어있음 | 빈 상태 UI + "준비 중" 표시 |
| C-4 | 개발 서버 `http://112.218.160.197:8080` 고정 | HTTPS 아님 | 개발 단계 한정 허용, 추후 환경별 분리 |

---

## 4. 리스크

| # | 리스크 | 확률 | 영향 | 대응 |
|---|--------|------|------|------|
| R-1 | NativeBase 제거 시 기존 40+ import 깨짐 | 확실 | 중 | 기술 스택 정비를 1순위 구현 전에 먼저 진행 |
| R-2 | Bottom sheet 직접 구현 품질 | 중 | 중 | reanimated+gesture-handler 기반, 300줄 이내 목표 |
| R-3 | 개발 서버 불안정/접근 불가 | 낮 | 높 | mock 데이터 + 오프라인 개발 모드 준비 |
| R-4 | 조사 폼 복잡도 (7단계 × 조건부 표시) | 중 | 중 | zustand로 폼 상태 중앙 관리 + 단계별 validation |

---

## 5. 구현 단계

| Phase | 범위 | 선행 조건 |
|-------|------|----------|
| **Phase 0** | 기술 스택 정비 (제거 8개 패키지) | — |
| **Phase 1** | 로그인 + 인증 토큰 관리 | Phase 0 |
| **Phase 2** | 홈 탭 (할당 목록 + 반려 건 + 진행률) | Phase 1 |
| **Phase 3** | 조사 폼 7단계 위저드 + 사진 촬영 + 제출 | Phase 1 |
| **Phase 4** | 지도 탭 (필지 상태 색상 + GPS + 정사영상) | Phase 2 |
| **Phase 5** | 재조사 + 클라이언트 품질 검증 | Phase 3 |
| **Phase 6** | 오프라인 모드 + Push 알림 | Phase 3, 4 |
