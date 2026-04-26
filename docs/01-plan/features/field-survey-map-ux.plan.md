# field-survey-map-ux Planning Document

> **Summary**: 지도 화면 가시화 전면 재설계 — 모던 줌레벨별 레이어 전략 + 정보 2축 인코딩 + 성능 개선
>
> **Project**: agmap (Mobile)
> **Author**: JY Kim
> **Date**: 2026-04-23
> **Status**: Draft
> **Method**: Plan Plus (Brainstorming-Enhanced PDCA)

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 현재 지도는 단순 5색 폴리곤만 표시. N개 개별 geom API 호출로 초기 로딩 느림. 줌아웃 시 Circle 8px가 모두 겹쳐 시각적 노이즈 심각. 기한·우선순위 정보가 지도에 없어 현장 우선순위 판단 불가. 하단 시트는 제스처 충돌·렌더링 저하를 유발. |
| **Solution** | 줌 4단계 레이어 전략(클러스터→마커→폴리곤+마커→폴리곤+텍스트). 상태(Fill) × 기한긴급도(Stroke) 2축 인코딩. lon/lat 기반 중심점 GeoJSON으로 geom API 의존 제거. 하단 시트 삭제. |
| **Function/UX Effect** | 어느 줌에서든 명확한 상태 식별. 기한 임박 필지를 테두리로 즉시 인지. 초기 로딩 속도 대폭 개선. 야외 가독성 높은 색상 시스템. |
| **Core Value** | 현장 조사원이 지도만 보고 "어느 필지를, 얼마나 급하게" 판단할 수 있는 정보 밀도 높은 지도 |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 현 지도는 단순 색상 확인 이상의 현장 정보를 제공 못 함. 성능 병목(N geom API)과 시각 노이즈(겹치는 원)도 문제. |
| **WHO** | SURVEYOR — 현장 조사원, 햇볕 아래 스마트폰 1인칭 사용 |
| **RISK** | Assignment.lon/lat 없는 경우 centroid fallback 필요. VWorld 지적도 MVT 지원 여부 확인 필요. |
| **SUCCESS** | 줌 전 구간에서 상태+긴급도 즉시 식별. 초기 로딩 < 2초. 팝업에 D-Day·위험등급 표시. |
| **SCOPE** | SurveyStatusLayer 재설계 + useAssignmentGeoms 개선 + StatusPopup 확장 + AssignmentSheet 제거 |

---

## 1. User Intent Discovery

### 1.1 Core Problem — 현재 구현의 문제

| 문제 | 원인 | 영향 |
|------|------|------|
| 초기 로딩 느림 | `getAssignmentGeom()` N번 개별 API 호출 | 50개 배정 = 50 API call |
| 줌아웃 노이즈 | CircleLayer 8px 원이 모두 겹침 | 전체 현황 파악 불가 |
| 정보 부족 | 상태 색상만 있고 기한·우선순위 없음 | 어느 필지 먼저 갈지 판단 불가 |
| 하단 시트 문제 | 제스처 충돌, 디자인 깨짐, 실사용 빈도 낮음 | UX 혼란 |

**발견한 중요 사실**: `Assignment.lon` / `Assignment.lat` 필드가 이미 존재  
→ 중심점 마커 표시에 `getAssignmentGeom()` API 호출이 불필요.  
→ **폴리곤 표시(고줌)**에만 geom API 또는 VWorld MVT 활용.

### 1.2 Target Users

| User Type | Context | Key Need |
|-----------|---------|----------|
| 현장 조사원 | 야외, 햇볕, 한 손 조작 | 빠른 필지 상태 파악 + 어디 먼저 가야 하나 |
| 현장 조사원 | 넓은 지역 이동 중 | 줌아웃에서도 미조사·긴급 필지 식별 |
| 현장 조사원 | 특정 필지 근처 | 고줌에서 정확한 경계 + 상세 정보 |

### 1.3 Success Criteria

- [ ] 줌 전 구간에서 상태 색상 즉시 식별 가능
- [ ] 기한 임박 필지가 테두리 강조로 시각적으로 구분됨
- [ ] 클러스터에서 긴급 필지 존재 여부 인지 가능
- [ ] 지도 초기 진입 시 로딩 병목 없음 (중심점은 API 불필요)
- [ ] 팝업에서 D-Day + 위험등급 + 반려횟수 확인 가능
- [ ] 하단 시트 없이 지도 화면 깔끔

---

## 2. Alternatives — 렌더링 아키텍처

### 2.1 Approach A: 현행 유지 (GeoJSON 폴리곤 N API 호출)

| Aspect | Details |
|--------|---------|
| **Summary** | `getAssignmentGeom(id)` N회 호출 → GeoJSON ShapeSource |
| **Pros** | 이미 구현됨 |
| **Cons** | 50개 = 50 API call, 초기 로딩 느림, 줌아웃 가시화 없음 |
| **Effort** | - |

### 2.2 Approach B: lon/lat 중심점 + 배치 geom API — Selected

| Aspect | Details |
|--------|---------|
| **Summary** | 중심점은 `Assignment.lon/lat`(API 없음), 폴리곤은 배치 API 1회 |
| **Pros** | 중심점 즉시 표시, 폴리곤 로딩은 고줌 진입 시 lazy |
| **Cons** | 서버에 배치 geom API 추가 필요 (또는 개별 호출 유지) |
| **Effort** | Medium |

### 2.3 Approach C: VWorld 지적도 MVT (이상적)

| Aspect | Details |
|--------|---------|
| **Summary** | VWorld 지적도 Vector Tile + PNU match 표현식으로 스타일링 |
| **Pros** | 0 API call, 타일 캐시, 최고 성능 |
| **Cons** | VWorld 지적도 MVT 지원 여부 확인 필요, 레이어 속성 PNU 포함 여부 미확인 |
| **Effort** | Low (지원 시) / 불가 (미지원 시) |

### 2.4 Decision Rationale

**Selected**: B (lon/lat 중심점 + 폴리곤 개선)  
**Reason**: Assignment.lon/lat 즉시 활용 가능 → 초기 로딩 병목 즉시 해소.  
폴리곤은 기존 개별 호출 유지하되 lazy 로딩(고줌 진입 시점). C는 VWorld 지원 확인 후 추후 마이그레이션.

---

## 3. 가시화 전략 — 줌 4단계

### 3.1 레이어 전략 개요

```
z < 10  ────────────  클러스터 버블
                       크기 = 필지 수, 색 = 긴급도 우세
                       탭 → 줌인 (자동)

z 10–13 ────────────  개별 상태 마커 (모던 핀)
                       fill = 상태 색, outer ring = 기한 긴급도
                       SymbolLayer: D-Day 텍스트

z 13–16 ────────────  폴리곤 + 마커
                       FillLayer: 상태 색 (opacity 0.2)
                       LineLayer ×2: 상태 stroke + 긴급도 stroke
                       마커 축소 (8px dot)

z ≥ 16  ────────────  폴리곤 + 텍스트 레이블
                       고줌에서 D-Day 텍스트 폴리곤 내부 표시
                       priority=1 이면 ! 아이콘
```

### 3.2 클러스터 (z < 10)

```javascript
// centroid ShapeSource에 cluster: true 적용
cluster: true
clusterRadius: 60
clusterMaxZoomLevel: 10

// 클러스터 원 — 긴급도 우세 색상
CircleLayer (filter: has point_count)
  circleRadius: ['step', point_count, 20, 10, 28, 50, 36]
  circleColor: ['get', 'clusterUrgencyColor']  // 클러스터 내 최고 긴급도
  circleStrokeColor: '#fff'
  circleStrokeWidth: 2

// 카운트 텍스트
SymbolLayer
  textField: '{point_count}'
  textColor: '#fff'
  textSize: 13
  textFontWeight: '700'
```

**클러스터 긴급도 색상 우선순위**: 기한초과 > D-3 > D-7 > 일반  
→ 클러스터 1개라도 기한 초과 있으면 빨간 클러스터 표시.

### 3.3 개별 마커 (z 10–13)

```javascript
// 비클러스터 포인트 — 2겹 원으로 모던한 느낌
CircleLayer (outer ring — urgency)
  circleRadius: 18
  circleColor: ['get', 'urgencyColor']
  circleOpacity: 0.3

CircleLayer (inner fill — status)
  circleRadius: 14
  circleColor: ['get', 'statusFill']
  circleStrokeColor: '#fff'
  circleStrokeWidth: 2

SymbolLayer (D-Day 텍스트 — urgency 있을 때만)
  textField: ['get', 'dDayLabel']   // 'D-3', '초과', ''
  textOffset: [0, -2.2]
  textSize: 10
  textColor: ['get', 'urgencyTextColor']
  textHaloColor: '#fff'
  textHaloWidth: 1.5
```

### 3.4 폴리곤 + 마커 (z 13–16)

```javascript
// FillLayer — 상태 색, 반투명
FillLayer
  fillColor: ['get', 'statusFill']
  fillOpacity: 0.15             // 매우 옅게 — 배경지도 보이도록

// LineLayer 1 — 상태 기본 stroke
LineLayer
  lineColor: ['get', 'statusStroke']
  lineWidth: 2

// LineLayer 2 — 긴급도 외곽 stroke (긴급할수록 굵고 불투명)
LineLayer
  lineColor: ['get', 'urgencyStroke']
  lineWidth: ['get', 'urgencyWidth']     // 2~5px
  lineOpacity: ['get', 'urgencyOpacity'] // 0 ~ 1

// CircleLayer — 중심 dot (축소)
CircleLayer
  circleRadius: 6
  circleColor: ['get', 'statusFill']
  circleStrokeColor: '#fff'
  circleStrokeWidth: 1.5
  maxZoomLevel: 15
```

### 3.5 텍스트 레이블 (z ≥ 16)

```javascript
SymbolLayer
  minZoomLevel: 16
  textField: ['get', 'dDayLabel']
  textAnchor: 'center'
  textSize: 12
  textColor: ['get', 'urgencyTextColor']
  textHaloColor: '#fff'
  textHaloWidth: 2

// priority=1 아이콘
SymbolLayer (priority icon)
  minZoomLevel: 15
  iconImage: ['case', ['==', ['get', 'priority'], 1], 'icon-priority', '']
  iconOffset: [10, -10]
  iconSize: 0.7
```

---

## 4. 정보 2축 인코딩 설계

### 4.1 축 1 — 조사 상태 (Fill 색상)

야외 가독성 최적화: 높은 채도, 위성지도(어두운 배경)에서도 선명.

| 상태 | Fill | Stroke | 의미 |
|------|------|--------|------|
| NOT_SURVEYED | `#FF4D4D` (밝은 빨강) | `#CC0000` | 미조사 — 방문 필요 |
| DRAFT | `#FFD43B` (밝은 노랑) | `#CC8800` | 임시저장 — 이어서 작성 |
| SUBMITTED | `#4DABF7` (밝은 파랑) | `#1971C2` | 제출완료 |
| APPROVED | `#69DB7C` (밝은 초록) | `#2F9E44` | 승인됨 |
| REJECTED | `#FFA94D` (밝은 주황) | `#C94400` | 반려 — 재조사 필요 |

### 4.2 축 2 — 기한 긴급도 (Stroke/Ring 색상)

미완료 상태(`NOT_SURVEYED`, `DRAFT`, `REJECTED`)에만 적용.

| 긴급도 | 조건 | Stroke 색 | 굵기 | 마커 Ring |
|--------|------|-----------|------|-----------|
| OVERDUE | 기한 초과 | `#FA5252` (빨강) | 5px | 빨간 ring |
| CRITICAL | D-3 이내 | `#FD7E14` (주황) | 4px | 주황 ring |
| WARNING | D-7 이내 | `#FAB005` (노랑) | 3px | 노랑 ring |
| NORMAL | 여유 있음 | 상태 stroke 동일 | 2px | ring 없음 |

완료·제출된 상태는 urgency 미적용 (urgencyWidth=2, urgencyOpacity=0).

### 4.3 추가 정보 — StatusPopup에만 표시

지도 과부하 방지. 탭 시 팝업에 표시:

| 정보 | 위치 | 형태 |
|------|------|------|
| 상태 | 팝업 배지 | 색상 배지 |
| D-Day | 팝업 배지 | `D-2`, `기한초과` |
| 위험등급 | 팝업 배지 | `고위험`/`중위험`/`저위험` |
| 반려횟수 | 팝업 텍스트 | `반려 2회` (rejectCount ≥ 2) |
| validationWarnings | 팝업 경고 | 아이콘 + 텍스트 |
| 조사일 | 팝업 서브텍스트 | `조사일: 2026-04-10` |

---

## 5. 성능 아키텍처

### 5.1 현재 vs 개선 비교

| 항목 | 현재 | 개선 |
|------|------|------|
| 중심점 소스 | geom API N회 → centroid 계산 | `Assignment.lon/lat` 직접 사용 (0 API) |
| 폴리곤 소스 | geom API N회 병렬 (초기 로딩) | 고줌 진입 시 lazy 로딩 (기존 유지) |
| 클러스터 | 없음 (겹치는 원) | z < 10 클러스터 버블 |
| 줌 전략 | 2단계 (z<13 원, z≥13 폴리곤) | 4단계 세분화 |

### 5.2 데이터 소스 분리

```
[Source 1] centroidSource — 항상 로드, API 없음
  origin: Assignment.lon / Assignment.lat
  cluster: true (z < 10)
  properties: pnu, statusFill, urgencyColor, urgencyWidth, dDayLabel, priority, ...

[Source 2] polygonSource — lazy 로드, geom API
  origin: getAssignmentGeom(id) (기존 cache 유지)
  triggered: 사용자가 z ≥ 13 진입 시
  properties: pnu, statusFill, statusStroke, urgencyStroke, urgencyWidth, urgencyOpacity
```

### 5.3 신규 Hook 구조

```
useParcelStyle(assignments, rejected)
  │
  ├── 상태 계산 (resultId, resultStatus → SurveyStatus)
  ├── 긴급도 계산 (dueDate → UrgencyLevel)
  ├── 스타일 속성 매핑 (status + urgency → colors, widths)
  └── centroid FeatureCollection 반환 (lon/lat 기반)

usePolygonGeoms(statusMap, enabled)   ← enabled: isHighZoom
  │
  └── 기존 getAssignmentGeom 로직 (캐시 유지)
      enabled=false 시 fetch 안 함
```

---

## 6. Scope

### 6.1 In Scope

**가시화 재설계 (핵심)**
- [ ] `lib/map/hooks/useParcelStyle.ts` 신규 — 스타일 계산 + centroid GeoJSON
- [ ] `lib/map/hooks/usePolygonGeoms.ts` 개선 — lazy 로딩 (z ≥ 13 시 활성화)
- [ ] `lib/map/components/SurveyStatusLayer.tsx` 전면 재작성 — 줌 4단계 레이어
- [ ] `lib/map/types.ts` — `UrgencyLevel` 타입, 스타일 속성 확장
- [ ] `lib/map/components/StatusPopup.tsx` — D-Day + 반려횟수 + validationWarnings 추가

**하단 시트 제거**
- [ ] `app/map/index.tsx` — AssignmentSheet 관련 코드 제거
- [ ] `components/map/AssignmentSheet.tsx` — 파일 삭제

### 6.2 Out of Scope

- `useSurveyStatusMap` → `useParcelStyle`로 대체됨 (파일 삭제)
- `useAssignmentGeoms` → `usePolygonGeoms`로 대체됨 (파일 삭제)
- VWorld 지적도 MVT 전환 — 지원 여부 확인 후 별도 작업
- priority 아이콘 에셋 — 1차에서 제외, 텍스트로 대체

---

## 7. Requirements

### 7.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | z < 10: 클러스터 버블 (긴급도 우세 색, 카운트) | High |
| FR-02 | z 10–13: 개별 상태 마커 (2겹 원, D-Day 텍스트) | High |
| FR-03 | z 13–16: 폴리곤 fill(0.2) + 2중 stroke (상태+긴급도) | High |
| FR-04 | z ≥ 16: 폴리곤 + D-Day 텍스트 레이블 | Medium |
| FR-05 | centroid 소스: lon/lat 기반 (geom API 불필요) | High |
| FR-06 | 폴리곤 소스: z ≥ 13 진입 시만 fetch (lazy) | High |
| FR-07 | StatusPopup: D-Day + 위험등급 + 반려횟수 + 경고 | Medium |
| FR-08 | AssignmentSheet 완전 제거 | High |
| FR-09 | 야외 가독성 색상 시스템 적용 | High |

### 7.2 Non-Functional Requirements

| Category | Criteria |
|----------|----------|
| 성능 | 지도 탭 초기 진입 시 중심점 마커 즉시 표시 (API 대기 없음) |
| 렌더링 | 클러스터로 저줌 Circle 겹침 노이즈 제거 |
| 가독성 | 야외(직사광선) 환경에서 상태 색상 즉시 식별 |

---

## 8. Success Criteria

- [ ] FR-01~09 전체 구현
- [ ] 지도 탭 진입 즉시 중심점 마커 표시 (로딩 스피너 없음)
- [ ] z 전환 시 레이어 전환 자연스러움
- [ ] 기한 초과 필지가 일반 필지와 시각적으로 명확히 구분됨
- [ ] 팝업에 D-Day + 위험등급 + 반려횟수 표시
- [ ] SC-7 (조사 탭 → 지도 카메라 포커스) 정상 동작

---

## 9. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| lon/lat null인 경우 | Medium | Low | null 시 geom API fallback 또는 마커 미표시 |
| 클러스터 tap 인터랙션 구현 복잡 | Low | Medium | 1차: 클러스터 탭 시 줌인만. 상세 인터랙션 2차 |
| 줌 전환 시 레이어 깜박임 | Medium | Low | minZoomLevel/maxZoomLevel로 MapLibre 네이티브 처리 |
| VWorld MVT 추후 전환 시 breaking | Low | Low | usePolygonGeoms 인터페이스 유지하면 swap 가능 |

---

## 10. Impact Analysis

### 10.1 Changed Resources

| Resource | Type | Change |
|----------|------|--------|
| `lib/map/hooks/useSurveyStatusMap.ts` | Hook | `useParcelStyle`로 대체 |
| `lib/map/hooks/useAssignmentGeoms.ts` | Hook | `usePolygonGeoms`로 개선 |
| `lib/map/components/SurveyStatusLayer.tsx` | Component | 전면 재작성 |
| `lib/map/types.ts` | Types | UrgencyLevel 추가 |
| `lib/map/components/StatusPopup.tsx` | Component | 팝업 정보 확장 |
| `app/map/index.tsx` | Screen | AssignmentSheet 제거, hook 교체 |
| `components/map/AssignmentSheet.tsx` | Component | 삭제 |

### 10.2 Consumers

| Resource | Consumer | Impact |
|----------|----------|--------|
| useSurveyStatusMap | `app/map/index.tsx` | → useParcelStyle로 교체 |
| useAssignmentGeoms | `app/map/index.tsx` | → usePolygonGeoms로 교체 |
| SurveyStatusLayer | `app/map/index.tsx` | Props 인터페이스 변경 |
| AssignmentSheet | `app/map/index.tsx` 만 | 삭제 |

---

## 11. Next Steps

1. [ ] `/pdca design field-survey-map-ux` — 설계 문서 작성
2. [ ] `/pdca do field-survey-map-ux` — 구현
3. [ ] 실기기 야외 가독성 테스트
4. [ ] (추후) VWorld 지적도 MVT 지원 여부 확인 → 폴리곤 소스 마이그레이션

---

## Appendix: Brainstorming Log

| Phase | Question | Answer | Decision |
|-------|----------|--------|----------|
| Intent | 지도에서 조사원이 실제로 하는 일? | 상태 확인 → 우선순위 판단 → 탭 → 조사 | 상태+긴급도 2축 인코딩 |
| Alternatives | 하단 시트? | 제거 | SC-7로 충분, 버그 원인 |
| Alternatives | 렌더 아키텍처? | lon/lat 중심점 + lazy 폴리곤 | 성능 최적 |
| YAGNI | 클러스터링? | Yes, 저줌 노이즈 해결 필수 | 포함 |
| YAGNI | priority 아이콘 에셋? | 구현 복잡 | 1차 제외, 텍스트 대체 |
| YAGNI | VWorld MVT? | 지원 미확인 | 추후 마이그레이션 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-23 | 하단 시트 제거 초안 | JY Kim |
| 0.2 | 2026-04-23 | 가시화 전략 전면 확장 (줌 4단계, 2축 인코딩, 성능 아키텍처) | JY Kim |
