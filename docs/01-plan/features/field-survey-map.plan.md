# Field Survey Map — Plan

> **Summary**: 조사원 할당 필지 상태 색상 가시화 (WFS 벡터) + 지도→조사 진입 + GIS 코드 마이그레이션
>
> **Project**: agmap
> **Author**: JY Kim
> **Date**: 2026-04-05
> **Status**: Draft

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 지도에서 필지 조사 상태(미조사/진행중/완료/반려)가 표시되지 않아 조사원이 "어디를 갔고, 어디를 가야 하는지" 한눈에 파악 불가 |
| **Solution** | `my-assignments` PNU 기반 WFS 벡터 렌더링(FillLayer)으로 내 할당 필지 상태별 색상 표시 + 필지 탭 → 조사 폼 직접 진입 |
| **UX Effect** | 조사원이 지도를 열면 본인 할당 필지의 현황 즉시 파악 → 미조사/반려 필지로 빠르게 이동 → 탭 한 번으로 조사 시작 |
| **Core Value** | 현장 조사 효율 극대화 — 이동 시간 최소화, 누락 방지, 본인 작업 현황 실시간 확인 |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 지도에 조사 상태가 없어 조사원이 현장에서 할당 목록과 지도를 번갈아 확인해야 함 |
| **WHO** | SURVEYOR (현장 조사원 5,000명, 비전문가 외주/알바) — 본인 할당 필지만 대상 |
| **RISK** | 할당 PNU와 WFS 필지 geometry 매칭 정확도, 기존 지도 기능 회귀 |
| **SUCCESS** | 지도에서 내 할당 필지 상태 색상 확인 → 필지 탭 → 조사 시작 플로우 완성 + 상태 필터 동작 |
| **SCOPE** | 1순위: WFS 벡터 상태 색상 + 필터 / 2순위: 필지→조사 연동 + 범례 / 3순위: src/map→lib/map 마이그레이션 |

---

## 1. Overview

### 1.1 Purpose

field-survey PDCA에서 Phase 0~3(인증, 홈, 조사폼, 제출)을 완료했으나, 지도 탭은 farmfield 레거시 그대로 유지 중이다. 본 PDCA는 **지도 탭에 조사 상태별 필지 색상 가시화**를 추가하여, 조사원이 현장에서 "어디를 가야 하고, 어디를 했는지" 즉시 파악할 수 있게 한다.

### 1.2 Background

- field-survey 1차 PDCA 완료 (Match Rate ~90%), Report에서 후속 `field-survey-map` PDCA 권고
- 현재 지도(`app/map/index.tsx`)는 필지 경계 + 면적 측정 + GPS 추적만 제공
- 서비스 설계서 §5-2에 조사 지도 상세 스펙 정의됨 (상태 마커, 줌 레벨별 표현, 필지 팝업 등)
- 5,000명 조사원이 각자 수십~수백 필지를 방문해야 하므로, 지도 가시화가 업무 효율의 핵심

### 1.3 Related Documents

| 문서 | 위치 | 핵심 내용 |
|------|------|----------|
| 서비스 설계서 §5-2 | `docs/field-survey-service-design.md:413` | 조사 지도 기능 정의, 줌 레벨별 표현, 상태 마커 |
| field-survey Plan | `docs/01-plan/features/field-survey.plan.md` | Phase 4 = 지도 탭 |
| field-survey Report | `docs/04-report/features/field-survey.report.md:182` | 후속 PDCA로 field-survey-map 권고 |
| known-gaps | `docs/field-survey/known-gaps.md` | D-6 정사영상, G-5 영상커버리지 미구현 |
| mobile-api-spec | `docs/field-survey/mobile-api-spec.md` | my-assignments API 스펙 |

---

## 2. Scope

### 2.1 In Scope

- [ ] **WFS 벡터 상태 레이어**: my-assignments PNU 목록으로 기존 WFS에서 필지 geometry fetch → MapLibre FillLayer로 상태별 색상 렌더링
- [ ] **상태 색상 5종**: 미조사(빨강), 진행중/DRAFT(노랑), 제출/SUBMITTED(파랑), 승인/APPROVED(초록), 반려/REJECTED(주황)
- [ ] **상태 필터**: "미조사만 보기", "반려만 보기" 등 클라이언트 필터 토글
- [ ] **필지 탭 팝업**: 할당 필지 탭 시 상태 + 주소 + 조사일 팝업 표시
- [ ] **필지→조사 연동**: 팝업 내 "조사 시작" 버튼 → `survey/[id]` 직접 진입
- [ ] **범례 UI**: 하단 색상 범례 토글 (첫 사용 시 자동 표시)
- [ ] **src/map → lib/map 마이그레이션**: GIS 유틸(transform, hooks) 이식 가능 구조로 이동

### 2.2 Out of Scope

- **관리자(MANAGER/ADMIN) 전체 현황 지도** — 수만 건 동적 렌더링 전략 별도 검토 필요 (후속 PDCA)
- 정사영상 레이어 (projectId 매핑 API 없음 — known-gaps D-6)
- 영상 커버리지 정보 표시 (API 없음 — known-gaps G-5)
- 근거리 줌 사진 썸네일 (사진 서빙 최적화 필요, 후속)
- 클러스터링 (원거리 밀집 뱃지)
- 반려 깜빡임 애니메이션
- 오프라인 지도 타일 (별도 PDCA: field-survey-offline)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | 요구사항 | 우선순위 | 상태 |
|----|----------|:---:|------|
| FR-01 | `my-assignments` PNU 목록으로 기존 WFS(`v_fml_lot`)에서 해당 필지 geometry fetch | High | Pending |
| FR-02 | MapLibre FillLayer + data-driven styling으로 상태별 5색 벡터 렌더링 | High | Pending |
| FR-03 | 할당 필지 탭 시 상태+주소+조사일 팝업 표시 (ShapeSource onPress) | High | Pending |
| FR-04 | 상태 필터 토글 — 클라이언트 GeoJSON 필터링 (미조사만/반려만 등) | High | Pending |
| FR-05 | 필지 팝업에서 "조사 시작" → assignmentId 기반 survey/[id] 진입 | High | Pending |
| FR-06 | 색상 범례 UI (토글, 첫 사용 시 자동 표시) | Medium | Pending |
| FR-07 | src/map → lib/map 마이그레이션 (transform, hooks, constants) | Medium | Pending |

### 3.2 Non-Functional Requirements

| 카테고리 | 기준 | 측정 방법 |
|----------|------|----------|
| 성능 | 할당 필지 WFS fetch + 렌더링 < 3초 (수백 건 기준, LTE) | 네트워크 탭 + FPS 확인 |
| 가시성 | 벡터 FillLayer로 줌 레벨 무관 선명한 색상 구분 | 위성지도 위 육안 확인 |
| 반응성 | 필지 탭 → 팝업 표시 즉시 (ShapeSource 내장 이벤트) | 탭 응답 체감 |
| 호환성 | 기존 farmfield 지도 기능(면적 측정, 검색, GPS) 유지 | 기존 기능 수동 확인 |

---

## 4. Success Criteria

### 4.1 Definition of Done

| # | 기준 | 검증 방법 |
|---|------|----------|
| SC-1 | 지도에서 내 할당 필지가 조사 상태별 5색 벡터로 표시됨 | FillLayer 육안 확인 |
| SC-2 | 상태 필터 토글 시 해당 상태 필지만 표시됨 | "미조사만" 필터 ON → 빨강 필지만 |
| SC-3 | 할당 필지 탭 → 상태+주소+조사일 팝업 표시 | ShapeSource onPress 동작 확인 |
| SC-4 | 팝업 "조사 시작" → survey/[assignmentId] 화면 진입 | router.push 네비게이션 확인 |
| SC-5 | 범례 UI 토글 동작 | 범례 표시/숨기기 |
| SC-6 | 기존 지도 기능(면적 측정, 필지 선택, 검색, GPS) 정상 동작 | 기존 기능 회귀 확인 |
| SC-7 | src/map 핵심 모듈이 lib/map으로 이동, import 경로 정상 | 빌드 성공 + 기존 기능 유지 |

### 4.2 Quality Criteria

- [ ] 빌드 에러 0개
- [ ] TypeScript strict 타입 에러 0개
- [ ] 기존 지도 기능 회귀 없음

---

## 5. Risks and Mitigation

| # | 리스크 | 영향 | 확률 | 대응 |
|---|--------|------|------|------|
| R-1 | PNU 매칭 실패 — my-assignments의 address만으로는 WFS 필지 특정 불가 | 높 | 중 | 할당 API에 PNU 필드 포함 여부 확인. 없으면 주소 기반 geocoding 또는 Web팀에 PNU 추가 요청 |
| R-2 | 할당 수백 건 WFS 일괄 쿼리 시 CQL_FILTER 길이 제한 | 중 | 중 | PNU 목록을 batch 분할 (50건씩) 또는 bbox 기반 fetch 후 클라이언트 필터 |
| R-3 | src/map → lib/map 마이그레이션 시 import 깨짐 | 중 | 중 | 단계적 이동 — 먼저 lib/map에 복사, re-export로 호환 유지, 확인 후 src/map 제거 |
| R-4 | 기존 필지 탭(inspect 패널)과 상태 팝업 충돌 | 중 | 중 | 상태 레이어 필지 탭 우선 → 기존 inspect 로직과 통합 설계 |
| R-5 | farmfield proxy 의존 (farmfield.kr/proxy.jsp) | 높 | 낮 | 현행 구조 그대로 유지. 추후 agmap 자체 프록시로 전환 가능 |

---

## 6. Impact Analysis

### 6.1 Changed Resources

| Resource | Type | 변경 내용 |
|----------|------|----------|
| `app/map/index.tsx` | Screen | 상태 레이어 + 팝업 + 필터 + 범례 추가 |
| `src/map/components/GeoserverLayers.tsx` | Component | 상태 WMS/WFS 레이어 추가 (또는 별도 컴포넌트) |
| `src/map/components/` → `lib/map/` | Folder | 마이그레이션 (이동 + re-export) |
| `app/(tabs)/map.tsx` | Re-export | lib/map import 경로 변경 없음 (app/map/index.tsx 유지) |

### 6.2 Current Consumers

| Resource | Operation | Code Path | Impact |
|----------|-----------|-----------|--------|
| `app/map/index.tsx` | RENDER | `app/(tabs)/map.tsx` → re-export | None (진입점 유지) |
| `src/map/components/*` | IMPORT | `app/map/index.tsx` 내 14개 import | **마이그레이션 시 경로 변경** — re-export로 호환 |
| `src/map/hooks/useUserTracking.ts` | IMPORT | `app/map/index.tsx:36` | lib/map으로 이동 후 re-export |
| `src/map/hooks/useMapPersistence.ts` | IMPORT | `app/map/index.tsx:35` | lib/map으로 이동 후 re-export |
| `src/map/modules/gis/transform.ts` | IMPORT | `src/map/components/` 내부 | lib/map/utils/로 이동 |
| `store/inspectStore` | STATE | `app/map/index.tsx:171` | 필지 탭 팝업에서 추가 사용 가능 |
| `lib/store/assignments.ts` | STATE | `app/(tabs)/index.tsx` (홈) | 지도에서도 참조 — 오늘 할당 강조용 |

### 6.3 Verification

- [ ] 마이그레이션 후 모든 import 정상 (빌드 확인)
- [ ] 기존 지도 기능 (면적 측정, 필지 WFS 쿼리, GPS, 검색) 정상
- [ ] 기존 레이어 토글 (farmMap, inspect25, fieldMap25 등) 정상

---

## 7. Architecture Considerations

### 7.1 Project Level

| Level | Selected |
|-------|:--------:|
| **Dynamic** | ● |

기존 field-survey 설계(Option B: Clean Architecture)를 계승. `lib/` 계층 분리 + zustand store + expo-router.

### 7.2 Key Architectural Decisions

| 결정 | 선택지 | 선택 | 근거 |
|------|--------|------|------|
| 렌더링 방식 | WMS(래스터) / WFS+FillLayer(벡터) / MVT(벡터타일) | **WFS + FillLayer** | 벡터=줌 무관 선명, 기존 WFSSource 패턴 확장, 조사원 할당 수백 건이면 성능 OK |
| 데이터 소스 | Geoserver 뷰(서버 JOIN) / 클라이언트 매칭(my-assignments + WFS) | **클라이언트 매칭** | 조사 상태는 동적(수시 변경) → 타일 캐싱 불가. 조사원은 본인 할당만 보면 되므로 소량 데이터 |
| 스타일링 | SLD(서버) / MapLibre data-driven(클라이언트) | **MapLibre data-driven** | `['match', ['get', 'survey_status'], ...]` 표현식으로 벡터 스타일링. 줌 레벨 무관 선명 |
| 필터 구현 | CQL_FILTER(서버) / 클라이언트 GeoJSON 필터 | **클라이��트 필터** | GeoJSON 메모리에 이미 로드됨, filter 표현식으로 즉시 토글 |
| 팝업 UI | BottomSheet / Modal / Callout | **Callout(팝업)** | 설계서 §5-2 정의대로 필지 위 팝업, 기존 inspect 패널과 병행 |
| 마이그레이션 전략 | 한번에 이동 / 점진적(re-export) | **점진적** | re-export로 기존 import 호환 유지, 확인 후 src/map 제거 |
| 관리자 지도 | 이번 포함 / 후속 PDCA | **후속** | 수만 건 동적 렌더링은 별도 전략(MVT or 서버 렌더링) 필요 |

### 7.3 렌더링 아키텍처 — 클라이언트 매칭 방식

> **핵심 아이디어**: 필지 geometry(정적) + 조사 상태(동적)를 클라이언트에서 합성

```
┌─ 데이터 흐름 ─────────────────────────────────────────────┐
│                                                           │
│  1. my-assignments API → Assignment[] (PNU + status)      │
│     └─ 이미 홈 탭에서 fetch 중 (zustand store 공유)         │
│                                                           │
│  2. 기존 WFS (v_fml_lot) → 필지 geometry (bbox 기반)       │
│     └─ 현행 WFSSource 패턴 그대로                          │
│                                                           │
│  3. 클라이언트 JOIN: PNU 키로 geometry + status 합성        │
│     └─ GeoJSON features에 survey_status property 주입      │
│                                                           │
│  4. MapLibre FillLayer + data-driven styling               │
│     └─ ['match', ['get', 'survey_status'], ...] 으로 5색   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

#### 상태별 색상 정의

| survey_status | 색상 | Fill Opacity | Stroke | Stroke Width |
|---------------|------|:---:|--------|:---:|
| 미할당/미조사 (resultId=null, status=null) | #E03131 (빨강) | 0.45 | #C92A2A | 1.5px |
| 임시저장 `DRAFT` | #FCC419 (노랑) | 0.45 | #E67700 | 1.5px |
| 제출 `SUBMITTED` | #339AF0 (파랑) | 0.45 | #1971C2 | 1.5px |
| 승인 `APPROVED` | #51CF66 (초록) | 0.45 | #2F9E44 | 1.5px |
| 반려 `REJECTED` | #FF922B (주황) | 0.55 | #E8590C | 2px |

> 반려(REJECTED)는 opacity와 stroke를 더 강하게 하여 시인성 확보.
> 벡터 렌더링이므로 위성지도 위에서도 줌 레벨 무관 선명.

#### WMS 대비 장점

| | WMS (래스터) | WFS + FillLayer (벡터) |
|---|---|---|
| 선명도 | 256px 타일 경계 픽셀화 | 줌 무관 항상 선명 |
| 캐싱 | 상태 변경 시 무효화 필요 | 불필요 (매번 fresh fetch) |
| 인터랙션 | 별도 WFS 쿼리 필요 | ShapeSource 탭 이벤트 내장 |
| 필터 | CQL_FILTER (서버 재요청) | 클라이언트 즉시 토글 |
| Web팀 의존 | SLD/뷰 발행 필요 | 불필요 (기존 인프라) |
| 제한 | — | 조사원 할당 수백 건에서만 적합 |

---

## 8. Convention Prerequisites

### 8.1 Existing Conventions

- [x] `CLAUDE.md` 존재 (프로젝트 규칙)
- [x] TypeScript strict (`tsconfig.json`)
- [x] field-survey Design: Option B Clean Architecture (`lib/` 계층 분리)
- [x] zustand store 패턴 (`lib/store/`)
- [x] `src/map/components/` 컴포넌트 패턴 (memo, 레이어별 분리)

### 8.2 마이그레이션 네이밍 규칙

| 대상 | 현재 | 이동 후 |
|------|------|---------|
| GIS 컴포넌트 | `src/map/components/*.tsx` | `lib/map/components/*.tsx` |
| Hooks | `src/map/hooks/*.ts` | `lib/map/hooks/*.ts` |
| Utils | `src/map/modules/gis/transform.ts` | `lib/map/utils/transform.ts` |
| Constants | (inline in map/index.tsx) | `lib/map/constants.ts` |
| Re-export | — | `src/map/components/` → `lib/map/` re-export 유지 |

---

## 9. Implementation Phases

| Phase | 범위 | 선행 조건 |
|-------|------|----------|
| **Phase A** | src/map → lib/map 마이그레이션 (re-export 호환) | — |
| **Phase B** | 상태 레이어 — my-assignments PNU + WFS geometry 합성 → FillLayer 렌더링 | Phase A |
| **Phase C** | 필지 탭 팝업 + "조사 시작" → survey/[id] 연동 | Phase B |
| **Phase D** | 상태 필터 토글 + 범례 UI | Phase B |

---

## 10. Web팀 확인/요청 사항

> Geoserver 뷰/SLD 발행 요청 제거 (클라이언트 매칭 방식 채택).
> 아래는 확인이 필요한 사항만 남김.

| # | 항목 | 설명 | 긴급도 |
|---|------|------|:---:|
| W-MAP-1 | **할당 API에 PNU 포함 확인** | `my-assignments` 응답에 PNU 필드가 있어야 WFS geometry 매칭 가능. 없으면 추가 요청 | 필수 |
| W-MAP-2 | **기존 WFS 필지 쿼리 안정성** | PNU 기반 CQL_FILTER (`pnu IN ('1234', '5678', ...)`) 수백 건 쿼리 시 정상 동작 확인 | 권장 |

> **관리자 전체 현황 지도**: MANAGER/ADMIN용 수만 건 동적 렌더링은 별도 PDCA에서 Geoserver 뷰 + MVT 등 서버 전략과 함께 검토.

---

## 11. Next Steps

1. [ ] 할당 API PNU 필드 포함 여부 확인 (W-MAP-1)
2. [ ] Design 문서 작성 (`/pdca design field-survey-map`)
3. [ ] 목업 확인 (`docs/02-design/mockup/` — 지도 팝업/범례 UI)
4. [ ] 구현 시작

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-05 | Initial draft | JY Kim |
| 0.2 | 2026-04-05 | 렌더링 방식 변경: WMS/Geoserver 뷰 → WFS+FillLayer 클라이언트 매칭. SURVEYOR 할당 필지 전용. 관리자 전체 현황은 후속 PDCA | JY Kim |
