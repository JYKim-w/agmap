# Mobile API 스펙 (현행화 2026-04-04)

> Base URL: `/mobile/api/survey`
> 인증: `Authorization: Bearer {accessToken}` 필수
> 응답 래퍼: `ApiResponse<T>` — `{ success, code, message, data, timestamp }`
> 역할: SURVEYOR (또는 ADMIN, MANAGER)

---

## 1. 내 할당 목록 조회

```
GET /mobile/api/survey/my-assignments
```

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | String | N | 날짜 (YYYY-MM-DD). 미지정 시 전체 |
| `status` | String | N | 배정 상태 (ASSIGNED / IN_PROGRESS / COMPLETED / RETURNED) |

> JWT에서 surveyorId 자동 추출 → 본인 건만 반환.

**Response `data`**: `List`

```json
[
  {
    "assignmentId": 1,
    "resultId": null,
    "resultStatus": null,
    "surveyedAt": null,
    "address": "경기도 수원시 장안구 이목동 100-3",
    "riskGrade": "HIGH"
  }
]
```

> **진행률**: 클라이언트에서 `resultId != null` 건수 / 전체 건수로 집계

---

## 2. 할당 상세 조회

```
GET /mobile/api/survey/assignment/{assignId}
```

> 본인 건만 조회 가능. 타인 건 → `SURVEY_021` 에러.

**현재 반환 필드**:

```json
{
  "assignmentId": 1, "targetId": 3, "zoneId": 1,
  "surveyorId": 10, "priority": 1, "dueDate": "2026-06-15",
  "assignStatus": "ASSIGNED", "assignedAt": "2026-03-25T09:00:00",
  "address": "경기도 수원시 장안구 이목동 100-3",
  "riskGrade": "HIGH",
  "surveyorName": "김현장", "zoneName": "수원시 장안구·권선구 구역"
}
```

### ⚠️ 미포함 필지 정보 (Web 쿼리 확장 필요)

설계 문서 §5-3에서 자동 로드되어야 할 정보:

| 항목 | DB 컬럼 (tb_survey_target) | 현재 | 필요 조치 |
|------|---------------------------|:----:|---------|
| PNU | `pnu` | ❌ | 쿼리에 `t.pnu` 추가 |
| 지목 | `land_category` | ❌ | 쿼리에 `t.land_category` 추가 |
| 공부면적 | `official_area` | ❌ | 쿼리에 `t.official_area` 추가 |
| 소유자명 | `owner_name` | ❌ | 쿼리에 `t.owner_name` 추가 |
| 소유자 유형 | `owner_type` | ❌ | 쿼리에 `t.owner_type` 추가 |
| 취득 유형 | `acquisition_type` | ❌ | 쿼리에 `t.acquisition_type` 추가 |
| 위험군 유형 | `risk_group_code` | ❌ | 쿼리에 `t.risk_group_code` 추가 |
| 선별 사유 | `selection_reason` | ❌ | 쿼리에 `t.selection_reason` 추가 |

> Web의 `survey-assign-mapper.xml` → `selectAssignById` 쿼리에서 `t.*`로 변경하면 해결.
> 또는 Mobile용 별도 상세 API 추가.

---

## 3. 조사 결과 제출

```
POST /mobile/api/survey/result
Content-Type: application/json
```

**Request Body**: (survey-form-spec.md 참조)

```json
{
  "assignmentId": 1,
  "cultivationYn": true,
  "cropType": "RICE",
  "cropCondition": "GOOD",
  "cultivatorType": "OWNER",
  "leaseYn": false, "lesseeInfo": null,
  "fallowYn": false, "fallowPeriod": null, "fallowReason": null, "neglectLevel": null,
  "facilityYn": false, "facilityType": null, "facilityDetail": null,
  "facilityPermitted": null, "facilityArea": null, "facilityRatio": null,
  "conversionYn": false, "conversionUse": null, "conversionScale": null, "conversionPermitted": null,
  "surveyorOpinion": "NORMAL",
  "ownerContact": "CONTACTED",
  "memo": "정상 경작 확인",
  "surveyLat": 37.2995,
  "surveyLng": 127.0025,
  "surveyedAt": "2026-04-04T10:30:00",
  "resultStatus": "SUBMITTED"
}
```

| 필드 | 설명 |
|------|------|
| `resultStatus` | `DRAFT` = 임시저장, `SUBMITTED` = 제출 |
| `surveyLat/Lng` | GPS 좌표 (Double). 서버에서 `ST_MakePoint(lng, lat)` 저장 |

**서버 검증**: 필수항목 누락 + 논리 모순 → `validation_warnings` JSONB 자동 기록 (제출 차단 안 함)

**Response `data`**: `Long` (result_id) — 이후 사진 업로드 시 사용

---

## 4. 조사 결과 수정

```
PUT /mobile/api/survey/result/{resultId}
```

Body: 3번과 동일. **DRAFT 상태만 수정 가능**.

---

## 5. 증빙 사진 업로드

```
POST /mobile/api/survey/photo/upload
Content-Type: multipart/form-data
```

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `resultId` | Long | Y | 조사 결과 ID |
| `photoType` | String | Y | `OVERVIEW` / `CLOSEUP` / `FACILITY` / `VIOLATION` / `ETC` |
| `file` | File | Y | 이미지 파일 |

**서버 처리**: EXIF GPS/방향/시간 자동 추출 + 300px 썸네일 생성

**사진 URL 규칙**:
- 원본: `GET /survey-photo/{resultId}/{filename}` (인증 필요)
- 썸네일: `GET /survey-photo/{resultId}/thumb/thumb_{filename}` (인증 필요)

---

## 6. 반려 건 목록

```
GET /mobile/api/survey/rejected
```

반려 사유(`reviewComment`) 포함.

---

## 7. 재조사 제출

```
POST /mobile/api/survey/result/{resultId}/resubmit
```

Body: 3번과 동일. **REJECTED 상태만** 재제출 가능.

---

## 에러 코드

| Code | Message |
|------|---------|
| `SURVEY_002` | 조사 결과를 찾을 수 없습니다 |
| `SURVEY_003` | DRAFT 상태에서만 수정 가능 |
| `SURVEY_004` | 반려 상태에서만 재제출 가능 |
| `SURVEY_010` | 파일이 비어 있습니다 |
| `SURVEY_020` | 배정 건을 찾을 수 없습니다 |
| `SURVEY_021` | 본인 배정 건만 조회 가능 |

---

## 마스터코드 조회

> ⚠️ 현재 코드 조회 API는 `/admin/survey/api/target/codes?codeGroup=` 경로 → **SURVEYOR 접근 불가**.
> Mobile 구현 시 Web에 `/mobile/api/survey/codes` API 추가 요청 필요.
> 임시 대응: 코드 목록을 앱에 하드코딩 (survey-form-spec.md에 전체 목록 있음)
