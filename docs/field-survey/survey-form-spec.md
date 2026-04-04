# 조사 입력 항목 + 마스터코드

> 설계 문서 §5-3 기반. Mobile 조사 폼 구현 시 참조.

## 조사 폼 구조

조사원이 현장에서 입력하는 항목. 위저드(단계별) 형태 권장.

---

## Step 1: 필지 기본 정보 (자동 로드 — 입력 불필요)

API `GET /mobile/api/survey/assignment/{assignId}`에서 자동 제공.

| 항목 | 필드 | 표시만 |
|------|------|:------:|
| 소재지 (주소) | `address` | 읽기전용 |
| 위험도 | `riskGrade` | 읽기전용 |
| 우선순위 | `priority` | 읽기전용 |
| 조사 기한 | `dueDate` | 읽기전용 |

---

## Step 2: 실경작 확인

| 항목 | 필드 | 입력 방식 | 필수 | 코드 그룹 |
|------|------|---------|:----:|----------|
| 경작 여부 | `cultivationYn` | Boolean (예/아니오) | **필수** | — |
| 작물 종류 | `cropType` | 드롭다운 | 조건부 | `CROP_TYPE` |
| 작물 상태 | `cropCondition` | 드롭다운 | 조건부 | `CROP_CONDITION` |
| 경작자 | `cultivatorType` | 드롭다운 | 조건부 | `CULTIVATOR_TYPE` |
| 임대차 여부 | `leaseYn` | Boolean | 조건부 | — |
| 임차인 정보 | `lesseeInfo` | 텍스트 | 조건부 | — |

> `cultivationYn = true`일 때만 cropType, cropCondition, cultivatorType 표시

---

## Step 3: 휴경 확인

| 항목 | 필드 | 입력 방식 | 필수 | 코드 그룹 |
|------|------|---------|:----:|----------|
| 휴경 여부 | `fallowYn` | Boolean | **필수** | — |
| 추정 기간 | `fallowPeriod` | 드롭다운 | 조건부 | `FALLOW_PERIOD` |
| 휴경 사유 | `fallowReason` | 드롭다운 | 조건부 | `FALLOW_REASON` |
| 방치 수준 | `neglectLevel` | 드롭다운 | 조건부 | `NEGLECT_LEVEL` |

> `fallowYn = true`일 때만 하위 항목 표시

---

## Step 4: 시설물 확인

| 항목 | 필드 | 입력 방식 | 필수 | 코드 그룹 |
|------|------|---------|:----:|----------|
| 시설물 유무 | `facilityYn` | Boolean | **필수** | — |
| 시설물 유형 | `facilityType` | 드롭다운 | 조건부 | `FACILITY_TYPE` |
| 구체 유형 | `facilityDetail` | 드롭다운 | 조건부 | `FACILITY_DETAIL` |
| 허가 여부 | `facilityPermitted` | 드롭다운 | 조건부 | `PERMIT_STATUS` |
| 시설 면적 | `facilityArea` | 숫자 (m2) | 조건부 | — |
| 점유 비율 | `facilityRatio` | 숫자 (%) | 선택 | — |

---

## Step 5: 불법 전용 확인

| 항목 | 필드 | 입력 방식 | 필수 | 코드 그룹 |
|------|------|---------|:----:|----------|
| 전용 여부 | `conversionYn` | Boolean | 선택 | — |
| 전용 용도 | `conversionUse` | 드롭다운 | 조건부 | `CONVERSION_USE` |
| 전용 규모 | `conversionScale` | 드롭다운 | 조건부 | `CONVERSION_SCALE` |
| 전용 허가 | `conversionPermitted` | 드롭다운 | 조건부 | `PERMIT_STATUS` |

---

## Step 6: 종합 판단

| 항목 | 필드 | 입력 방식 | 필수 | 코드 그룹 |
|------|------|---------|:----:|----------|
| 조사원 의견 | `surveyorOpinion` | 드롭다운 | **필수** | `SURVEYOR_OPINION` |
| 소유자 접촉 | `ownerContact` | 드롭다운 | 선택 | `OWNER_CONTACT` |
| 특이사항 메모 | `memo` | 텍스트 자유입력 | 선택 | — |

---

## Step 7: 증빙 사진

| 사진 유형 | photoType | 필수 |
|----------|-----------|:----:|
| 전경 (필지 전체) | `OVERVIEW` | **필수** |
| 근경 (작물/시설 클로즈업) | `CLOSEUP` | **필수** |
| 시설물 | `FACILITY` | 조건부 (시설물 있을 때) |
| 위반 증거 | `VIOLATION` | 조건부 (위반 판단 시) |
| 기타 | `ETC` | 선택 |

> 촬영 시 GPS 좌표 + 촬영 방향 + 타임스탬프 자동 기록 (EXIF)

---

## 마스터 코드 목록

코드 조회 API: `GET /admin/survey/api/target/codes?codeGroup={그룹명}`

> Mobile에서도 동일 API 사용 가능 (인증 필요)

### CROP_TYPE (작물 종류)

| code_value | code_label |
|------------|-----------|
| RICE | 벼 |
| FIELD_CROP | 밭작물 |
| FRUIT | 과수 |
| VEGETABLE | 채소 |
| FLOWER | 화훼 |
| SPECIAL | 특용작물 |
| ETC | 기타 |

### CROP_CONDITION (작물 상태)

| code_value | code_label |
|------------|-----------|
| GOOD | 양호 |
| NORMAL | 보통 |
| POOR | 불량 |

### CULTIVATOR_TYPE (경작자 유형)

| code_value | code_label |
|------------|-----------|
| OWNER | 소유자 본인 |
| ENTRUST | 위탁 |
| LEASE | 임대차 |
| UNKNOWN | 확인불가 |

### FACILITY_TYPE (시설물 유형)

| code_value | code_label |
|------------|-----------|
| AGRICULTURE | 농업시설 |
| NON_AGRICULTURE | 비농업시설 |
| MIXED | 혼합 |

### FACILITY_DETAIL (시설물 상세)

| code_value | code_label |
|------------|-----------|
| GREENHOUSE | 비닐하우스 |
| WAREHOUSE | 창고 |
| HOUSE | 주택 |
| FACTORY | 공장 |
| SOLAR | 태양광 |
| ETC | 기타 |

### FALLOW_PERIOD (휴경 기간)

| code_value | code_label |
|------------|-----------|
| UNDER_1Y | 1년 미만 |
| 1_TO_3Y | 1~3년 |
| OVER_3Y | 3년 이상 |

### FALLOW_REASON (휴경 사유)

| code_value | code_label |
|------------|-----------|
| ELDERLY | 고령 |
| ABSENT | 부재 |
| ECONOMIC | 경제적 사유 |
| ETC | 기타 |

### NEGLECT_LEVEL (방치 수준)

| code_value | code_label |
|------------|-----------|
| MILD | 경미 |
| SEVERE | 심각 |
| TOTAL | 완전 방치 |

### CONVERSION_USE (전용 용도)

| code_value | code_label |
|------------|-----------|
| RESIDENTIAL | 주거 |
| COMMERCIAL | 상업 |
| INDUSTRIAL | 공업 |
| PARKING | 주차장 |
| STORAGE_YARD | 야적장 |
| ETC | 기타 |

### CONVERSION_SCALE (전용 규모)

| code_value | code_label |
|------------|-----------|
| PARTIAL | 부분 |
| FULL | 전체 |

### PERMIT_STATUS (허가 여부 — 시설물/전용 공용)

| code_value | code_label |
|------------|-----------|
| PERMITTED | 허가 |
| UNPERMITTED | 무허가 |
| UNKNOWN | 확인불가 |

### OWNER_CONTACT (소유자 접촉)

| code_value | code_label |
|------------|-----------|
| CONTACTED | 접촉함 |
| ABSENT | 부재 |
| REFUSED | 거부 |

### SURVEYOR_OPINION (조사원 의견)

| code_value | code_label |
|------------|-----------|
| NORMAL | 정상 |
| MINOR_VIOLATION | 경미 위반(계도) |
| VIOLATION | 위반(처분 필요) |

---

## UX 핵심 원칙

> 설계 문서 §10: 비전문가가 교육 최소한으로 바로 쓸 수 있어야 함.
> 5,000명 투입, 외주/알바 중심 → 단순하고 직관적인 UI 필수.

- **최대한 선택형** (드롭다운, 버튼), 텍스트 입력 최소화
- **단계별 안내** (위저드 형태로 항목 순서대로)
- **큰 터치 영역** (야외 장갑/햇빛 환경)
- **실수 방지** (저장 전 요약 확인 화면)
- **조건부 표시** (경작여부=예 일 때만 작물 항목 보여줌)

## 품질 검증 (저장 시 자동)

| 검증 항목 | 규칙 |
|----------|------|
| 필수 항목 | cultivationYn, fallowYn, facilityYn, surveyorOpinion 미입력 시 경고 |
| 사진 최소 | OVERVIEW + CLOSEUP 최소 2장 미첨부 시 경고 |
| 위치 검증 | 현재 GPS가 해당 필지에서 일정 거리 이상이면 경고 |
| 논리 검증 | "경작중"인데 "완전 방치" 선택 등 모순 감지 |

> 경고 무시 가능하되, 무시 사실 기록 → 검수 시 관리자에게 표시 (`validation_warnings` JSONB)
