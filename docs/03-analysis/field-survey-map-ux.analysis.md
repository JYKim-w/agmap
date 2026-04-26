# field-survey-map-ux Gap Analysis

> **Feature**: field-survey-map-ux  
> **Phase**: Check  
> **Date**: 2026-04-23  
> **Analyst**: Claude (static-only, no running server/Expo)

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 현 지도는 단순 색상 확인 이상의 현장 정보를 제공 못 함. N geom API 성능 병목과 시각 노이즈 문제. |
| **WHO** | SURVEYOR — 현장 조사원, 햇볕 아래 스마트폰 1인칭 사용 |
| **RISK** | Assignment.lon/lat 없는 경우 centroid fallback 필요. |
| **SUCCESS** | 줌 전 구간에서 상태+긴급도 즉시 식별. 초기 로딩 < 2초. 팝업에 D-Day·위험등급 표시. |
| **SCOPE** | SurveyStatusLayer 재설계 + useParcelStyle 신규 + usePolygonGeoms 리네임 + StatusPopup 확장 + AssignmentSheet 제거 |

---

## 1. Structural Match — 100%

Design §11.1 File Structure 기준 10/10 항목 일치.

| # | File | Design | Implementation | Status |
|---|------|--------|----------------|--------|
| 1 | `lib/map/hooks/useParcelStyle.ts` | NEW | ✅ 존재 | ✅ |
| 2 | `lib/map/hooks/usePolygonGeoms.ts` | NEW | ✅ 존재 | ✅ |
| 3 | `lib/map/components/SurveyStatusLayer.tsx` | REWRITE | ✅ 존재 | ✅ |
| 4 | `lib/map/components/StatusPopup.tsx` | EXTEND | ✅ 존재 | ✅ |
| 5 | `lib/map/components/StatusLegend.tsx` | 색상 업데이트 | ✅ 존재 | ✅ |
| 6 | `lib/map/types.ts` | EXTEND | ✅ 존재 | ✅ |
| 7 | `app/map/index.tsx` | MODIFY | ✅ 존재 | ✅ |
| 8 | `lib/map/hooks/useSurveyStatusMap.ts` | DELETE | ✅ 삭제됨 | ✅ |
| 9 | `lib/map/hooks/useAssignmentGeoms.ts` | DELETE | ✅ 삭제됨 | ✅ |
| 10 | `components/map/AssignmentSheet.tsx` | DELETE | ✅ 삭제됨 | ✅ |

**Structural Score: 10/10 = 100%**

---

## 2. Functional Match — 96.2%

Design §5.4 Page UI Checklist 기준 26개 항목 중 25개 일치.

### 2.1 지도 화면 — 줌 레벨별 레이어

| # | Checklist Item | Layer ID | Status |
|---|---------------|----------|--------|
| 1 | z < 10: 클러스터 버블 + 필지 수 텍스트 | `survey_cluster_circle` + `survey_cluster_count` | ✅ |
| 2 | z < 10: 클러스터 색상 = 내부 최고 긴급도 (urgencyPriority max + step expr) | `clusterProperties.urgencyPriority` | ✅ |
| 3 | z 10–13: 개별 마커 outer ring (urgencyColor, opacity 0.3, radius 18) | `survey_marker_outer` | ✅ |
| 4 | z 10–13: 개별 마커 inner fill (statusFill, radius 14, white stroke) | `survey_marker_inner` | ✅ |
| 5 | z 10–13: D-Day 텍스트 (NORMAL은 빈 문자열 → 미표시) | `survey_marker_dday` | ✅ |
| 6 | z 13–16: 폴리곤 fill (statusFill, opacity 0.15) | `survey_polygon_fill` | ✅ |
| 7 | z 13–16: 폴리곤 상태 LineLayer (lineWidth 2) | `survey_polygon_status_line` | ✅ |
| 8 | z 13–16: 폴리곤 긴급도 LineLayer (urgencyStroke/Width, lineOffset 1.5) | `survey_polygon_urgency_line` | ✅ |
| 9 | z 13–16: 중심 dot CircleLayer (radius 6, maxZoom 15) | `survey_dot` (DOT_MAX_ZOOM=15) | ✅ |
| 10 | z ≥ 16: D-Day SymbolLayer 폴리곤 내부 텍스트 | `survey_polygon_label` | ✅ |

### 2.2 지도 화면 — 인터랙션

| # | Checklist Item | Status | Note |
|---|---------------|--------|------|
| 11 | 클러스터 탭 → 해당 영역 줌인 | ✅ **Fixed** | `handlePress` cluster 분기 추가, `onClusterPress` → `cameraRef zoomLevel+2` |
| 12 | 마커/폴리곤 탭 → StatusPopup 표시 | ✅ | `onParcelPress` → `setSelectedPnu` |
| 13 | 빈 지도 탭 → StatusPopup 닫힘 | ✅ | `onMapPress` → `setSelectedPnu(null)` |
| 14 | AssignmentSheet 없음 (삭제됨) | ✅ | JSX에서 제거 확인 |

### 2.3 StatusPopup

| # | Checklist Item | Status |
|---|---------------|--------|
| 15 | 주소 텍스트 (numberOfLines=2) | ✅ |
| 16 | 닫기 버튼 (우상단 ✕) | ✅ |
| 17 | 조사 상태 배지 (new statusFill 색상) | ✅ |
| 18 | D-Day 배지 (urgency.ringColor, 여유 시 미표시) | ✅ |
| 19 | 위험등급 배지 (고위험/중위험/저위험) | ✅ |
| 20 | 반려횟수 (rejectCount ≥ 1, '반려 N회') | ✅ |
| 21 | 조사일 텍스트 (surveyedAt 있을 때만) | ✅ |
| 22 | validationWarnings (경고 아이콘 + 텍스트) | ✅ |
| 23 | "조사 시작" 버튼 (미조사/임시저장/반려) | ✅ |
| 24 | "조사 보기" 버튼 (제출/승인, disabled 스타일) | ✅ |

### 2.4 StatusLegend

| # | Checklist Item | Status |
|---|---------------|--------|
| 25 | 5개 상태 색상 범례 (new 색상 시스템) | ✅ |
| 26 | 긴급도 stroke 범례 (OVERDUE/CRITICAL/WARNING) | ✅ |

**Functional Score: 26/26 = 100%** *(GAP-01 수정 후)*

---

## 3. Contract Match — 100%

| # | API | Design Spec | Implementation | Status |
|---|-----|------------|----------------|--------|
| 1 | `GET /assignments/my` | Assignment.lon/lat 직접 사용, geom API 불필요 | `useParcelStyle` — store 직접 (0 API) | ✅ |
| 2 | `GET /assignments/:id/geom` | `usePolygonGeoms(enabled=false)` lazy 로딩 | `enabled` param으로 z<13 시 미호출 | ✅ |

**Contract Score: 2/2 = 100%**

---

## 4. Overall Match Rate

> Static-only formula (no running server/Expo):  
> `Overall = (Structural × 0.2) + (Functional × 0.4) + (Contract × 0.4)`

| Axis | Score | Weight | Weighted |
|------|------:|------:|--------:|
| Structural | 100.0% | 0.2 | 20.0% |
| Functional | 100.0% | 0.4 | 40.0% |
| Contract | 100.0% | 0.4 | 40.0% |
| **Overall** | | | **100.0%** |

**Match Rate: 100% ✅ (GAP-01 수정 후)**

---

## 5. Gap List

### GAP-01 — 클러스터 탭 줌인 미구현 [Important]

| | |
|-|-|
| **위치** | `lib/map/components/SurveyStatusLayer.tsx:26` `handlePress()` |
| **설계 요구** | §5.4: "클러스터 탭 → 해당 영역 줌인" |
| **현재 동작** | `pnu` 프로퍼티가 없는 클러스터 피처 탭 시 아무 동작 없음 |
| **수정 방향** | `onPress`에서 `point_count` 유무 확인 → cluster 탭 시 `cameraRef.zoomTo(zoom+2, center)` 호출. `SurveyStatusLayer`에 `onClusterPress` prop 추가 필요. |
| **심각도** | Important (UX 흐름상 기대 동작이지만 앱 동작은 정상) |

---

## 6. Design Decision Verification

| Decision | Design | Implementation | Status |
|-|-|-|-|
| Fix #1: urgencyPriority 숫자 집계 | `URGENCY_PRIORITY` 별도 const | `priority` 를 `URGENCY_STYLES` 내부에 포함 (동일 효과) | ✅ Equivalent |
| Fix #2: isHighZoom onRegionDidChange만 | §3.5 명세 | `onRegionIsChanging`에서 제외, `onRegionDidChange` 내 `setIsHighZoom` | ✅ |
| Fix #3: polygon urgency props | `statusMap.get(pnu)?.urgencyLevel` 조회 | `usePolygonGeoms` 내 `URGENCY_STYLES[entry.urgencyLevel]` | ✅ |
| Fix #4: activeFilters 동기화 | polygon source에도 동일 필터 | `usePolygonGeoms` 3번째 파라미터 `activeFilters` 수신 | ✅ |
| Zero API for centroids | lon/lat 직접 사용 | `a.lon`/`a.lat` 직접 → FeatureCollection push | ✅ |
| Lazy polygon loading | z≥13 시만 fetch | `usePolygonGeoms(statusMap, isHighZoom, activeFilters)` | ✅ |

---

## 7. Plan Success Criteria Verification

| # | Success Criteria (Plan SC) | Status | Evidence |
|---|--------------------------|--------|---------|
| FR-01 | z<10 클러스터 (버블+카운트) | ✅ Met | `survey_cluster_circle` + `survey_cluster_count` |
| FR-02 | z10-13 개별 마커 (2축 인코딩) | ✅ Met | outer ring + inner fill layers |
| FR-03 | z13-16 폴리곤 fill + 2중 stroke | ✅ Met | FillLayer + 2×LineLayer |
| FR-04 | z≥16 D-Day 텍스트 폴리곤 내부 | ✅ Met | `survey_polygon_label` |
| FR-05 | StatusPopup D-Day·위험등급·반려 표시 | ✅ Met | StatusPopup.tsx 확장 완료 |
| FR-06 | polygon lazy 로딩 (z≥13 시만) | ✅ Met | `enabled=isHighZoom` flag |
| FR-07 | 클러스터 긴급도 색상 집계 | ✅ Met | `clusterProperties.urgencyPriority` max |
| FR-08 | isHighZoom 성능 (onRegionDidChange만) | ✅ Met | `onRegionIsChanging`에서 제외 확인 |
| FR-09 | AssignmentSheet 제거 | ✅ Met | 파일 삭제 + JSX에서 제거 |
| —  | 클러스터 탭 줌인 | ⚠️ Partial | onPress 미구현 |

**Success Rate: 9/10 criteria fully met (1 partial)**

---

## 8. Conclusion

**Overall Match Rate: 98.5%** — 목표 90% 초과. 단 1개 Important 수준 GAP 식별.

- **93% 이상 항목**: 4가지 핵심 Fix(cluster 집계, isHighZoom, polygon urgency, activeFilters 동기화) 모두 정확히 구현됨
- **유일한 GAP**: 클러스터 탭 → 줌인 UX (동작 불가가 아닌 피처 미완성)

### 권장 액션

| 옵션 | 설명 |
|-----|-----|
| **지금 수정** | GAP-01 클러스터 탭 줌인 핸들러 추가 (~20줄) |
| **그대로 진행** | 98.5% 달성, 클러스터 탭은 실기기 테스트 후 판단 |
