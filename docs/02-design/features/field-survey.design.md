# Field Survey Mobile App — Design (Option B: Clean Architecture)

> 작성일: 2026-04-04
> 선택 설계안: B (클린 아키텍처) — farmfield 이식을 위한 모듈 독립성 확보

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | Web 백엔드 완성 → 현장 조사원이 실제 사용할 모바일 앱이 없음 |
| **WHO** | SURVEYOR (현장 조사원, 외주/알바 5,000명) |
| **RISK** | 마스터코드 API SURVEYOR 접근 불가(하드코딩), 할당 상세 필지정보 미포함 |
| **SUCCESS** | 로그인 → 할당 확인 → 조사 입력 → 사진 첨부 → 제출 플로우 완성 |
| **SCOPE** | Phase 0~3 (스택정비, 인증, 홈, 조사폼) 우선 |

---

## 1. Overview

farmfield 레거시 코드(`app/js/`, `app/map/inspect/`)를 전면 교체하고, 독립적인 `lib/` 모듈 구조로 새로 설계한다. `src/map/`의 GIS 코드(좌표 변환, 레이어, GPS 트래킹)는 `lib/map/`으로 마이그레이션하여 양쪽 프로젝트에서 재사용 가능하게 한다.

### 설계 결정 근거

| 결정 | 이유 |
|------|------|
| `lib/` 계층 분리 | farmfield 이식 시 `lib/` 폴더만 복사하면 됨 |
| NativeBase → RN StyleSheet | deprecated + New Arch 충돌 |
| gorhom → 자체 BottomSheet | reanimated v4 미호환 블로커 |
| `js/login.js` → `lib/api/` | session → JWT 완전히 다른 인증 방식 |
| zustand store 신규 | farmfield store 구조와 API 응답 구조 상이 |

---

## 2. 폴더 구조

```
agmap/
├── app/                          # expo-router 라우팅 (화면)
│   ├── _layout.tsx               # RootLayout (GestureHandler, SafeArea, Toast)
│   ├── index.tsx                 # 로그인 상태 분기 → /(tabs) or /login
│   ├── login.tsx                 # 로그인 화면
│   └── (tabs)/                   # 하단 탭 네비게이션
│       ├── _layout.tsx           # TabLayout (4탭 정의)
│       ├── index.tsx             # 홈 탭 (오늘의 조사)
│       ├── map.tsx               # 지도 탭
│       ├── survey/               # 조사 탭
│       │   ├── index.tsx         # 조사 진입점 (미선택 시 안내)
│       │   └── [id].tsx          # 조사 위저드 (assignmentId 기반)
│       └── profile.tsx           # 내정보 탭
│
├── lib/                          # 비즈니스 로직 (이식 가능 모듈)
│   ├── api/                      # API 클라이언트
│   │   ├── client.ts             # fetch wrapper (토큰 자동 주입, 에러 핸들링)
│   │   ├── auth.ts               # login, logout
│   │   ├── survey.ts             # 7개 survey API
│   │   └── types.ts              # API 요청/응답 타입
│   │
│   ├── store/                    # zustand 스토어
│   │   ├── auth.ts               # 인증 상태 (토큰, 유저 정보)
│   │   ├── assignments.ts        # 할당 목록 + 반려 건
│   │   └── surveyForm.ts         # 7단계 위저드 폼 상태
│   │
│   ├── survey/                   # 조사 도메인 로직
│   │   ├── codes.ts              # 마스터코드 하드코딩 (13그룹)
│   │   ├── validation.ts         # 폼 검증 (필수, 논리, GPS, 시간)
│   │   └── types.ts              # 조사 폼 타입 정의
│   │
│   ├── map/                      # 지도/GIS (src/map에서 마이그레이션)
│   │   ├── hooks/
│   │   │   └── useUserTracking.ts  # GPS 트래킹 (Kalman 필터)
│   │   ├── layers/
│   │   │   ├── VWorldLayers.tsx    # VWorld 배경 레이어
│   │   │   ├── GeoserverLayers.tsx # WFS/WMS 레이어
│   │   │   ├── ParcelLayer.tsx     # 필지 상태별 색상 레이어 (신규)
│   │   │   └── OrthoLayer.tsx      # 정사영상 타일 레이어 (신규)
│   │   ├── utils/
│   │   │   └── transform.ts        # 좌표 변환 (proj4, turf)
│   │   └── constants.ts            # 지도 설정, 한국 bbox
│   │
│   └── config.ts                 # 환경 설정 (서버 URL, API 키)
│
├── components/                   # 공통 UI 컴포넌트 (이식 가능)
│   ├── BottomSheet.tsx           # 커스텀 bottom sheet (reanimated + gesture)
│   ├── FormSelect.tsx            # 버튼 그리드 선택 (마스터코드용, 1탭 완료)
│   ├── FormYesNo.tsx             # 예/아니오 버튼 그룹
│   ├── FormTextInput.tsx         # 텍스트 입력 (메모 등)
│   ├── FormNumberInput.tsx       # 숫자 입력 (면적, 비율)
│   ├── FormSection.tsx           # 폼 섹션 래퍼 (라벨 + 필수 표시)
│   ├── PhotoCapture.tsx          # 사진 촬영/갤러리 + EXIF GPS
│   ├── ActionSheet.tsx           # 바텀 액션시트 (카메라/앨범 등 선택)
│   ├── SearchBar.tsx             # 검색 입력 (할당 내 주소 필터)
│   ├── StatusBadge.tsx           # 상태 뱃지 (미조사~승인 7종)
│   ├── ValidationModal.tsx       # 검증 경고 모달 (무시/수정 선택)
│   ├── EmptyState.tsx            # 빈 상태 안내
│   └── LoadingOverlay.tsx        # 로딩 오버레이
│
├── store/                        # 레거시 (Phase 0에서 정리)
├── src/map/                      # 레거시 (lib/map/으로 마이그레이션 후 제거)
└── app/js/                       # 레거시 (lib/으로 마이그레이션 후 제거)
```

---

## 3. 라우팅 설계

### 3.1 화면 흐름

```
앱 시작
  │
  ├─ 토큰 없음 → /login
  │                 │
  │                 └─ 로그인 성공 → /(tabs)
  │
  └─ 토큰 있음 → /(tabs)
                    │
                    ├── / (홈)
                    │    ├── 진행률 카드 (완료 N / 전체 N)
                    │    ├── 반려 건 알림 배너 (있을 때만)
                    │    ├── 세그먼트 탭: [할당 목록] / [제출 현황]
                    │    ├── 검색바 (할당 내 주소 필터)
                    │    ├── [할당 목록] 미조사/진행중 카드 리스트
                    │    └── [제출 현황] 상태 카운트 4칸 + 제출 카드 리스트
                    │
                    ├── /map
                    │    ├── 검색바 (할당 내 주소 검색 → 마커 이동)
                    │    ├── 필지 상태 색상 마커 + 범례
                    │    ├── FAB (현위치/레이어/정사영상)
                    │    ├── 바텀시트 peek → 마커 탭 시 half (필지 상세)
                    │    └── "조사 시작" → /(tabs)/survey/[id]
                    │
                    ├── /survey
                    │    ├── /survey (미선택 → 안내)
                    │    └── /survey/[id] (7단계 위저드)
                    │         ├── Step 1: 필지 정보 (읽기전용 + GPS 거리)
                    │         ├── Step 2~5: 폼 입력 (버튼 그리드 선택)
                    │         ├── Step 6: 종합 판단 (의견 1열 + 메모)
                    │         ├── Step 7: 사진 촬영 (액션시트: 카메라/앨범)
                    │         ├── 확인 화면 (요약 + 검증 경고)
                    │         └── 검증 경고 모달 → 임시저장 / 제출
                    │
                    └── /profile
                         ├── 조사 실적 / 매뉴얼
                         ├── 설정 / 앱 정보
                         └── 로그아웃
```

### 3.2 _layout.tsx 구조

```
RootLayout (app/_layout.tsx)
├── GestureHandlerRootView
│   ├── Stack
│   │   ├── login (headerShown: false)
│   │   └── (tabs) (headerShown: false)
│   └── Toast
```

```
TabLayout (app/(tabs)/_layout.tsx)
├── Tabs
│   ├── index → 홈 (icon: home)
│   ├── map → 지도 (icon: map)
│   ├── survey/index → 조사 (icon: clipboard)
│   └── profile → 내정보 (icon: user)
```

---

## 4. API 클라이언트 설계

### 4.1 lib/api/client.ts

```typescript
// 핵심 설계
interface ApiClient {
  get<T>(path: string, params?: Record<string, string>): Promise<ApiResponse<T>>;
  post<T>(path: string, body?: unknown): Promise<ApiResponse<T>>;
  put<T>(path: string, body?: unknown): Promise<ApiResponse<T>>;
  upload<T>(path: string, formData: FormData): Promise<ApiResponse<T>>;
}

// ApiResponse 래퍼 (서버 응답 구조)
interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}
```

**동작**:
- `Authorization: Bearer {accessToken}` 자동 주입 (authStore에서 읽기)
- 401 응답 시 → authStore.logout() → /login 리다이렉트
- 네트워크 에러 → Toast 표시
- Base URL: `lib/config.ts`에서 관리

### 4.2 lib/api/auth.ts

```typescript
async function login(loginId: string, password: string): Promise<LoginResponse>
async function logout(): Promise<void>

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  loginId: string;
  userName: string;
  role: 'SURVEYOR' | 'MANAGER' | 'ADMIN';
  companyName: string;
}
```

### 4.3 lib/api/survey.ts

```typescript
// Plan 참조: mobile-api-spec.md 7개 엔드포인트
async function getMyAssignments(params?: { date?: string; status?: string }): Promise<Assignment[]>
async function getAssignment(assignId: number): Promise<AssignmentDetail>
async function submitResult(data: SurveyResultInput): Promise<number>  // resultId
async function updateResult(resultId: number, data: SurveyResultInput): Promise<void>
async function uploadPhoto(resultId: number, photoType: string, file: ImagePickerAsset): Promise<void>
async function getRejected(): Promise<RejectedAssignment[]>
async function resubmitResult(resultId: number, data: SurveyResultInput): Promise<void>
```

---

## 5. 상태 설계 (zustand)

### 5.1 authStore

```typescript
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    userId: number;
    loginId: string;
    userName: string;
    role: string;
    companyName: string;
  } | null;
  isAuthenticated: boolean;

  login: (loginId: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loadStoredToken: () => Promise<void>;  // 앱 시작 시 AsyncStorage에서 복원
}
```

**토큰 관리**:
- 로그인 성공 → AsyncStorage에 저장 + store 업데이트
- 앱 시작 → AsyncStorage에서 복원 → accessToken으로 API 호출
- 401 → 로그아웃 처리

### 5.2 assignmentStore

```typescript
interface AssignmentState {
  // 할당 목록 탭
  assignments: Assignment[];       // 오늘 할당 목록
  rejected: RejectedAssignment[];  // 반려 건
  isLoading: boolean;

  // 제출 현황 탭
  submitted: SubmittedResult[];    // 제출한 조사 결과 목록
  statusCounts: {                  // 상태별 카운트 (4칸 카드)
    submitted: number;             // 제출완료 (SUBMITTED)
    reviewing: number;             // 검수중 (UNDER_REVIEW/FINAL_REVIEW)
    approved: number;              // 승인 (APPROVED)
    rejected: number;              // 반려 (REJECTED)
  };

  // 검색
  searchQuery: string;             // 주소 검색어

  // 파생 값 (get)
  totalCount: number;              // 전체 건수
  completedCount: number;          // 완료 건수 (resultId != null)
  progressRate: number;            // 완료율 (%)
  filteredAssignments: Assignment[];    // 검색 필터 적용된 목록
  filteredSubmitted: SubmittedResult[]; // 검색 필터 적용된 제출 목록

  fetchAssignments: (date?: string) => Promise<void>;
  fetchRejected: () => Promise<void>;
  setSearchQuery: (query: string) => void;
}

// 제출 현황 목록 항목
interface SubmittedResult {
  resultId: number;
  assignmentId: number;
  address: string;
  resultStatus: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'FINAL_REVIEW' | 'APPROVED' | 'REJECTED';
  surveyorOpinion: string;
  surveyedAt: string;
  reviewComment?: string;        // 반려 사유
}
```

> 제출 현황 데이터: `my-assignments`에서 `resultId != null`인 건의 `resultStatus`로 집계.
> 서버에 별도 API 없으므로 할당 목록 응답에서 클라이언트 파생.
```

### 5.3 surveyFormStore (핵심)

```typescript
interface SurveyFormState {
  // 현재 상태
  currentStep: number;             // 1~7 (+ 8=확인화면)
  assignmentId: number | null;
  assignmentDetail: AssignmentDetail | null;
  startedAt: string | null;        // 소요시간 검증용

  // 폼 데이터 (Step 2~6)
  formData: SurveyFormData;

  // 사진 (Step 7)
  photos: PhotoEntry[];            // { uri, photoType, uploaded: boolean }

  // 임시저장된 resultId
  draftResultId: number | null;

  // Actions
  initSurvey: (assignmentId: number) => Promise<void>;  // 상세 로드 + 초기화
  setStep: (step: number) => void;
  updateField: (field: string, value: any) => void;
  addPhoto: (uri: string, photoType: string) => void;
  removePhoto: (index: number) => void;
  saveDraft: () => Promise<void>;          // 임시저장 (DRAFT)
  submit: () => Promise<void>;             // 제출 (SUBMITTED)
  validate: () => ValidationResult;        // 품질 검증
  reset: () => void;
}

interface SurveyFormData {
  // Step 2: 실경작
  cultivationYn: boolean | null;
  cropType: string | null;
  cropCondition: string | null;
  cultivatorType: string | null;
  leaseYn: boolean | null;
  lesseeInfo: string | null;

  // Step 3: 휴경
  fallowYn: boolean | null;
  fallowPeriod: string | null;
  fallowReason: string | null;
  neglectLevel: string | null;

  // Step 4: 시설물
  facilityYn: boolean | null;
  facilityType: string | null;
  facilityDetail: string | null;
  facilityPermitted: string | null;
  facilityArea: number | null;
  facilityRatio: number | null;

  // Step 5: 불법 전용
  conversionYn: boolean | null;
  conversionUse: string | null;
  conversionScale: string | null;
  conversionPermitted: string | null;

  // Step 6: 종합 판단
  surveyorOpinion: string | null;
  ownerContact: string | null;
  memo: string | null;

  // GPS
  surveyLat: number | null;
  surveyLng: number | null;
}
```

---

## 6. 조사 폼 위저드 설계

### 6.1 Step 흐름

```
[Step 1] 필지 정보 (읽기전용, 자동 로드)
    ↓
[Step 2] 실경작 확인 (cultivationYn → 조건부 하위 항목)
    ↓
[Step 3] 휴경 확인 (fallowYn → 조건부 하위 항목)
    ↓
[Step 4] 시설물 확인 (facilityYn → 조건부 하위 항목)
    ↓
[Step 5] 불법 전용 확인 (conversionYn → 조건부 하위 항목)
    ↓
[Step 6] 종합 판단 (surveyorOpinion 필수)
    ↓
[Step 7] 증빙 사진 (OVERVIEW + CLOSEUP 필수)
    ↓
[확인] 입력 요약 → 임시저장 / 제출
```

### 6.2 위저드 컴포넌트 구조

```
app/(tabs)/survey/[id].tsx
├── WizardHeader          # 현재 스텝 표시 (1/7), 진행률 바
├── WizardContent         # 현재 스텝의 폼 컨텐츠
│   ├── StepInfo          # Step 1: 읽기전용 필지 정보
│   ├── StepCultivation   # Step 2: 실경작
│   ├── StepFallow        # Step 3: 휴경
│   ├── StepFacility      # Step 4: 시설물
│   ├── StepConversion    # Step 5: 불법 전용
│   ├── StepOpinion       # Step 6: 종합 판단
│   ├── StepPhotos        # Step 7: 증빙 사진
│   └── StepConfirm       # 확인: 입력 요약
└── WizardFooter          # 이전/다음 + 임시저장 버튼
```

### 6.3 조건부 표시 로직

| 조건 | 표시 항목 |
|------|----------|
| `cultivationYn === true` | cropType, cropCondition, cultivatorType, leaseYn |
| `leaseYn === true` | lesseeInfo |
| `fallowYn === true` | fallowPeriod, fallowReason, neglectLevel |
| `facilityYn === true` | facilityType, facilityDetail, facilityPermitted, facilityArea, facilityRatio |
| `conversionYn === true` | conversionUse, conversionScale, conversionPermitted |
| `facilityYn === true` (사진) | FACILITY 사진 타입 표시 |
| `surveyorOpinion === 'VIOLATION'` (사진) | VIOLATION 사진 타입 표시 |

### 6.4 품질 검증 (lib/survey/validation.ts)

```typescript
interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
}

interface ValidationWarning {
  type: 'REQUIRED' | 'PHOTO' | 'GPS' | 'LOGIC' | 'TIME';
  field?: string;
  message: string;
}
```

| 검증 | 규칙 | 심각도 |
|------|------|--------|
| 필수 항목 | cultivationYn, fallowYn, facilityYn, surveyorOpinion 미입력 | 차단 |
| 사진 최소 | OVERVIEW + CLOSEUP 2장 미만 | 차단 |
| GPS 거리 | 현재 GPS와 필지 좌표 500m 이상 | 경고 (무시 가능) |
| 논리 모순 | "경작중" + "완전 방치" 동시 선택 등 | 경고 (무시 가능) |
| 소요 시간 | 조사 시작~제출 30초 미만 | 경고 (무시 가능) |

> 검증 UI 플로우:
> 1. 확인 화면에서 "제출" 탭
> 2. `validate()` 실행
> 3. 차단 항목(필수/사진) 있으면 → 에러 토스트 + 해당 필드 빨간 보더 + 제출 불가
> 4. 경고 항목만 있으면 → ValidationModal 표시 (무시/수정 선택)
> 5. "무시하고 제출" → `validation_warnings` 배열에 기록 → 서버 제출
> 6. 경고 없으면 → 바로 제출

---

## 7. 마스터코드 설계

### lib/survey/codes.ts

서버 API(`/admin/survey/api/target/codes`)가 SURVEYOR 접근 불가이므로 하드코딩.

```typescript
// 구조
interface CodeItem {
  value: string;
  label: string;
}

type CodeGroup =
  | 'CROP_TYPE' | 'CROP_CONDITION' | 'CULTIVATOR_TYPE'
  | 'FACILITY_TYPE' | 'FACILITY_DETAIL'
  | 'FALLOW_PERIOD' | 'FALLOW_REASON' | 'NEGLECT_LEVEL'
  | 'CONVERSION_USE' | 'CONVERSION_SCALE'
  | 'PERMIT_STATUS' | 'OWNER_CONTACT' | 'SURVEYOR_OPINION';

const MASTER_CODES: Record<CodeGroup, CodeItem[]> = { ... };

function getCodesByGroup(group: CodeGroup): CodeItem[];
function getCodeLabel(group: CodeGroup, value: string): string;
```

> Web에서 `/mobile/api/survey/codes` API 추가 시 서버 조회로 전환 가능하도록
> `getCodesByGroup`을 통해 접근 (직접 참조 X)

---

## 8. 공통 컴포넌트 설계

### 8.1 BottomSheet (gorhom 대체)

```
components/BottomSheet.tsx (~250줄)

Props:
- snapPoints: number[]           # [200, '50%', '90%']
- initialSnap: number            # 초기 snap index
- onClose?: () => void
- children: ReactNode

구현:
- PanGestureHandler + useAnimatedStyle + withSpring
- 3단계 snap: peek(200) / half(50%) / full(90%)
- 배경 터치 시 닫기 (pointerEvents 제어)
- 내부 ScrollView 연동 (simultaneousGesture)
```

### 8.2 FormSelect (버튼 그리드 선택)

```
components/FormSelect.tsx

Props:
- label: string
- items: CodeItem[]
- value: string | null
- onChange: (value: string) => void
- required?: boolean
- columns?: 2 | 3          # 기본 2열, 옵션 3개 이하면 자동 3열

구현:
- 버튼 그리드로 옵션 전체 노출 (드롭다운 대신)
- 1탭으로 선택 완료 → 야외 비전문가 최적
- 선택 시 primary.50 배경 + primary.600 보더
- 옵션 3개 이하: 1행 균등 배치
- 옵션 4~7개: 2열 그리드 (마스터코드 전부 해당)
- 최소 높이 48px (touchMin)
```

### 8.3 FormYesNo

```
components/FormYesNo.tsx

Props:
- label: string
- value: boolean | null
- onChange: (value: boolean) => void
- required?: boolean

구현:
- [예] [아니오] 두 개 큰 버튼
- 선택 시 색상 변경 (primary)
- null = 미선택 (둘 다 비활성)
```

### 8.4 PhotoCapture

```
components/PhotoCapture.tsx

Props:
- photos: PhotoEntry[]
- onCapture: (uri: string) => void
- onRemove: (index: number) => void
- maxCount?: number

구현:
- + 추가 버튼 탭 → ActionSheet 표시 (카메라/앨범 선택)
- 카메라 촬영 (expo-camera) + 갤러리 선택 (expo-image-picker)
- 썸네일 그리드 (100x100) + 삭제 버튼 + 유형 라벨
- GPS 좌표 + 타임스탬프 자동 기록 (expo-location)
- 필수 사진 체크 표시 (OVERVIEW + CLOSEUP)
```

### 8.5 ActionSheet

```
components/ActionSheet.tsx

Props:
- visible: boolean
- title?: string              # "사진 유형: 근경 (필수)"
- options: { label: string, icon?: string, onPress: () => void }[]
- onCancel: () => void

구현:
- iOS 스타일 바텀 액션시트
- 옵션 그룹 + 분리된 취소 버튼
- 배경 딤 + 터치 닫기
- 각 옵션 56px 높이 (터치 영역)
```

### 8.6 SearchBar

```
components/SearchBar.tsx

Props:
- value: string
- onChangeText: (text: string) => void
- placeholder?: string        # "주소로 검색"
- onClear: () => void

구현:
- pill 형태 (radius 20px)
- 홈 탭: gray.100 배경, 인라인 배치
- 지도 탭: white 배경, shadow.md, 상단 플로팅
- 포커스 시: primary 보더, 클리어(X) 버튼 표시
- 할당 목록 address 필드 클라이언트 필터 (API 호출 없음)
```

### 8.7 ValidationModal

```
components/ValidationModal.tsx

Props:
- visible: boolean
- warnings: ValidationWarning[]
- onDismiss: () => void          # "돌아가서 수정"
- onSubmitAnyway: () => void     # "무시하고 제출"

구현:
- 중앙 모달 (배경 딤)
- 경고 항목 리스트 (아이콘 + 제목 + 설명)
- 하단 안내: "경고를 무시하고 제출할 수 있지만, 검수 시 관리자에게 표시됩니다"
- 2버튼: 돌아가서 수정 / 무시하고 제출
- 필수 항목 미입력(차단) 시에는 "제출" 버튼 비활성
```

---

## 9. 테마 설계

NativeBase `extendTheme` 제거 → 순수 StyleSheet 기반.

### lib/config.ts 내 또는 별도 theme.ts

```typescript
export const colors = {
  primary: '#228be6',
  primaryLight: '#e7f5ff',
  background: '#ffffff',
  surface: '#f8f9fa',
  text: '#1a1d1e',
  textSecondary: '#868e96',
  border: '#dee2e6',
  error: '#fa5252',
  warning: '#fd7e14',
  success: '#40c057',

  // 필지 상태 색상 (할당 목록 + 지도 마커)
  parcel: {
    unsurveyed: '#fa5252',   // 빨강 — 미조사
    inProgress: '#fcc419',   // 노랑 — 진행중
    completed: '#40c057',    // 초록 — 완료
    rejected: '#fd7e14',     // 주황 — 반려
  },

  // 제출 상태 색상 (제출 현황)
  result: {
    submitted: '#228be6',    // 파랑 — 제출완료
    reviewing: '#7048e8',    // 보라 — 검수중
    approved: '#2b8a3e',     // 초록 — 승인
  },
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
};

export const fontSize = {
  sm: 13, md: 15, lg: 17, xl: 20, xxl: 24,
};
```

---

## 10. 레거시 마이그레이션 계획

### Phase 0에서 처리

| 레거시 | 대체 | 처리 |
|--------|------|------|
| `native-base` (40+ imports) | RN 기본 + StyleSheet | 패키지 제거, import 전부 교체 |
| `react-native-paper` (3 imports) | RN 기본 | 패키지 제거 |
| `@gorhom/bottom-sheet` (8 imports) | `components/BottomSheet.tsx` | 패키지 제거 |
| `react-native-immersive` | 없음 (미사용) | 패키지 제거 |
| `react-native-fs` | expo-file-system | 패키지 제거 |
| `react-native-permissions` | expo-* 권한 | 패키지 제거 |
| `install` | 없음 | 패키지 제거 |
| `react-native-version-check` | expo-constants | 패키지 제거 |
| `react-native-image-zoom-viewer` | expo-image 또는 직접 구현 | 패키지 제거 |

### GIS 코드 마이그레이션

| 소스 (`src/map/`) | 대상 (`lib/map/`) | 비고 |
|-------------------|-------------------|------|
| `hooks/useUserTracking.ts` | `hooks/useUserTracking.ts` | Kalman 필터 그대로 유지, store import 경로만 변경 |
| `components/VWorldLayers.tsx` | `layers/VWorldLayers.tsx` | NativeBase 의존 없으면 그대로 |
| `components/GeoserverLayers.tsx` | `layers/GeoserverLayers.tsx` | 동일 |
| `modules/gis/transform.ts` | `utils/transform.ts` | 그대로 |
| `modules/parcel/BoundaryRenderer.ts` | `layers/ParcelLayer.tsx` | 상태별 색상 추가 |
| `components/MapLayers.tsx` | re-export 유지 | index.ts로 대체 |

### 레거시 코드 제거 (마이그레이션 완료 후)

| 제거 대상 | 이유 |
|----------|------|
| `app/js/login.js` | farmfield session 인증 → JWT로 대체 |
| `app/js/config.js` | farmfield.kr URL → agmap 서버로 대체 |
| `app/js/common.js` | 범용 유틸 → lib/api/client.ts로 대체 |
| `app/js/theme.js` | NativeBase 의존 |
| `app/js/networkCheck.js` | lib/api/client.ts에서 처리 |
| `app/theme/theme.ts` | NativeBase extendTheme → 순수 theme |
| `app/refContext.tsx` | 새 구조에서 불필요 |
| `app/map/inspect/` (전체) | farmfield 조사 UI → 새 조사 위저드로 대체 |
| `app/map/search/` | farmfield 검색 |
| `app/map/setting/` | farmfield 설정 |
| `store/inspectStore.ts` | farmfield API 구조 |
| `store/inspectInputStore.ts` | farmfield 폼 |
| `store/codeStore.ts` | farmfield 코드 |
| `store/bottomStore.ts` | gorhom 연동 |
| `store/arStore.ts` | AR 기능 (agmap 불필요) |
| `store/shelterStore.ts` | farmfield 시설물 |
| `store/optionStore.ts` | farmfield 옵션 |
| `store/searchStore.ts` | farmfield 검색 |

**유지**:
- `store/mapStateStore.ts` → `lib/store/mapState.ts`로 이동
- `store/permissionStore.ts` → `lib/store/permission.ts`로 이동
- `store/appStatus.ts` → `lib/store/appStatus.ts`로 이동 (insets 등)

---

## 11. 목업 참조 가이드

> **구현 시 반드시 해당 목업 파일을 읽고 UI를 맞출 것.**
> 경로: `docs/02-design/mockup/`
> 인덱스: `mockup/index.html` (브라우저에서 전체 목록 확인)

### 11.1 컴포넌트 → 목업 매핑

| RN 컴포넌트 | 목업 파일 | 줄수 |
|-------------|----------|------|
| `components/FormSelect.tsx` | `mockup/components/form-select.html` | ~30 |
| `components/FormYesNo.tsx` | `mockup/components/form-yesno.html` | ~15 |
| `components/FormTextInput.tsx` | `mockup/components/form-input.html` | ~30 |
| `components/FormNumberInput.tsx` | `mockup/components/form-input.html` | (동일) |
| `components/FormSection.tsx` | `mockup/components/form-section.html` | ~15 |
| `components/StatusBadge.tsx` | `mockup/components/badges.html` | ~15 |
| `components/BottomSheet.tsx` | `mockup/components/bottom-sheet.html` | ~30 |
| `components/ActionSheet.tsx` | `mockup/components/action-sheet.html` | ~20 |
| `components/SearchBar.tsx` | `mockup/components/search-bar.html` | ~25 |
| `components/PhotoCapture.tsx` | `mockup/components/photo-capture.html` | ~25 |
| `components/ValidationModal.tsx` | `mockup/components/validation-modal.html` | ~25 |
| `components/EmptyState.tsx` | `mockup/components/empty-state.html` | ~10 |
| `components/LoadingOverlay.tsx` | `mockup/components/loading.html` | ~10 |

### 11.2 화면 → 목업 매핑

| RN 화면 | 목업 파일 |
|---------|----------|
| `app/login.tsx` | `mockup/screens/login.html` |
| `app/(tabs)/index.tsx` (할당) | `mockup/screens/home.html` |
| `app/(tabs)/index.tsx` (제출) | `mockup/screens/home-submitted.html` |
| `app/(tabs)/map.tsx` | `mockup/screens/map-peek.html` |
| `app/(tabs)/profile.tsx` | `mockup/screens/profile.html` |
| `StepInfo` | `mockup/screens/survey-step1.html` |
| `StepCultivation` | `mockup/screens/survey-step2.html` |
| `StepFallow` | `mockup/screens/survey-step3.html` |
| `StepFacility` | `mockup/screens/survey-step4.html` |
| `StepConversion` | `mockup/screens/survey-step5.html` |
| `StepOpinion` | `mockup/screens/survey-step6.html` |
| `StepPhotos` | `mockup/screens/survey-step7.html` |
| `StepConfirm` | `mockup/screens/survey-confirm.html` |
| 레이어 시트 | `mockup/components/layer-sheet.html` |

### 11.3 사용 방법

```
구현 시:
1. base.css 읽기 → 디자인 토큰 (CSS 변수 = RN theme.ts 토큰)
2. 해당 컴포넌트 mockup HTML 읽기 → 구조 + 스타일 확인
3. 해당 화면 mockup HTML 읽기 → 레이아웃 + 배치 확인
4. design-system.md 해당 섹션 → 상세 스펙 (크기, 간격, 인터랙션)
```

---

## 12. Implementation Guide

### 12.1 구현 순서

| # | 모듈 | 파일 | 의존 |
|---|------|------|------|
| 1 | 패키지 제거 + config | package.json, lib/config.ts | — |
| 2 | API 클라이언트 | lib/api/client.ts, types.ts | config |
| 3 | 인증 | lib/api/auth.ts, lib/store/auth.ts | api client |
| 4 | 루트 라우팅 | app/_layout.tsx, app/index.tsx, app/login.tsx | auth store |
| 5 | 탭 레이아웃 | app/(tabs)/_layout.tsx | 라우팅 |
| 6 | 할당 목록 | lib/api/survey.ts, lib/store/assignments.ts | api client |
| 7 | 홈 탭 | app/(tabs)/index.tsx | assignments store |
| 8 | 마스터코드 + 타입 | lib/survey/codes.ts, types.ts | — |
| 9 | 폼 컴포넌트 | components/Form*.tsx, FormSelect, FormYesNo | codes |
| 10 | 폼 상태 | lib/store/surveyForm.ts | survey types |
| 11 | 위저드 화면 | app/(tabs)/survey/[id].tsx, Step*.tsx | form store + components |
| 12 | 사진 촬영 | components/PhotoCapture.tsx | expo-camera/image-picker |
| 13 | 검증 | lib/survey/validation.ts | form types |
| 14 | 제출/임시저장 | lib/api/survey.ts 연동 | validation + api |
| 15 | 반려/재조사 | lib/api/survey.ts getRejected, resubmit | assignments |
| 16 | 지도 마이그레이션 | lib/map/* | src/map → lib/map |
| 17 | 지도 탭 | app/(tabs)/map.tsx | lib/map + assignments |
| 18 | 내정보 탭 | app/(tabs)/profile.tsx | auth store |
| 19 | 레거시 제거 | app/js/, app/map/inspect/, store/* | 전체 완료 후 |

### 12.2 Module Map

| Module | 범위 | Session 예상 |
|--------|------|-------------|
| **module-1** | #1~4 (스택정비 + config + API + 인증 + 라우팅) | 1 session |
| **module-2** | #5~7 (탭 레이아웃 + 할당 목록 + 홈 탭) | 1 session |
| **module-3** | #8~14 (마스터코드 + 폼 컴포넌트 + 위저드 + 사진 + 검증 + 제출) | 2 session |
| **module-4** | #15~17 (반려/재조사 + 지도 마이그레이션 + 지도 탭) | 1 session |
| **module-5** | #18~19 (내정보 + 레거시 제거) | 1 session |

### 12.3 Session Guide

```
Session 1: module-1 (기반 구축)
  - 패키지 8개 제거
  - lib/config.ts + lib/api/client.ts + lib/api/auth.ts
  - lib/store/auth.ts
  - app/_layout.tsx 리팩터 + app/login.tsx + app/index.tsx
  - 검증: surveyor01 로그인 → 토큰 저장 확인

Session 2: module-2 (홈 탭)
  - app/(tabs)/_layout.tsx (4탭)
  - lib/api/survey.ts (getMyAssignments, getRejected)
  - lib/store/assignments.ts
  - app/(tabs)/index.tsx (할당 목록 + 진행률 + 반려 배너)
  - 검증: 로그인 후 홈 탭에 할당 목록 표시

Session 3: module-3a (폼 기반)
  - lib/survey/codes.ts + types.ts
  - components/FormSelect, FormYesNo, FormSection, FormTextInput, FormNumberInput
  - lib/store/surveyForm.ts
  - app/(tabs)/survey/[id].tsx + WizardHeader/Footer
  - StepInfo, StepCultivation, StepFallow

Session 4: module-3b (폼 완성 + 제출)
  - StepFacility, StepConversion, StepOpinion
  - StepPhotos + components/PhotoCapture.tsx
  - StepConfirm (요약 화면)
  - lib/survey/validation.ts
  - 제출/임시저장 연동
  - 검증: 전체 위저드 완주 + 제출

Session 5: module-4 (지도 + 반려)
  - lib/map/ 마이그레이션
  - app/(tabs)/map.tsx (필지 상태 색상 + GPS)
  - 반려 목록 + 재조사 제출

Session 6: module-5 (마무리)
  - app/(tabs)/profile.tsx
  - 레거시 코드 전체 제거
  - 최종 검증
```
