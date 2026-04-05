# Field Survey Map — Design (Clean Slate)

> **Summary**: 레거시 지도 화면을 조사원 전용으로 새로 설계 — MVT 상태 색상 + 팝업 + 필터 + 면적 측정
>
> **Project**: agmap
> **Author**: JY Kim
> **Date**: 2026-04-05
> **Status**: Draft
> **Planning Doc**: [field-survey-map.plan.md](../../01-plan/features/field-survey-map.plan.md)

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 지도에 조사 상태가 없어 조사원이 현장에서 할당 목록과 지도를 번갈아 확인해야 함 |
| **WHO** | SURVEYOR (현장 조사원 5,000명, 비전문가 외주/알바) — 본인 할당 필지만 대상 |
| **RISK** | Assignment에 PNU 필드 필요 (Web팀 확인), 면적 측정 연동 유지 |
| **SUCCESS** | 지도에서 내 할당 필지 상태 색상 확인 → 필지 탭 → 조사 시작 플로우 + 상태 필터 + 면적 측정 |
| **SCOPE** | 지도 화면 전면 재작성 (레거시 제거) + 상태 가시화 + 팝업 + 필터 + 범례 + 면적 측정 |

---

## 1. Overview

### 1.1 Design Goals

1. **레거시 제거**: farmfield 코드(BottomBar, inspect 패널, 7개 관리자 레이어) 전부 삭제
2. **조사원 전용**: 5,000명 비전문가가 즉시 쓸 수 있는 단순한 지도
3. **벡터 선명도**: MVT 타일 + 클라이언트 스타일링으로 줌 무관 선명
4. **최소 의존**: 기존 store 5개(bottomStore, inspectStore, optionStore, searchStore, measureStore) → 2개(assignmentStore, measureStore)로 축소

### 1.2 Design Rationale — 왜 새로 만드는가

| 기존 (`app/map/index.tsx`) | 문제 |
|---------------------------|------|
| 560줄, 14개 import | 비대화 |
| Geoserver WMS/WFS 7개 레이어 | 관리자용, 조사원 불필요 |
| BottomBar + BottomView (inspect 패널) | farmfield 레거시 |
| bottomStore + inspectStore + optionStore | 레거시 store 의존 |
| proxy.jsp 경유 WFS 쿼리 (onMapPress) | 복잡, 느림 |

**새 화면**: 조사원이 필요한 것만 → VWorld 배경 + MVT 상태 색상 + GPS + 팝업 + 필터 + 측정

### 1.3 제거 vs 유지 목록

| 기능 | 결정 | 근거 |
|------|:---:|------|
| VWorld 배경지도 (일반/위성) | 유지 | 필수 배경 |
| GPS 위치 추적 (Kalman) | 유지 | 현장 필수 |
| 면적 측정 모드 | 유지 | 조사폼 Step에서 사용 |
| 할당 필지 상태 색상 | **신규** | 핵심 기능 |
| 필지 탭 팝업 + 조사 시작 | **신규** | 핵심 기능 |
| 상태 필터 | **신규** | 핵심 기능 |
| 색상 범례 | **신규** | 핵심 기능 |
| Geoserver WMS 7개 | **제거** | 관리자용 |
| Geoserver WFS 7개 | **제거** | 관리자용 |
| VWorld WMS (지적도, 도로 등) | **제거** | 불필요 확인됨 |
| SelectionLayer (단일 PNU) | **제거** | SurveyStatusLayer가 대체 |
| BottomBar + BottomView | **제거** | farmfield 레거시 |
| SearchPinMarker | **제거** | 간소화 (주소 검색은 별도 검토) |
| 레이어 설정 메뉴 | **제거** | 관리자용 |
| bottomStore, inspectStore, optionStore, searchStore | **제거** | 레거시 store |

---

## 2. Architecture

### 2.0 Selected Architecture

**Clean Slate** — 기존 코드를 참조하지 않고 조사원 전용으로 새로 설계.

- `app/map/index.tsx`를 완전히 새로 작성 (~250줄 목표)
- 신규 컴포넌트/hooks는 `lib/map/`에 생성
- 기존 `src/map/`은 건드리지 않음 (삭제도 안 함, 측정 모드만 참조)

### 2.1 Component Diagram

```
┌─ app/map/index.tsx (NEW MapScreen) ─────────────────────────────┐
│                                                                  │
│  MapLibreGL.MapView                                              │
│  ├── VWorldBaseLayers            (lib/map/components/)           │
│  ├── SurveyStatusLayer           (lib/map/components/) ← 핵심   │
│  ├── MeasureLayer                (lib/map/components/)           │
│  └── MapLibreGL.Camera                                           │
│      └── UserLocation + LocationIndicator                        │
│                                                                  │
│  ┌─ Overlays ────────────────────────────────────────────────┐   │
│  │  StatusPopup          (필지 탭 시 팝업, MarkerView)        │   │
│  │  MapControls          (FAB: GPS, 나침반, 배경지도 전환)     │   │
│  │  MeasureControls      (측정 모드 UI)                       │   │
│  │  StatusFilter         (하단 칩 토글)                       │   │
│  │  StatusLegend         (범례 토글)                          │   │
│  └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
useAssignmentStore (기존 zustand)
  ├─ assignments: Assignment[]  ← 홈에서 이미 fetch
  └─ rejected: Assignment[]

        ↓

useSurveyStatusMap (신규 hook)
  ├─ PNU → status 매핑
  └─ MapLibre ['match'] 표현식 생성

        ↓

SurveyStatusLayer (MVT VectorSource)
  ├─ FillLayer: 상태별 5색
  ├─ LineLayer: 상태별 경계선
  └─ onPress → StatusPopup 표시

        ↓

StatusPopup → "조사 시작" → router.push('/survey/[id]')
```

### 2.3 Dependencies

| 컴포넌트 | 의존 | 목적 |
|----------|------|------|
| SurveyStatusLayer | `useAssignmentStore` | 할당 상태 데이터 |
| StatusPopup | `expo-router` | 조사 폼 네비게이션 |
| MeasureLayer | `useMeasureStore` (기존) | 면적 측정 상태 |
| LocationIndicator | `useMapStateStore` (기존) | GPS 좌표/방위 |
| VWorldBaseLayers | `app/js/config.ts` | VWorld API key |

---

## 3. Data Model

### 3.1 상태 타입 + 색상 정의

```typescript
// lib/map/types.ts

export type SurveyStatus =
  | 'NOT_SURVEYED' | 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface ParcelStatusEntry {
  pnu: string;
  assignmentId: number;
  status: SurveyStatus;
  address: string;
  surveyedAt: string | null;
  riskGrade: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const STATUS_COLORS: Record<SurveyStatus, { fill: string; stroke: string }> = {
  NOT_SURVEYED: { fill: '#E03131', stroke: '#C92A2A' },
  DRAFT:        { fill: '#FCC419', stroke: '#E67700' },
  SUBMITTED:    { fill: '#339AF0', stroke: '#1971C2' },
  APPROVED:     { fill: '#51CF66', stroke: '#2F9E44' },
  REJECTED:     { fill: '#FF922B', stroke: '#E8590C' },
};

export const STATUS_LABELS: Record<SurveyStatus, string> = {
  NOT_SURVEYED: '미조사',
  DRAFT: '임시저장',
  SUBMITTED: '제출',
  APPROVED: '승인',
  REJECTED: '반려',
};
```

### 3.2 Assignment → SurveyStatus 변환

| 조건 | SurveyStatus |
|------|-------------|
| `resultId === null` | `NOT_SURVEYED` |
| `resultStatus === 'DRAFT'` | `DRAFT` |
| `resultStatus === 'SUBMITTED'` or `'REVIEWING'` | `SUBMITTED` |
| `resultStatus === 'APPROVED'` | `APPROVED` |
| rejected 목록에 존재 | `REJECTED` |

### 3.3 Assignment 타입 변경 필요

```typescript
// lib/api/types.ts — 추가 필드
export interface Assignment {
  // ... 기존 필드
  pnu: string;  // ← 추가 필요 (W-MAP-1)
}
```

---

## 4. API Specification

신규 API 없음. 기존 API만 사용:

| API | 용도 |
|-----|------|
| `GET /mobile/api/survey/my-assignments` | 내 할당 + 상태 |
| `GET /mobile/api/survey/rejected` | 반려 건 |

**선행 조건**: `my-assignments` 응답에 `pnu` 필드 포함 필요 (W-MAP-1).

---

## 5. UI/UX Design

### 5.1 Screen Layout

```
┌────────────────────────────────────────┐
│                      FABs (우상단)      │
│                  ┌──────┐              │
│                  │ 🗺️  │ 배경지도 전환  │
│                  ├──────┤              │
│  ┌───────────────┤ 📍  │──────────┐   │
│  │               ├──────┤          │   │
│  │   MapView     │ 🧭  │          │   │
│  │               └──────┘          │   │
│  │                                 │   │
│  │  ■■■ 색상 필지들 (MVT)          │   │
│  │                                 │   │
│  │     ┌─── StatusPopup ────┐      │   │
│  │     │ 곡성군 삼기면 123    │      │   │
│  │     │ 미조사  HIGH        │      │   │
│  │     │ [조사 시작]         │      │   │
│  │     └────────────────────┘      │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                        │
│  ┌─ StatusFilter ────────────────────┐ │
│  │ [전체] [미조사] [반려] [임시] [완료] │ │
│  └───────────────────────────────────┘ │
│                                        │
│  ┌─ Legend (토글) ──────────────────┐   │
│  │ ■ 미조사 ■ 임시 ■ 제출 ■ 승인 ■ 반려│   │
│  └──────────────────────────────────┘   │
│                                        │
│  [홈]  [지도]  [조사]  [내정보]  (탭바)  │
└────────────────────────────────────────┘
```

### 5.2 면적 측정 모드

```
┌────────────────────────────────────────┐
│                                        │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │   MapView (측정 모드)            │   │
│  │         +  (크로스헤어)          │   │
│  │   ──── 측정 라인 ────           │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                        │
│  ┌─ MeasureInfoCard ──────────────┐    │
│  │  거리: 123m  면적: 456㎡        │    │
│  └────────────────────────────────┘    │
│                                        │
│  ┌─ MeasureControlBar ───────────────┐ │
│  │ [점 추가] [되돌리기] [초기화] [완료]│ │
│  └───────────────────────────────────┘ │
└────────────────────────────────────────┘
```

> 측정 모드 진입: 조사폼 Step에서 "면적 측정" 버튼 → 지도 탭으로 전환 + 측정 모드 활성화
> 측정 완료 시: 면적 값을 surveyForm store에 기록 → 조사폼으로 복귀

### 5.3 Component List

| 컴포넌트 | 위치 | 역할 | 신규/유지 |
|----------|------|------|:---:|
| **SurveyStatusLayer** | `lib/map/components/` | MVT FillLayer+LineLayer 상태 색상 | 신규 |
| **StatusPopup** | `lib/map/components/` | 필지 탭 팝업 + 조사 시작 | 신규 |
| **StatusFilter** | `lib/map/components/` | 상태 필터 칩 토글 | 신규 |
| **StatusLegend** | `lib/map/components/` | 색상 범례 | 신규 |
| **VWorldBaseLayers** | `lib/map/components/` | VWorld 배경 래스터 | 신규 (간소화 재작성) |
| **MapControls** | `lib/map/components/` | FAB: GPS/나침반/배경전환 | 신규 (간소화) |
| **LocationIndicator** | `lib/map/components/` | 사용자 위치 마커 | 신규 (간소화) |
| **MeasureLayer** | `lib/map/components/` | 측정 라인/폴리곤 레이어 | `src/map`에서 이식 |
| **MeasureCrosshair** | `lib/map/components/` | 측정 크로스헤어 | `src/map`에서 이식 |
| **MeasureInfoCard** | `lib/map/components/` | 거리/면적 표시 카드 | `src/map`에서 이식 |
| **MeasureControlBar** | `lib/map/components/` | 측정 버튼바 | `src/map`에서 이식 |
| **useSurveyStatusMap** | `lib/map/hooks/` | assignment→스타일 변환 | 신규 |
| **useUserTracking** | `lib/map/hooks/` | GPS Kalman 필터 | `src/map`에서 이식 |

### 5.4 Page UI Checklist

#### 지도 탭 — 기본 모드

- [ ] Map: VWorld 배경지도 (일반/위성 전환)
- [ ] Layer: SurveyStatusLayer FillLayer (5색 상태별 필지 채움, minZoom 12)
- [ ] Layer: SurveyStatusLayer LineLayer (상태별 경계선)
- [ ] Marker: LocationIndicator (사용자 위치 + 방위)
- [ ] FAB: 배경지도 전환 (일반↔위성)
- [ ] FAB: GPS 위치 추적 (off→follow→compass 순환)
- [ ] FAB: 나침반 (회전 시 표시, 탭 시 북쪽 정렬)
- [ ] Filter: StatusFilter 칩 5종 (전체/미조사/반려/임시/완료)
- [ ] Legend: StatusLegend 토글 (5색 + 라벨)
- [ ] Popup: StatusPopup (주소, 상태 뱃지, 위험도, 조사일)
- [ ] Button: "조사 시작" (StatusPopup 내, NOT_SURVEYED/REJECTED/DRAFT일 때 활성)
- [ ] Button: "조사 보기" (StatusPopup 내, SUBMITTED/APPROVED일 때)

#### 지도 탭 — 면적 측정 모드

- [ ] Overlay: MeasureCrosshair (화면 중앙 십자선)
- [ ] Layer: MeasureLayer (측정 라인 + 폴리곤)
- [ ] Card: MeasureInfoCard (거리 m, 면적 ㎡)
- [ ] Bar: MeasureControlBar (점 추가/되돌리기/초기화/완료)

---

## 6. Error Handling

| 상황 | 처리 |
|------|------|
| assignments 빈 배열 | StatusLayer 안 보임, 필터/범례 숨김, EmptyState 안내 |
| PNU 없는 assignment | skip, `__DEV__` 경고 |
| MVT 타일 로드 실패 | 빈 레이어 (에러 무시) |
| GPS 권한 거부 | 위치 FAB 비활성, Toast 안내 |
| 측정 모드에서 3점 미만 완료 | Alert "최소 3점 필요" |

---

## 7. Security

- [x] JWT 인증 (my-assignments API)
- [x] MVT 타일 공개 Geoserver (기존과 동일)
- [x] 조사원은 본인 할당만 표시 (서버 필터링)

---

## 8. Test Plan

### 8.1 수동 테스트 시나리오

| # | 시나리오 | 검증 |
|---|----------|------|
| 1 | 로그인 → 지도 탭 → 할당 필지 색상 | 5색 렌더링, 줌 인/아웃 선명 |
| 2 | 필터 "미조사만" | 빨강만 표시 |
| 3 | 필터 "반려만" | 주황만 표시 |
| 4 | 할당 필지 탭 → 팝업 | 주소, 상태, 위험도 정확 |
| 5 | 팝업 "조사 시작" | survey/[id] 진입 |
| 6 | 배경지도 전환 FAB | 일반↔위성 전환 |
| 7 | GPS 위치 추적 | follow → compass → off 순환 |
| 8 | 면적 측정 → 완료 → surveyForm 반영 | 면적 값 정확 |
| 9 | 범례 토글 | 표시/숨기기 |
| 10 | 할당 없는 계정 | EmptyState 표시, 필터/범례 숨김 |

---

## 9. Folder Structure

```
lib/map/                              # 전부 신규
├── components/
│   ├── SurveyStatusLayer.tsx         # MVT FillLayer+LineLayer 상태 색상
│   ├── StatusPopup.tsx               # 필지 탭 팝업 (MarkerView)
│   ├── StatusFilter.tsx              # 상태 필터 칩
│   ├── StatusLegend.tsx              # 색상 범례
│   ├── VWorldBaseLayers.tsx          # VWorld 배경 (간소화 재작성)
│   ├── MapControls.tsx               # FAB (GPS/나침반/배경전환)
│   ├── LocationIndicator.tsx         # 사용자 위치 마커
│   ├── MeasureLayer.tsx              # 측정 레이어 (src/map에서 이식)
│   ├── MeasureCrosshair.tsx          # 측정 크로스헤어 (이식)
│   ├── MeasureInfoCard.tsx           # 측정 정보 카드 (이식)
│   └── MeasureControlBar.tsx         # 측정 버튼바 (이식)
│
├── hooks/
│   ├── useSurveyStatusMap.ts         # assignment→스타일 변환
│   └── useUserTracking.ts            # GPS Kalman 필터 (이식)
│
├── types.ts                          # SurveyStatus, ParcelStatusEntry, STATUS_COLORS
└── constants.ts                      # MVT URL, KOREA_BOUNDS, VWorld key

app/map/
└── index.tsx                         # 완전히 새로 작성 (~250줄)

src/map/                              # 건드리지 않음 (레거시 보존)
```

> `src/map/`은 삭제하지 않음. 면적 측정 등 이식할 코드 참조용 + 향후 필요 시 복원 가능.

---

## 10. 핵심 구현 상세

### 10.1 useSurveyStatusMap Hook

```typescript
// lib/map/hooks/useSurveyStatusMap.ts
import { useMemo } from 'react';
import { useAssignmentStore } from '@/lib/store/assignments';
import { STATUS_COLORS, type SurveyStatus, type ParcelStatusEntry } from '../types';

export function useSurveyStatusMap(activeFilters: Set<SurveyStatus>) {
  const assignments = useAssignmentStore((s) => s.assignments);
  const rejected = useAssignmentStore((s) => s.rejected);

  return useMemo(() => {
    const statusMap = new Map<string, ParcelStatusEntry>();

    for (const a of assignments) {
      if (!a.pnu) continue;
      const status: SurveyStatus = !a.resultId ? 'NOT_SURVEYED'
        : a.resultStatus === 'DRAFT' ? 'DRAFT'
        : a.resultStatus === 'APPROVED' ? 'APPROVED'
        : 'SUBMITTED';
      statusMap.set(a.pnu, {
        pnu: a.pnu, assignmentId: a.assignmentId, status,
        address: a.address, riskGrade: a.riskGrade,
        surveyedAt: typeof a.surveyedAt === 'string' ? a.surveyedAt : null,
      });
    }
    for (const r of rejected) {
      if (!r.pnu) continue;
      statusMap.set(r.pnu, {
        pnu: r.pnu, assignmentId: r.assignmentId, status: 'REJECTED',
        address: r.address, riskGrade: r.riskGrade,
        surveyedAt: typeof r.surveyedAt === 'string' ? r.surveyedAt : null,
      });
    }

    // 필터 + MapLibre 표현식 생성
    const showAll = activeFilters.size === 0;
    const fillPairs: string[] = [];
    const linePairs: string[] = [];

    for (const [pnu, entry] of statusMap) {
      if (!showAll && !activeFilters.has(entry.status)) continue;
      fillPairs.push(pnu, STATUS_COLORS[entry.status].fill);
      linePairs.push(pnu, STATUS_COLORS[entry.status].stroke);
    }

    const fillColorExpr = fillPairs.length > 0
      ? ['match', ['get', 'pnu'], ...fillPairs, 'transparent'] : ['literal', 'transparent'];
    const lineColorExpr = linePairs.length > 0
      ? ['match', ['get', 'pnu'], ...linePairs, 'transparent'] : ['literal', 'transparent'];

    return { statusMap, fillColorExpr, lineColorExpr };
  }, [assignments, rejected, activeFilters]);
}
```

### 10.2 SurveyStatusLayer

```typescript
// lib/map/components/SurveyStatusLayer.tsx
import MapLibreGL from '@maplibre/maplibre-react-native';
import React, { memo } from 'react';
import { MVT_PARCEL_URL, MVT_SOURCE_LAYER_ID } from '../constants';

interface Props {
  fillColorExpr: any[];
  lineColorExpr: any[];
  onParcelPress?: (pnu: string) => void;
}

export const SurveyStatusLayer = memo(({ fillColorExpr, lineColorExpr, onParcelPress }: Props) => (
  <MapLibreGL.VectorSource
    id="survey_status_source"
    tileUrlTemplates={[MVT_PARCEL_URL]}
    onPress={(e) => {
      const pnu = e.features?.[0]?.properties?.pnu;
      if (pnu) onParcelPress?.(pnu);
    }}
  >
    <MapLibreGL.FillLayer
      id="survey_status_fill"
      sourceLayerID={MVT_SOURCE_LAYER_ID}
      style={{ fillColor: fillColorExpr, fillOpacity: 0.45 }}
      minZoomLevel={12}
    />
    <MapLibreGL.LineLayer
      id="survey_status_line"
      sourceLayerID={MVT_SOURCE_LAYER_ID}
      style={{ lineColor: lineColorExpr, lineWidth: 1.5, lineOpacity: 0.8 }}
      minZoomLevel={12}
    />
  </MapLibreGL.VectorSource>
));
```

### 10.3 Constants

```typescript
// lib/map/constants.ts
export const MVT_PARCEL_URL =
  'https://farmfield.kr/geoserver/farm/gwc/service/tms/1.0.0/farm:vw_fml_lot@EPSG:900913@pbf/{z}/{x}/{y}.pbf';
export const MVT_SOURCE_LAYER_ID = 'vw_fml_lot';
export const KOREA_BOUNDS = { ne: [132.0, 39.0], sw: [124.0, 33.0] } as const;
export const DEFAULT_CENTER: [number, number] = [127.5, 36.5];
export const DEFAULT_ZOOM = 7;
```

### 10.4 app/map/index.tsx 스켈레톤

```typescript
// app/map/index.tsx — 새로 작성 (~250줄 목표)
import MapLibreGL from '@maplibre/maplibre-react-native';
import { Stack, useRouter } from 'expo-router';
import React, { memo, useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { SurveyStatusLayer } from '@/lib/map/components/SurveyStatusLayer';
import { StatusPopup } from '@/lib/map/components/StatusPopup';
import { StatusFilter } from '@/lib/map/components/StatusFilter';
import { StatusLegend } from '@/lib/map/components/StatusLegend';
import { VWorldBaseLayers } from '@/lib/map/components/VWorldBaseLayers';
import { MapControls } from '@/lib/map/components/MapControls';
import { LocationIndicator } from '@/lib/map/components/LocationIndicator';
import { MeasureLayer } from '@/lib/map/components/MeasureLayer';
import { MeasureCrosshair } from '@/lib/map/components/MeasureCrosshair';
import { MeasureInfoCard } from '@/lib/map/components/MeasureInfoCard';
import { MeasureControlBar } from '@/lib/map/components/MeasureControlBar';
import { useSurveyStatusMap } from '@/lib/map/hooks/useSurveyStatusMap';
import { useUserTracking } from '@/lib/map/hooks/useUserTracking';
import { DEFAULT_CENTER, DEFAULT_ZOOM, KOREA_BOUNDS } from '@/lib/map/constants';
import type { SurveyStatus } from '@/lib/map/types';

MapLibreGL.setAccessToken(null);

export default function MapScreen() {
  const router = useRouter();
  const [mapType, setMapType] = useState<'base' | 'satellite'>('base');
  const [activeFilters, setActiveFilters] = useState<Set<SurveyStatus>>(new Set());
  const [selectedPnu, setSelectedPnu] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  const { statusMap, fillColorExpr, lineColorExpr } = useSurveyStatusMap(activeFilters);

  // GPS tracking, measure mode, camera 등은 구현 시 상세화
  // ...

  const handleParcelPress = useCallback((pnu: string) => {
    if (statusMap.has(pnu)) setSelectedPnu(pnu);
  }, [statusMap]);

  const handleStartSurvey = useCallback((assignmentId: number) => {
    setSelectedPnu(null);
    router.push(`/(tabs)/survey/${assignmentId}`);
  }, [router]);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <MapLibreGL.MapView style={{ flex: 1 }} /* ... */ >
        <VWorldBaseLayers mapType={mapType} />
        <SurveyStatusLayer
          fillColorExpr={fillColorExpr}
          lineColorExpr={lineColorExpr}
          onParcelPress={handleParcelPress}
        />
        {/* MeasureLayer, Camera, UserLocation, LocationIndicator */}
      </MapLibreGL.MapView>

      {selectedPnu && statusMap.has(selectedPnu) && (
        <StatusPopup
          entry={statusMap.get(selectedPnu)!}
          onStartSurvey={handleStartSurvey}
          onClose={() => setSelectedPnu(null)}
        />
      )}
      <MapControls mapType={mapType} onToggleMapType={() => setMapType(m => m === 'base' ? 'satellite' : 'base')} />
      <StatusFilter activeFilters={activeFilters} onChange={setActiveFilters} />
      {showLegend && <StatusLegend onClose={() => setShowLegend(false)} />}
      {/* MeasureControls when measuring */}
    </View>
  );
}
```

---

## 11. Implementation Guide

### 11.1 Implementation Order

1. [ ] `lib/map/types.ts` + `lib/map/constants.ts`
2. [ ] `lib/api/types.ts` — Assignment에 `pnu` 필드 추가
3. [ ] `lib/map/components/VWorldBaseLayers.tsx` — 간소화 재작성
4. [ ] `lib/map/hooks/useSurveyStatusMap.ts`
5. [ ] `lib/map/components/SurveyStatusLayer.tsx`
6. [ ] `lib/map/components/StatusPopup.tsx`
7. [ ] `lib/map/components/StatusFilter.tsx`
8. [ ] `lib/map/components/StatusLegend.tsx`
9. [ ] `lib/map/components/MapControls.tsx` + `LocationIndicator.tsx`
10. [ ] `lib/map/hooks/useUserTracking.ts` — src/map에서 이식
11. [ ] 면적 측정 컴포넌트 4개 — src/map에서 이식
12. [ ] `app/map/index.tsx` — 새로 작성 (위 컴포넌트 통합)
13. [ ] 빌드 확인 + 테스트 시나리오 수행

### 11.2 파일 목록

| 파일 | 작업 | 줄 수 (예상) |
|------|------|:---:|
| `lib/map/types.ts` | 신규 | ~40 |
| `lib/map/constants.ts` | 신규 | ~10 |
| `lib/api/types.ts` | 수정 (pnu 추가) | +1 |
| `lib/map/components/VWorldBaseLayers.tsx` | 신규 (간소화) | ~30 |
| `lib/map/hooks/useSurveyStatusMap.ts` | 신규 | ~60 |
| `lib/map/components/SurveyStatusLayer.tsx` | 신규 | ~30 |
| `lib/map/components/StatusPopup.tsx` | 신규 | ~80 |
| `lib/map/components/StatusFilter.tsx` | 신규 | ~50 |
| `lib/map/components/StatusLegend.tsx` | 신규 | ~40 |
| `lib/map/components/MapControls.tsx` | 신규 | ~60 |
| `lib/map/components/LocationIndicator.tsx` | 신규 | ~30 |
| `lib/map/hooks/useUserTracking.ts` | 이식 | ~100 |
| `lib/map/components/MeasureLayer.tsx` | 이식 | ~50 |
| `lib/map/components/MeasureCrosshair.tsx` | 이식 | ~30 |
| `lib/map/components/MeasureInfoCard.tsx` | 이식 | ~40 |
| `lib/map/components/MeasureControlBar.tsx` | 이식 | ~50 |
| `app/map/index.tsx` | **새로 작성** | ~250 |
| **합계** | | **~950** |

### 11.3 Session Guide

#### Module Map

| Module | Scope Key | Description | Files |
|--------|-----------|-------------|:---:|
| 기반 | `module-1` | types, constants, VWorldBaseLayers, MapControls, LocationIndicator, useUserTracking | 6 |
| 상태 레이어 | `module-2` | useSurveyStatusMap, SurveyStatusLayer, StatusPopup, StatusFilter, StatusLegend | 5 |
| 측정+통합 | `module-3` | Measure 4개 이식 + app/map/index.tsx 새로 작성 + 빌드 확인 | 5 |

#### Recommended Session Plan

| Session | Scope | 내용 |
|---------|-------|------|
| Session 1 | Plan + Design | 완료 (현재) |
| Session 2 | `--scope module-1` | 지도 기반 (배경+GPS+컨트롤) |
| Session 3 | `--scope module-2,module-3` | 상태 레이어 + 측정 이식 + 통합 |
| Session 4 | Check + Report | Gap 분석 + 보고서 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-05 | Initial — Option B Migration | JY Kim |
| 0.2 | 2026-04-05 | **Clean Slate 전면 재작성** — 레거시 제거, 조사원 전용 지도. 기존 src/map 보존(삭제 안 함), lib/map에 신규+이식. | JY Kim |
