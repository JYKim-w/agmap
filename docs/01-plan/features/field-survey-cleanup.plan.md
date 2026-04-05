# Field Survey Cleanup — Plan

> **Summary**: farmfield 레거시 코드 전수 제거 — src/map 21개, 레거시 store 5개, 레거시 라우트 3개, app/js
>
> **Project**: agmap
> **Author**: JY Kim
> **Date**: 2026-04-06
> **Status**: Draft

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | field-survey-map Clean Slate 이후 사용하지 않는 farmfield 레거시 코드 60+ 파일이 잔존, 혼란 유발 |
| **Solution** | 의존성 분석 완료 — 안전 삭제 대상 확정, 빌드 확인 후 일괄 제거 |
| **UX Effect** | 코드 탐색 시 레거시/신규 혼동 제거, 번들 크기 감소 |
| **Core Value** | 코드베이스 정리 — 유지보수 비용 절감, 신규 개발자 온보딩 단순화 |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | Clean Slate 재작성 후 farmfield 레거시가 사용되지 않지만 60+ 파일이 남아있음 |
| **WHO** | 개발팀 (코드 유지보수) |
| **RISK** | 레거시 간접 참조 누락 시 빌드 실패 |
| **SUCCESS** | 레거시 전수 삭제 + 빌드 성공 + 기존 기능 정상 |
| **SCOPE** | src/map, 레거시 store 5개, app/map 서브라우트 3개, app/js, refContext |

---

## 1. 삭제 대상 (의존성 분석 완료)

### 안전 삭제 (레거시에서만 참조됨)

| # | 대상 | 파일 수 | 근거 |
|---|------|:---:|------|
| 1 | `src/map/` 디렉토리 전체 | 21 | lib/map/으로 재구현 완료 |
| 2 | `store/bottomStore.ts` | 1 | 레거시 BottomBar용, 새 코드 미참조 |
| 3 | `store/optionStore.ts` | 1 | 레거시 레이어 설정용, 새 코드 미참조 |
| 4 | `store/searchStore.ts` | 1 | 레거시 검색용, 새 코드 미참조 |
| 5 | `store/codeStore.ts` | 1 | 레거시 일제정비 코드용, 새 코드 미참조 |
| 6 | `store/shelterStore.ts` | 1 | 레거시 시설물용, 새 코드 미참조 |
| 7 | `store/inspectStore.ts` | 1 | 레거시 조사용, 새 코드 미참조 |
| 8 | `app/map/inspect/` 디렉토리 | ~15 | farmfield 일제정비 UI, 사용 안 함 |
| 9 | `app/map/search/` 디렉토리 | ~4 | farmfield 검색 UI, 사용 안 함 |
| 10 | `app/map/setting/` 디렉토리 | ~2 | farmfield 설정 UI, 사용 안 함 |
| 11 | `app/js/` 디렉토리 | ~5 | farmfield JS (config, common, login 등) |
| 12 | `app/refContext.tsx` | 1 | 레거시 mapRef/cameraRef 공유용 → `_layout.tsx` 수정 필요 |

### 삭제 불가 (유지)

| 대상 | 이유 |
|------|------|
| `store/inspectInputStore.ts` | `app/map/index.tsx`에서 `setOwnAr` 사용 (면적 측정) |
| `store/mapStateStore.ts` | 새 지도 GPS/bearing/zoom 상태 |
| `store/measureStore.ts` | 새 지도 면적 측정 |
| `store/appStatus.ts` | `_layout.tsx` 사용 |
| `store/permissionStore.ts` | `_layout.tsx` 사용 |

---

## 2. Success Criteria

| # | 기준 | 검증 방법 |
|---|------|----------|
| SC-1 | 대상 파일/디렉토리 전수 삭제 | `find` 명령으로 존재 여부 확인 |
| SC-2 | `_layout.tsx`에서 RefProvider 제거 | 빌드 확인 |
| SC-3 | TypeScript 빌드 성공 (관련 에러 0건) | `npx tsc --noEmit` |
| SC-4 | 앱 정상 동작 (홈, 지도, 조사, 내정보 탭) | 수동 확인 |
| SC-5 | 삭제 파일 수 50+ | git diff --stat |

---

## 3. Risks

| # | 리스크 | 대응 |
|---|--------|------|
| R-1 | 간접 참조 누락으로 빌드 실패 | 삭제 후 즉시 `tsc --noEmit` 확인, 실패 시 복원 |
| R-2 | 런타임 동적 import | `require()` 패턴 검색으로 사전 확인 |
| R-3 | expo-router가 app/map/inspect 등을 라우트로 인식 | 삭제하면 라우트도 제거됨 — 정상 |

---

## 4. Implementation Order

1. [ ] `app/refContext.tsx` 삭제 + `app/_layout.tsx`에서 RefProvider 제거
2. [ ] `app/map/inspect/`, `app/map/search/`, `app/map/setting/` 삭제
3. [ ] `src/map/` 디렉토리 삭제
4. [ ] 레거시 store 6개 삭제 (bottom, option, search, code, shelter, inspect)
5. [ ] `app/js/` 디렉토리 삭제
6. [ ] 빌드 확인 (`npx tsc --noEmit`)
7. [ ] 앱 실행 테스트

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-06 | Initial draft | JY Kim |
