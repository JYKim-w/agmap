# field-survey-map-ux Design Document

> **Summary**: 지도 화면 가시화 전면 재설계 — 줌 4단계 레이어 전략 + 2축 인코딩 + 성능 개선
>
> **Project**: agmap (Mobile)
> **Version**: 1.0.0
> **Author**: JY Kim
> **Date**: 2026-04-23
> **Status**: Draft
> **Planning Doc**: [field-survey-map-ux.plan.md](../01-plan/features/field-survey-map-ux.plan.md)

### Pipeline References

| Phase | Document | Status |
|-------|----------|--------|
| Phase 3 | Mockup | N/A (지도 레이어 재설계, 스크린 레이아웃 변경 없음) |
| Phase 4 | API Spec | N/A (순수 프론트엔드 리팩토링, 기존 API 재사용) |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 현 지도는 단순 색상 확인 이상의 현장 정보를 제공 못 함. 성능 병목(N geom API)과 시각 노이즈(겹치는 원)도 문제. |
| **WHO** | SURVEYOR — 현장 조사원, 햇볕 아래 스마트폰 1인칭 사용 |
| **RISK** | Assignment.lon/lat 없는 경우 centroid fallback 필요. VWorld 지적도 MVT 지원 여부 확인 필요. |
| **SUCCESS** | 줌 전 구간에서 상태+긴급도 즉시 식별. 초기 로딩 < 2초. 팝업에 D-Day·위험등급 표시. |
| **SCOPE** | SurveyStatusLayer 재설계 + useParcelStyle 신규 + usePolygonGeoms 리네임 + StatusPopup 확장 + AssignmentSheet 제거 |

---

## 1. Overview

### 1.1 Design Goals

- **성능**: `Assignment.lon/lat`로 중심점 즉시 표시 → 지도 탭 진입 시 API 대기 없음
- **가시화**: 줌 4단계 레이어 전략으로 어느 줌에서든 상태 식별 가능
- **정보 밀도**: 상태(Fill) × 기한긴급도(Stroke/Ring) 2축 인코딩으로 한눈에 우선순위 파악
- **야외 가독성**: 직사광선 환경에 최적화된 채도 높은 색상 시스템
- **단순화**: AssignmentSheet 제거로 지도 화면 제스처 충돌 해소

### 1.2 Design Principles

- **Zero API for centroids**: lon/lat 직접 사용, geom API는 고줌 폴리곤에만
- **Pre-attentive encoding**: 상태는 Fill(색), 긴급도는 Stroke(두께+색) — 즉각 인지 가능
- **Lazy loading**: 폴리곤은 z ≥ 13 진입 시만 fetch
- **Co-location**: urgency 계산은 useParcelStyle 내부 — 외부 util 없이 충분

---

## 2. Architecture

### 2.0 Architecture Comparison

| Criteria | Option A: Minimal | Option B: Clean | **Option C: Pragmatic ✓** |
|----------|:-:|:-:|:-:|
| New Files | 0 | 4 | **2** |
| Modified Files | 4 | 3 | **3** |
| Deleted Files | 1 | 2 | **2** |
| Hook 가독성 | 낮음 (비대) | 높음 | **높음** |
| 파일 수 | 최소 | 최대 | **균형** |
| YAGNI 위험 | 없음 | 있음 | **없음** |
| **Recommendation** | 단기 hotfix | 장기 대형 | **✓ Default** |

**Selected**: Option C — Pragmatic Balance  
**Rationale**: urgency 계산이 useParcelStyle 외부에서 재사용될 가능성 낮음. util 분리는 YAGNI. 2 신규 hook으로 상태/스타일 책임 분리 충분.

### 2.1 Component Diagram

```
[app/map/index.tsx]
        │
        ├── useParcelStyle(assignments, rejected)  ← NEW
        │     └── centroid FeatureCollection (lon/lat, 0 API)
        │     └── urgency 계산 (dueDate 기반)
        │     └── style properties (statusFill, urgencyColor, ...)
        │
        ├── usePolygonGeoms(statusMap, enabled)    ← RENAMED+MODIFIED
        │     └── enabled=false → no fetch (lazy)
        │     └── cache 유지 (assignmentId → geometry)
        │
        ├── SurveyStatusLayer(centroidCollection, polygonCollection, ...)  ← REWRITE
        │     ├── z < 10: ClusterLayer (버블 + 카운트)
        │     ├── z 10–13: CircleLayer×2 (outer ring + inner fill) + SymbolLayer (D-Day)
        │     ├── z 13–16: FillLayer + LineLayer×2 + CircleLayer (dot)
        │     └── z ≥ 16: SymbolLayer (D-Day 텍스트 폴리곤 내부)
        │
        └── StatusPopup(entry)                     ← EXTENDED
              └── D-Day badge + rejectCount + validationWarnings
```

### 2.2 Data Flow

```
assignments + rejected (store)
        │
        ▼
useParcelStyle
  ├── 상태 계산: resultId + resultStatus → SurveyStatus
  ├── 긴급도 계산: dueDate → UrgencyLevel + dDayLabel
  ├── 스타일 매핑: status × urgency → colors, widths
  └── centroid GeoJSON: lon/lat → FeatureCollection (cluster 지원)
        │
        ▼
[Source 1] centroidSource → ClusterLayer / MarkerLayers
[Source 2] polygonSource (z≥13 lazy) → FillLayer + LineLayers

사용자 탭 → onParcelPress(pnu) → statusMap.get(pnu) → StatusPopup
```

### 2.3 Dependencies

| Component | Depends On | Change |
|-----------|-----------|--------|
| useParcelStyle | Assignment store, lib/map/types | NEW |
| usePolygonGeoms | getAssignmentGeom API, cache ref, statusMap, activeFilters | RENAME from useAssignmentGeoms |
| SurveyStatusLayer | MapLibreGL, centroid/polygon sources | REWRITE |
| StatusPopup | lib/map/types (ParcelStatusEntry) | EXTEND |
| app/map/index.tsx | useParcelStyle, usePolygonGeoms, mapStateStore | MODIFY |

> **Fix #3/#4 반영**: `usePolygonGeoms`는 `statusMap`(urgency props 조회)과 `activeFilters`(필터 동기화) 두 파라미터를 추가로 받음. polygon features에 urgencyStroke/urgencyWidth/urgencyOpacity 포함. centroid와 동일한 필터 적용.

---

## 3. Data Model

### 3.1 Type Definitions

```typescript
// lib/map/types.ts 추가

/** 기한 긴급도 4단계 */
export type UrgencyLevel = 'OVERDUE' | 'CRITICAL' | 'WARNING' | 'NORMAL';

/** 미완료 상태 (긴급도 적용 대상) */
const INCOMPLETE_STATUSES: SurveyStatus[] = ['NOT_SURVEYED', 'DRAFT', 'REJECTED'];

/** 모던 야외 색상 시스템 (기존 STATUS_COLORS 대체) */
export const STATUS_COLORS: Record<SurveyStatus, { fill: string; stroke: string }> = {
  NOT_SURVEYED: { fill: '#FF4D4D', stroke: '#CC0000' },  // 밝은 빨강 — 미조사
  DRAFT:        { fill: '#FFD43B', stroke: '#CC8800' },  // 밝은 노랑 — 임시저장
  SUBMITTED:    { fill: '#4DABF7', stroke: '#1971C2' },  // 밝은 파랑 — 제출
  APPROVED:     { fill: '#69DB7C', stroke: '#2F9E44' },  // 밝은 초록 — 승인
  REJECTED:     { fill: '#FFA94D', stroke: '#C94400' },  // 밝은 주황 — 반려
};

/** 긴급도별 시각 속성 */
export const URGENCY_STYLES: Record<UrgencyLevel, {
  strokeColor: string;
  strokeWidth: number;
  strokeOpacity: number;
  ringColor: string;
  textColor: string;
}> = {
  OVERDUE:  { strokeColor: '#FA5252', strokeWidth: 5, strokeOpacity: 1.0, ringColor: '#FA5252', textColor: '#FA5252' },
  CRITICAL: { strokeColor: '#FD7E14', strokeWidth: 4, strokeOpacity: 0.9, ringColor: '#FD7E14', textColor: '#FD7E14' },
  WARNING:  { strokeColor: '#FAB005', strokeWidth: 3, strokeOpacity: 0.7, ringColor: '#FAB005', textColor: '#E67700' },
  NORMAL:   { strokeColor: 'transparent', strokeWidth: 2, strokeOpacity: 0, ringColor: 'transparent', textColor: 'transparent' },
};

/** centroid GeoJSON feature에 담기는 스타일 properties */
export interface ParcelStyleProperties {
  pnu: string;
  assignmentId: number;
  status: SurveyStatus;
  // Axis 1 — 상태 색
  statusFill: string;
  statusStroke: string;
  // Axis 2 — 긴급도
  urgencyLevel: UrgencyLevel;
  urgencyPriority: number;    // Fix #1: cluster 집계용 숫자 (OVERDUE=3, CRITICAL=2, WARNING=1, NORMAL=0)
  urgencyColor: string;       // ring/cluster 색
  urgencyStroke: string;      // polygon stroke 색
  urgencyWidth: number;
  urgencyOpacity: number;
  urgencyTextColor: string;
  // D-Day 표시
  dDayLabel: string;          // 'D-3', '기한초과', '' (여유 있음)
  // 기타
  priority: number;
}

/** ParcelStatusEntry — StatusPopup에 전달 (기존 + 확장) */
export interface ParcelStatusEntry {
  pnu: string;
  assignmentId: number;
  status: SurveyStatus;
  address: string;
  surveyedAt: string | null;
  riskGrade: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: string;             // 추가
  urgencyLevel: UrgencyLevel;  // 추가
  dDayLabel: string;           // 추가
  rejectCount?: number;        // 추가
  validationWarnings?: string | null;  // 추가
}
```

### 3.2 긴급도 계산 로직

```typescript
// useParcelStyle 내부 — computeUrgency(dueDate, status)

// Fix #1: urgencyPriority 숫자 매핑 (클러스터 max 집계용)
const URGENCY_PRIORITY: Record<UrgencyLevel, number> = {
  OVERDUE: 3, CRITICAL: 2, WARNING: 1, NORMAL: 0,
};

function computeUrgency(dueDate: string, status: SurveyStatus): {
  level: UrgencyLevel; priority: number; dDayLabel: string;
} {
  // 완료/제출된 상태는 긴급도 미적용
  if (!INCOMPLETE_STATUSES.includes(status)) {
    return { level: 'NORMAL', priority: 0, dDayLabel: '' };
  }
  try {
    const diffDays = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
    if (diffDays < 0)  return { level: 'OVERDUE',  priority: 3, dDayLabel: '기한초과' };
    if (diffDays <= 3) return { level: 'CRITICAL', priority: 2, dDayLabel: `D-${diffDays}` };
    if (diffDays <= 7) return { level: 'WARNING',  priority: 1, dDayLabel: `D-${diffDays}` };
  } catch {}
  return { level: 'NORMAL', priority: 0, dDayLabel: '' };
}
```

### 3.3 클러스터 긴급도 색상 집계 (Fix #1)

```typescript
// ShapeSource clusterProperties: 숫자 max 집계
clusterProperties={{
  urgencyPriority: ['max', ['get', 'urgencyPriority']]
}}

// CircleLayer — 집계된 숫자를 색상으로 변환
circleColor: [
  'step', ['get', 'urgencyPriority'],
  '#4DABF7',   // 0: NORMAL → 파랑 (기본)
  1, '#FAB005', // 1: WARNING → 노랑
  2, '#FD7E14', // 2: CRITICAL → 주황
  3, '#FA5252', // 3: OVERDUE → 빨강
]
// 비클러스터 포인트는 ['get', 'urgencyColor'] 그대로 사용
```

### 3.4 usePolygonGeoms 책임 명세 (Fix #3/#4)

```typescript
// 시그니처
function usePolygonGeoms(
  statusMap: Map<string, ParcelStatusEntry>,  // urgencyLevel 포함
  enabled: boolean,
  activeFilters: Set<SurveyStatus>,           // Fix #4: centroid와 동일 필터
): GeoJSON.FeatureCollection

// polygon feature properties (Fix #3: urgency props 추가)
properties: {
  pnu, assignmentId, status,
  fillColor,    statusStroke,          // Axis 1
  urgencyStroke, urgencyWidth, urgencyOpacity,  // Axis 2 (statusMap에서 조회)
}
// statusMap.get(a.pnu)?.urgencyLevel → URGENCY_STYLES[level] 조회
// activeFilters.size > 0 && !activeFilters.has(status) → skip (Fix #4)
```

---

## 4. API Specification

### 4.1 Reused APIs (변경 없음)

| API | 현재 사용 | 변경 |
|-----|---------|------|
| `GET /assignments/my` | assignments + rejected store | 없음 — Assignment.lon/lat 직접 활용 |
| `GET /assignments/:id/geom` | useAssignmentGeoms → usePolygonGeoms | lazy 로딩 조건 추가 (enabled flag) |

### 4.2 변경 없는 이유

중심점 마커: `Assignment.lon` / `Assignment.lat` 직접 사용 → **geom API 불필요**  
폴리곤: 기존 `getAssignmentGeom(assignmentId)` 유지 (URL/파라미터 변경 없음)

---

## 5. UI/UX Design

### 5.1 지도 화면 레이아웃

```
┌─────────────────────────────┐
│  [SearchBar]                │  ← 기존 유지
│                             │
│                             │
│    [MapView]                │
│    ┌───────────────────┐    │
│    │  z < 10: 클러스터  │    │
│    │  z10-13: 마커      │    │
│    │  z13-16: 폴리곤+dot │   │
│    │  z≥16: 폴리곤+텍스트│   │
│    └───────────────────┘    │
│                             │
│  [MapControls]              │  ← 기존 유지
│  [StatusFilter]             │  ← 기존 유지
│  [StatusLegend]             │  ← 기존 유지 (색상 업데이트)
│                             │
│  (AssignmentSheet 삭제)     │  ← 제거
└─────────────────────────────┘
```

### 5.2 줌 레벨별 User Flow

```
앱 진입 → (기본 zoom 13) → 폴리곤+dot 표시
           줌아웃(z<10) → 클러스터 버블 (필지수 + 긴급도 색)
           클러스터 탭  → 해당 영역 줌인 (자동)
           줌 10-13    → 개별 마커 (상태 fill + 긴급도 ring)
           마커 탭      → StatusPopup (D-Day + 위험등급 + 반려횟수)
           팝업 탭      → "조사 시작" → survey/[id] 이동
```

### 5.3 Component List

| Component | Location | Responsibility | Change |
|-----------|----------|----------------|--------|
| SurveyStatusLayer | lib/map/components/ | 4단계 줌 레이어 렌더링 | **REWRITE** |
| StatusPopup | lib/map/components/ | 팝업 — D-Day + rejectCount | **EXTEND** |
| StatusLegend | lib/map/components/ | 색상 범례 | 색상 업데이트만 |
| AssignmentSheet | components/map/ | 하단 배정 목록 시트 | **DELETE** |

### 5.4 Page UI Checklist

#### 지도 화면 (app/map/index.tsx)

**줌 레벨별 레이어:**
- [ ] z < 10: 클러스터 버블 표시 (필지 수 텍스트 포함)
- [ ] z < 10: 클러스터 색상 = 내부 최고 긴급도 (OVERDUE→빨강, CRITICAL→주황, WARNING→노랑, NORMAL→상태색)
- [ ] z 10–13: 개별 마커 outer ring (urgencyColor, opacity 0.3, radius 18)
- [ ] z 10–13: 개별 마커 inner fill (statusFill, radius 14, white stroke)
- [ ] z 10–13: D-Day 텍스트 (OVERDUE/CRITICAL/WARNING만 표시, white halo)
- [ ] z 13–16: 폴리곤 fill (statusFill, opacity 0.15)
- [ ] z 13–16: 폴리곤 상태 LineLayer (lineWidth 2)
- [ ] z 13–16: 폴리곤 긴급도 LineLayer (urgencyStroke, urgencyWidth 2-5px)
- [ ] z 13–16: 중심 dot CircleLayer (statusFill, radius 6, maxZoom 15)
- [ ] z ≥ 16: D-Day SymbolLayer 폴리곤 내부 텍스트

**인터랙션:**
- [ ] 클러스터 탭 → 해당 영역 줌인
- [ ] 마커/폴리곤 탭 → StatusPopup 표시
- [ ] 빈 지도 탭 → StatusPopup 닫힘
- [ ] AssignmentSheet 없음 (삭제됨)

#### StatusPopup

- [ ] 주소 텍스트 (2줄 제한)
- [ ] 닫기 버튼 (우상단)
- [ ] 조사 상태 배지 (새 색상: statusFill 배경)
- [ ] D-Day 배지: '기한초과' (빨강), 'D-N' (긴급도별 색), 여유 시 미표시
- [ ] 위험등급 배지: 고위험/중위험/저위험
- [ ] 반려횟수 텍스트 (rejectCount ≥ 1일 때만, '반려 N회')
- [ ] 조사일 텍스트 (surveyedAt 있을 때만)
- [ ] validationWarnings 텍스트 (있을 때만, 경고 아이콘 포함)
- [ ] "조사 시작" 버튼 (미조사/임시저장/반려 상태)
- [ ] "조사 보기" 버튼 (제출/검수중/승인 상태, disabled 스타일)

#### StatusLegend

- [ ] 5개 상태 색상 범례 (새 색상 시스템 반영)
- [ ] 긴급도 stroke 범례 (OVERDUE/CRITICAL/WARNING)

---

## 6. Error Handling

### 6.1 lon/lat null 처리

| 케이스 | 처리 |
|--------|------|
| `lon/lat` null | centroid FeatureCollection에서 해당 assignment 제외 (마커 미표시) |
| `lon/lat` null + z≥13 | polygon source에서 geom API로 fallback (기존 동작 유지) |
| geom API 실패 | cache에 null 기록, 해당 필지 폴리곤 미표시 (기존 동작 유지) |

### 6.2 긴급도 계산 오류

| 케이스 | 처리 |
|--------|------|
| `dueDate` null/빈 문자열 | `NORMAL` 처리 (긴급도 없음) |
| `dueDate` 파싱 오류 | try-catch → `NORMAL` fallback |

---

## 7. Security Considerations

해당 피처는 순수 UI/렌더링 변경. 보안 영역 변경 없음.

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Tool | Phase |
|------|--------|------|-------|
| L1: Logic | urgency 계산 (dueDate → UrgencyLevel) | 직접 함수 호출 | Do |
| L2: UI | 줌 레벨별 레이어 가시성, 팝업 요소 | Expo MCP 스크린샷 | Do |
| L3: E2E | 마커 탭 → 팝업 → 조사 시작 플로우 | 실기기 수동 | Do |

### 8.2 L1: 긴급도 계산 테스트

| # | 입력 (dueDate) | status | Expected Level | Expected Label |
|---|--------------|--------|:--------------:|:--------------:|
| 1 | 어제 날짜 | NOT_SURVEYED | OVERDUE | '기한초과' |
| 2 | 오늘+2일 | DRAFT | CRITICAL | 'D-2' |
| 3 | 오늘+5일 | REJECTED | WARNING | 'D-5' |
| 4 | 오늘+30일 | NOT_SURVEYED | NORMAL | '' |
| 5 | 어제 날짜 | APPROVED | NORMAL | '' (완료 상태 면제) |
| 6 | null/'' | NOT_SURVEYED | NORMAL | '' |

### 8.3 L2: UI 검증

| # | 시나리오 | 검증 항목 |
|---|---------|---------|
| 1 | 기본 줌(z13) 진입 | 폴리곤 fill + 2중 stroke 표시 |
| 2 | 줌아웃 z9 | 클러스터 버블 표시, 긴급도 색상 반영 |
| 3 | 줌 z11 | 개별 마커 (outer ring + inner fill) |
| 4 | OVERDUE 필지 탭 | StatusPopup: '기한초과' 배지 빨강 |
| 5 | NORMAL 필지 탭 | StatusPopup: D-Day 배지 미표시 |
| 6 | rejectCount=2인 필지 탭 | 팝업: '반려 2회' 표시 |

### 8.4 L3: E2E 시나리오

| # | 시나리오 | Steps | 성공 조건 |
|---|---------|-------|---------|
| 1 | 조사 탭 지도 버튼 플로우 | 조사탭 → 지도버튼 → 카메라 해당 필지 포커스 | selectedAssignment 일치 |
| 2 | 마커 → 팝업 → 시작 | 마커 탭 → 팝업 표시 → 조사 시작 → survey/[id] | 화면 전환 정상 |
| 3 | 클러스터 탭 줌인 | 클러스터 탭 → 줌인 → 개별 마커 표시 | 줌 레벨 10+ |

---

## 9. Clean Architecture

### 9.1 Layer Structure

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Presentation** | SurveyStatusLayer, StatusPopup, StatusLegend, StatusFilter | `lib/map/components/` |
| **Application** | useParcelStyle (centroid + style 계산), usePolygonGeoms (lazy geom) | `lib/map/hooks/` |
| **Domain** | SurveyStatus, UrgencyLevel, ParcelStatusEntry, color constants | `lib/map/types.ts` |
| **Infrastructure** | getAssignmentGeom API 호출 | `lib/api/survey.ts` (기존) |

### 9.2 This Feature's Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| SurveyStatusLayer | Presentation | `lib/map/components/SurveyStatusLayer.tsx` |
| StatusPopup | Presentation | `lib/map/components/StatusPopup.tsx` |
| useParcelStyle | Application | `lib/map/hooks/useParcelStyle.ts` |
| usePolygonGeoms | Application | `lib/map/hooks/usePolygonGeoms.ts` |
| UrgencyLevel, ParcelStyleProperties | Domain | `lib/map/types.ts` |
| computeUrgency | Domain (co-located) | `lib/map/hooks/useParcelStyle.ts` 내부 |

---

## 10. Coding Conventions

### 10.1 This Feature's Conventions

| Item | Convention |
|------|-----------|
| Hook naming | `use{Domain}{Concern}` — useParcelStyle, usePolygonGeoms |
| Layer IDs | `survey_{purpose}_{type}` — survey_cluster_circle, survey_marker_outer 등 |
| Source IDs | `survey_centroid_source`, `survey_polygon_source` |
| Style props | MapLibre 표현식: `['get', 'propertyName']` |
| lon/lat null | optional chaining + early return (마커 미표시) |
| dueDate null | try-catch → NORMAL fallback |

---

## 11. Implementation Guide

### 11.1 File Structure

```
lib/map/
├── hooks/
│   ├── useParcelStyle.ts         ← NEW (centroid + urgency + style 통합)
│   ├── usePolygonGeoms.ts        ← NEW (useAssignmentGeoms 리네임 + lazy)
│   ├── [useSurveyStatusMap.ts]   ← DELETE
│   └── [useAssignmentGeoms.ts]   ← DELETE
├── components/
│   ├── SurveyStatusLayer.tsx     ← REWRITE (4-level zoom layers)
│   └── StatusPopup.tsx           ← EXTEND (D-Day + rejectCount + warnings)
└── types.ts                      ← EXTEND (UrgencyLevel, URGENCY_STYLES, 새 색상)

app/map/index.tsx                 ← MODIFY (hook 교체, AssignmentSheet 제거)
components/map/AssignmentSheet.tsx ← DELETE
```

### 11.2 Implementation Order

1. [ ] **M1** `lib/map/types.ts` — UrgencyLevel 타입, URGENCY_STYLES, STATUS_COLORS 업데이트, ParcelStatusEntry 확장
2. [ ] **M2** `lib/map/hooks/useParcelStyle.ts` — 신규 hook (computeUrgency + centroid GeoJSON + statusMap 통합)
3. [ ] **M3** `lib/map/hooks/usePolygonGeoms.ts` — useAssignmentGeoms 리네임 + `enabled: boolean` 파라미터 추가
4. [ ] **M4** `lib/map/components/SurveyStatusLayer.tsx` — 4단계 줌 레이어 재작성
5. [ ] **M5** `lib/map/components/StatusPopup.tsx` — D-Day 배지 + rejectCount + validationWarnings
6. [ ] **M6** `app/map/index.tsx` — hook 교체 (useSurveyStatusMap→useParcelStyle, useAssignmentGeoms→usePolygonGeoms), AssignmentSheet 제거, isHighZoom state 추가
7. [ ] **M7** 파일 삭제: `useSurveyStatusMap.ts`, `useAssignmentGeoms.ts`, `AssignmentSheet.tsx`
8. [ ] **M8** `lib/map/components/StatusLegend.tsx` — 새 색상 시스템 반영

### 11.3 Session Guide

#### Module Map

| Module | Scope Key | Description | Estimated Turns |
|--------|-----------|-------------|:---------------:|
| Types + useParcelStyle | `module-1` | M1+M2: 타입 확장 + 핵심 hook 구현 | 15-20 |
| usePolygonGeoms + SurveyStatusLayer | `module-2` | M3+M4: lazy geom + 4레벨 레이어 | 20-25 |
| StatusPopup + index + cleanup | `module-3` | M5+M6+M7+M8: 팝업 확장 + 화면 통합 + 삭제 | 15-20 |

#### Recommended Session Plan

| Session | Phase | Scope | Turns |
|---------|-------|-------|:-----:|
| Session 1 (이전) | Plan + Design | 전체 | 완료 |
| Session 2 | Do | `--scope module-1` | 15-20 |
| Session 3 | Do | `--scope module-2` | 20-25 |
| Session 4 | Do + Check | `--scope module-3` + analyze | 25-30 |

#### 구현 핵심 메모

**useParcelStyle hook 핵심:**
```typescript
export function useParcelStyle(activeFilters: Set<SurveyStatus>) {
  const assignments = useAssignmentStore((s) => s.assignments);
  const rejected = useAssignmentStore((s) => s.rejected);

  return useMemo(() => {
    const statusMap = new Map<string, ParcelStatusEntry>();
    const features: GeoJSON.Feature<GeoJSON.Point, ParcelStyleProperties>[] = [];

    const all = [...assignments, ...rejected];
    for (const a of all) {
      if (!a.pnu) continue;
      // 1. 상태 계산
      const status = computeStatus(a);
      // 2. 긴급도 계산
      const { level, dDayLabel } = computeUrgency(a.dueDate, status);
      // 3. 스타일 매핑
      const sc = STATUS_COLORS[status];
      const uc = URGENCY_STYLES[level];
      // 4. statusMap 구성 (StatusPopup용)
      statusMap.set(a.pnu, { ..., dueDate: a.dueDate, urgencyLevel: level, dDayLabel, rejectCount: a.rejectCount, validationWarnings: a.validationWarnings });
      // 5. centroid feature 구성 (필터 적용)
      if (a.lon != null && a.lat != null && (activeFilters.size === 0 || activeFilters.has(status))) {
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [a.lon, a.lat] },
          properties: { pnu: a.pnu, assignmentId: a.assignmentId, status, statusFill: sc.fill, statusStroke: sc.stroke, urgencyLevel: level, urgencyColor: uc.ringColor, urgencyStroke: uc.strokeColor, urgencyWidth: uc.strokeWidth, urgencyOpacity: uc.strokeOpacity, urgencyTextColor: uc.textColor, dDayLabel, priority: a.priority },
        });
      }
    }

    const centroidCollection: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features };
    return { statusMap, centroidCollection };
  }, [assignments, rejected, activeFilters]);
}
```

**isHighZoom 연동 (app/map/index.tsx) — Fix #2:**
```typescript
const [isHighZoom, setIsHighZoom] = useState(DEFAULT_ZOOM >= 13);

// ⚠️ Fix #2: onRegionIsChanging(X) → onRegionDidChange(O)
// onRegionIsChanging은 매 프레임 발화 → setState → 연속 re-render 유발
// onRegionDidChange는 움직임 완료 후 1회만 발화
// onRegionDidChange 핸들러에서만 setIsHighZoom 호출
// onRegionIsChanging은 measure center + bearing 업데이트만 (기존 유지)

const polygonCollection = usePolygonGeoms(statusMap, isHighZoom, activeFilters);
```

**SurveyStatusLayer Props:**
```typescript
interface Props {
  centroidCollection: GeoJSON.FeatureCollection;  // cluster:true 설정 포함
  polygonCollection: GeoJSON.FeatureCollection;
  onParcelPress?: (pnu: string) => void;
  // centroid/polygon 양 소스 모두 동일 onParcelPress 연결
  // MapLibre hit-test는 최상위 레이어 1개만 발화 → 중복 없음
}
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-23 | 초안 — Option C Pragmatic 기반 | JY Kim |
| 0.2 | 2026-04-23 | 설계 검토 반영: urgencyPriority 클러스터 집계(#1), isHighZoom→onRegionDidChange(#2), usePolygonGeoms urgency props(#3), activeFilters 동기화(#4) | JY Kim |
