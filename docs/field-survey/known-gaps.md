# 설계 대비 미구현/불일치 항목 (현행화 2026-04-04)

> 설계 문서(`field-survey-service-design.md`)와 실제 Web 구현 간의 차이.
> Mobile 구현 시 이 항목들을 인지하고 대응 방안대로 처리할 것.

---

## 1. 설계에 있으나 API 미구현

| # | 설계 항목 | 설계 위치 | 현재 상태 | Mobile 대응 방안 |
|---|----------|---------|---------|----------------|
| G-1 | **공지사항 조회** | §5-1 홈 탭 | API 없음 | 앱 내 정적 공지 또는 추후 API 추가 |
| G-2 | **내 실적 조회** (일별/주별) | §5-7 마이페이지 | Plan에 Phase 2로 명시, 미구현 | 클라이언트에서 my-assignments 집계로 임시 대체 |
| G-3 | **오프라인 모드** | §5-5 | 전혀 미구현 | 로컬 SQLite + 동기화 큐를 Mobile에서 자체 구현. 서버 API 변경 불필요하나 `client_uuid` 중복 제출 방지 필요 |
| G-4 | **Push 알림** (FCM) | §5-6 | `tb_user.device_token` 컬럼은 있으나 FCM 연동 없음 | `device_token` 등록 API 필요 (`PUT /mobile/api/survey/device-token`). FCM 서버 발송은 Web에서 구현 |
| G-5 | **영상 커버리지 정보** | §5-2 "이 구역은 2026.06.15 촬영" | API 없음 | 드론 프로젝트 테이블(`tb_drone_project`)에서 조회 가능하나 API 미노출. 추후 필요 시 추가 |
| G-6 | **마스터코드 Mobile 조회** | §5-3 드롭다운 | `/admin/` 경로라 SURVEYOR 접근 불가 | `/mobile/api/survey/codes` API 추가 필요. 임시로 하드코딩 |

---

## 2. 설계와 구현 불일치

| # | 항목 | 설계 문서 | 실제 구현 | 조치 |
|---|------|---------|---------|------|
| D-1 | **역할 코드** | `SUPER_ADMIN` / `ADMIN` / `SURVEYOR` | `ADMIN` / `MANAGER` / `SURVEYOR` | **구현이 맞음**. 설계 문서가 오래됨. Mobile은 구현 기준으로 작업 |
| D-2 | **할당 상세 필지 정보** | 소유자, 취득유형, PNU, 지목, 면적, 선별사유 자동 로드 | `address`, `riskGrade`만 반환 | Web 쿼리 확장 필요 (mobile-api-spec.md §2 참조) |
| D-3 | **임대차 항목** | "예/아니오/확인불가" 선택형 | `leaseYn` (Boolean) + `lesseeInfo` (텍스트) | 구현 쪽이 더 상세. Mobile에서 leaseYn + lesseeInfo 둘 다 사용 |
| D-4 | **GPS 위치 검증** | "필지에서 일정 거리 이상이면 경고" | `surveyLat/Lng` 저장만, 거리 검증 없음 | **Mobile 클라이언트에서 구현**. 필지 중심점과 현재 GPS 거리 계산 → 500m 이상 시 경고 |
| D-5 | **조사 소요시간 검증** | "30초 미만이면 경고" | 미구현 | **Mobile 클라이언트에서 구현**. 조사 시작 시간 기록 → 제출 시 소요시간 체크 |
| D-6 | **정사영상 레이어** | "드론 촬영 결과 오버레이" | Web에 TileProxyController 존재. URL: `/tiles/{type}/{projectId}/{z}/{x}/{y}.png` | Mobile에서 MapLibre raster 레이어로 추가. 어떤 projectId를 쓸지 구역-프로젝트 매핑 필요 |

---

## 3. Web에서 추가 구현 필요한 것 (Mobile 시작 전)

> Mobile 구현을 시작하기 전에 Web 개발자에게 요청해야 할 항목.

### 필수 (1순위 구현에 영향)

| # | 항목 | 설명 | 예상 작업량 |
|---|------|------|-----------|
| W-1 | **할당 상세 쿼리 확장** | `selectAssignById`에서 `t.pnu, t.land_category, t.official_area, t.owner_name, t.owner_type, t.acquisition_type, t.risk_group_code, t.selection_reason` 추가 | Mapper XML 1줄, VO 필드 추가 |
| W-2 | **마스터코드 Mobile API** | `GET /mobile/api/survey/codes?codeGroup={그룹}` — SURVEYOR 접근 가능 | Controller 메서드 1개 추가 |

### 권장 (2순위에 영향)

| # | 항목 | 설명 |
|---|------|------|
| W-3 | **device_token 등록 API** | `PUT /mobile/api/survey/device-token` — FCM 토큰 저장 |
| W-4 | **공지사항 API** | `GET /mobile/api/survey/notices` — 간단 공지 목록 |
| W-5 | **내 실적 API** | `GET /mobile/api/survey/my-stats` — 일별/주별 집계 |

---

## 4. Mobile에서 자체 구현할 것 (서버 변경 불필요)

| # | 항목 | 구현 방법 |
|---|------|---------|
| M-1 | **진행률 표시** | `my-assignments` 응답에서 `resultId != null` 비율 계산 |
| M-2 | **GPS 위치 검증** | 현재 위치와 필지 좌표(assignment.address 기반 geocoding 또는 향후 lat/lng 추가) 비교 |
| M-3 | **소요시간 검증** | 조사 시작 시각 기록 → 제출 시 `surveyedAt - startTime < 30초` 경고 |
| M-4 | **필수 사진 검증** | 제출 전 OVERVIEW + CLOSEUP 최소 2장 확인 |
| M-5 | **오프라인 큐** | 네트워크 없을 때 로컬 저장 → 네트워크 복귀 시 자동 업로드 |
| M-6 | **매뉴얼** | 정적 컨텐츠 앱 내장 (조사 가이드 PDF 또는 HTML) |

---

## 5. 데이터 구조 영향 메모

### 오프라인 모드 대비

서버 API 자체는 변경 불필요하지만, Mobile에서 오프라인 대비 시:

- 조사 결과에 `client_uuid` (클라이언트 생성 UUID) 추가 → 중복 제출 방지
  - 현재 `tb_survey_result`에 해당 컬럼 없음 → 추후 ALTER 필요
- 사진 업로드 실패 시 재시도 큐 필요
- 오프라인 지도 타일 다운로드 (MapLibre offline pack)

### 정사영상 연동

- 정사영상 타일 URL: `/tiles/{type}/{projectId}/{z}/{x}/{y}.png`
- `type` = `ortho` (정사영상 타일)
- `projectId` = 드론 프로젝트 ID
- **문제**: 어떤 구역에 어떤 projectId가 매핑되는지 API가 없음
- **임시 대응**: 구역별 projectId를 설정값으로 관리하거나, 전체 프로젝트 목록 조회 후 지역으로 필터
