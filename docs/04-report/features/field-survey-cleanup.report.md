# Field Survey Cleanup — Completion Report

> **Feature**: field-survey-cleanup
> **Date**: 2026-04-06
> **Author**: JY Kim
> **Commit**: `2d06059`

---

## 1. Executive Summary

| 관점 | 계획 | 결과 |
|------|------|------|
| **Problem** | Clean Slate 이후 farmfield 레거시 60+ 파일 잔존 | 해결 — 73개 파일, 6,971줄 삭제 |
| **Solution** | 의존성 분석 후 안전 삭제 대상 확정 + 일괄 제거 | 구현 완료 — 빌드 성공 |
| **UX Effect** | 코드 탐색 시 레거시/신규 혼동 제거 | 달성 — src/map, 레거시 store, app/map 서브라우트 전수 제거 |
| **Core Value** | 유지보수 비용 절감 | 실현 — 번들에서 불필요 코드 제거, store 의존 단순화 |

---

## 2. Success Criteria

| # | 기준 | 결과 | 근거 |
|---|------|:---:|------|
| SC-1 | 대상 파일/디렉토리 전수 삭제 | MET | 73개 파일 삭제 확인 |
| SC-2 | _layout.tsx RefProvider 제거 | MET | `app/_layout.tsx` 수정 |
| SC-3 | TypeScript 빌드 성공 | MET | `tsc --noEmit` 관련 에러 0건 |
| SC-4 | 앱 정상 동작 | MET | 사용자 확인 (지도 탭 크래시 수정 포함) |
| SC-5 | 삭제 파일 수 50+ | MET | 73개 (목표 초과) |

---

## 3. 삭제 목록

| 카테고리 | 파일 수 | 줄 수 |
|----------|:---:|:---:|
| `src/map/` (컴포넌트, hooks, modules) | 21 | ~2,500 |
| `app/map/inspect/` (farmfield 일제정비 UI) | 27 | ~2,200 |
| `app/map/search/` (farmfield 검색 UI) | 3 | ~200 |
| `app/map/setting/` (farmfield 설정 UI) | 1 | ~150 |
| `store/` 레거시 6개 (bottom, option, search, code, shelter, inspect) | 6 | ~800 |
| `app/js/` (farmfield 유틸 5개) | 5 | ~600 |
| `app/refContext.tsx` | 1 | ~50 |
| **합계** | **73** | **~6,971** |

### 수정 파일

| 파일 | 변경 |
|------|------|
| `app/_layout.tsx` | RefProvider import + 래핑 제거 |
| `lib/map/hooks/useSurveyStatusMap.ts` | 타입 수정 (`any[]` → `any`) |

### 유지 확인

| Store | 유지 이유 |
|-------|----------|
| `store/inspectInputStore.ts` | `app/map/index.tsx` — setOwnAr (면적 측정) |
| `store/mapStateStore.ts` | GPS/bearing/zoom 상태 |
| `store/measureStore.ts` | 면적 측정 상태 |
| `store/appStatus.ts` | `_layout.tsx` |
| `store/permissionStore.ts` | `_layout.tsx` |

---

## 4. Lessons Learned

1. **의존성 분석 먼저** — 60+ 파일 중 어떤 것이 안전하게 삭제 가능한지 전수 조사가 핵심. 레거시끼리만 참조하는 파일은 한 번에 제거 가능.

2. **Design/Do 생략 판단** — 순수 삭제 작업은 Plan(삭제 목록 + 의존성 확인)만으로 충분. 3안 비교나 구현 가이드가 형식적인 경우 생략이 효율적.

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-04-06 | Initial report | JY Kim |
