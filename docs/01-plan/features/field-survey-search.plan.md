# Field Survey Search — Plan

> **Summary**: 지도에서 내 할당 주소 검색 → PNU 기반 WFS 좌표 조회 → 지도 이동 + 필지 선택
>
> **Project**: agmap
> **Author**: JY Kim
> **Date**: 2026-04-06
> **Status**: Draft

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 조사원이 지도에서 특정 할당 필지를 찾으려면 수동 줌/패닝만 가능, 주소 검색 불가 |
| **Solution** | 지도 상단 검색바 + 내 할당 주소 자동완성 + PNU 기반 WFS 좌표 조회 → 지도 이동 |
| **UX Effect** | 주소 입력 → 자동완성에서 선택 → 해당 필지로 즉시 이동 + 팝업 표시 |
| **Core Value** | 특정 필지 탐색 시간 단축 — 수십 건 할당 중 원하는 필지를 즉시 찾기 |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 지도에서 할당 필지를 찾으려면 수동 줌/패닝뿐, 검색 기능 없음 |
| **WHO** | SURVEYOR (현장 조사원) — 본인 할당 내 검색 |
| **RISK** | PNU→좌표 변환 시 WFS 쿼리 속도, proxy 의존 |
| **SUCCESS** | 주소 검색 → 자동완성 → 필지 이동 + 팝업 표시 |
| **SCOPE** | 검색바 + 자동완성 + WFS 좌표 조회 + 지도 이동 + 핀 마커 |

---

## 1. Overview

### 1.1 Purpose

field-survey-map에서 Clean Slate 재작성 시 검색 기능을 제거했다. 조사원이 수십~수백 건의 할당 필지 중 특정 주소를 빠르게 찾을 수 있도록 검색 기능을 추가한다.

### 1.2 Background

- 기존 farmfield 검색(`app/map/search/`)은 레거시 제거됨
- 조사원은 본인 할당 주소만 검색하면 됨 (전국 주소 불필요)
- `my-assignments`에 `address` + `pnu` 필드가 있으므로 외부 API 없이 구현 가능
- 좌표 이동을 위해 PNU → 필지 중심 좌표가 필요 → WFS 1회 쿼리 (캐싱)

---

## 2. Scope

### 2.1 In Scope

- [ ] 지도 상단 검색바 UI (텍스트 입력 + 클리어 버튼)
- [ ] 내 할당 주소 자동완성 (assignmentStore 기반, 클라이언트 필터)
- [ ] 검색 결과 선택 → PNU로 WFS에서 필지 centroid 좌표 조회
- [ ] 좌표 캐싱 (PNU → [lng, lat] Map, 중복 쿼리 방지)
- [ ] 지도 이동 (camera.setCamera + 줌 16)
- [ ] 이동 후 StatusPopup 자동 표시

### 2.2 Out of Scope

- VWorld 일반 주소 검색 (전국 geocoding)
- 검색 히스토리 저장
- 음성 검색

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | 요구사항 | 우선순위 |
|----|----------|:---:|
| FR-01 | 지도 상단에 검색바 표시 (포커스 시 자동완성 드롭다운) | High |
| FR-02 | 입력 텍스트로 my-assignments address 필터링 (실시간) | High |
| FR-03 | 자동완성 항목에 상태 색상 뱃지 표시 | Medium |
| FR-04 | 항목 선택 → PNU로 WFS centroid 조회 → 지도 이동 (줌 16) | High |
| FR-05 | 좌표 캐싱 (한 번 조회한 PNU는 재조회 안 함) | Medium |
| FR-06 | 이동 후 해당 필지 StatusPopup 자동 표시 | High |
| FR-07 | 검색바 클리어 버튼 | Medium |

### 3.2 Non-Functional Requirements

| 카테고리 | 기준 |
|----------|------|
| 성능 | 자동완성 필터링 즉시 (수백 건 클라이언트 필터, 지연 없음) |
| 성능 | WFS centroid 조회 < 2초 (1건 PNU 쿼리) |
| UX | 키보드 올라와도 지도 가려지지 않게 검색바 상단 고정 |

---

## 4. Success Criteria

| # | 기준 | 검증 방법 |
|---|------|----------|
| SC-1 | 검색바 입력 → 할당 주소 자동완성 표시 | 텍스트 입력 후 드롭다운 확인 |
| SC-2 | 자동완성 항목 선택 → 해당 필지로 지도 이동 | 카메라 이동 + 줌 16 확인 |
| SC-3 | 이동 후 StatusPopup 자동 표시 | 팝업 내 주소/상태 정확 |
| SC-4 | 동일 PNU 재검색 시 WFS 재조회 안 함 (캐싱) | 네트워크 탭 확인 |

---

## 5. Risks

| # | 리스크 | 대응 |
|---|--------|------|
| R-1 | WFS centroid 쿼리 시 proxy.jsp 속도 | 캐싱으로 1회만 조회, 이후 즉시 이동 |
| R-2 | PNU에 해당하는 필지가 WFS에 없을 경우 | 주소 기반 VWorld geocoder 폴백 (후속) |
| R-3 | 검색바가 지도 터치 영역을 가림 | 포커스 해제 시 자동완성 닫힘, 검색바 최소 높이 |

---

## 6. Architecture

### 6.1 Data Flow

```
사용자 입력 "곡성"
    ↓
assignmentStore.assignments.filter(a => a.address.includes("곡성"))
    ↓
자동완성 드롭다운 (주소 + 상태 뱃지)
    ↓
사용자 선택 → PNU 확인
    ↓
centroidCache.has(pnu) ?
  YES → 바로 이동
  NO  → WFS 쿼리 (v_fml_lot, CQL_FILTER=pnu='...')
        → centroid 계산 → 캐시 저장 → 이동
    ↓
camera.setCamera({ centerCoordinate, zoomLevel: 16 })
    ↓
setSelectedPnu(pnu) → StatusPopup 표시
```

### 6.2 신규 파일

| 파일 | 역할 |
|------|------|
| `lib/map/components/SearchBar.tsx` | 검색바 UI + 자동완성 드롭다운 |
| `lib/map/hooks/useParcelCentroid.ts` | PNU → WFS centroid 조회 + 캐싱 |

### 6.3 수정 파일

| 파일 | 변경 |
|------|------|
| `app/map/index.tsx` | SearchBar 추가 + 검색 결과 선택 핸들러 |

---

## 7. Implementation Order

1. [ ] `lib/map/hooks/useParcelCentroid.ts` — WFS centroid 조회 + Map 캐싱
2. [ ] `lib/map/components/SearchBar.tsx` — 검색바 + 자동완성
3. [ ] `app/map/index.tsx` — SearchBar 통합 + 선택 시 이동/팝업

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-06 | Initial draft | JY Kim |
