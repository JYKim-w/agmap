# home-survey-ux Design Document

> **Summary**: 홈 탭 대시보드화 + 조사 탭 작업 목록 통합 + 조사↔지도 인터랙션 (Option C)
>
> **Project**: agmap-mobile
> **Author**: JY Kim
> **Date**: 2026-04-22
> **Status**: Draft
> **Planning Doc**: [home-survey-ux.plan.md](../../01-plan/features/home-survey-ux.plan.md)

### Pipeline References

| Phase | Document | Status |
|-------|----------|--------|
| Mockup | [survey-map-interaction.html](../mockup/screens/survey-map-interaction.html) | ✅ |
| API Spec | 서버 API v1.3 기본 + 공지사항 v1.4 변경 반영 | ✅ |
| Notice Design | [Web: notice.design.md](../../../../Web/agmap/docs/02-design/features/notice.design.md) | ✅ |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 홈·조사 탭 기능 중복으로 조사원 혼란. 역할 단일화로 명확한 워크플로우 구축. |
| **WHO** | 현장 조사원 (모바일 앱 주 사용자). 빠른 업무 처리가 목표. |
| **RISK** | 홈 목록 제거 시 습관적 사용자 혼란 → CTA 버튼 제공. 조사↔지도 연동 복잡도. |
| **SUCCESS** | 홈에 FlatList 없음, 조사 탭 세그먼트 2개, 지도 탭 하단 시트 존재, 카드→지도 탭 전환 동작 |
| **SCOPE** | `index.tsx`, `survey.tsx`, `app/map/index.tsx`, `assignments.ts` 수정 + 컴포넌트 3개 신규 |

---

## 1. Overview

### 1.1 Design Goals

- 홈 탭: Read-only 대시보드 (KPI + 공지 배너 + CTA). 액션 없음.
- 조사 탭: 세그먼트(미완료/제출현황) + 검색 + 카드 지도 버튼.
- 지도 탭: 기존 기능 유지 + AssignmentSheet 오버레이 추가.
- 탭 간 공유 상태: `selectedAssignmentId` (Zustand assignments store 확장).

### 1.2 Design Principles

- **Single Responsibility**: 탭별 역할 1개. 홈=현황, 조사=실행, 지도=공간.
- **Reuse over Duplicate**: DDayBadge, AssignmentCard를 컴포넌트로 추출해 조사/지도 공유.
- **Reuse over Build**: 하단 시트는 기존 `components/BottomSheet.tsx` 활용 (gorhom 호환 커스텀 구현).

---

## 2. Architecture

### 2.0 Architecture Comparison

| 기준 | A: Minimal | B: Clean | **C: Pragmatic (선택)** |
|------|:---------:|:--------:|:---------------------:|
| 신규 파일 | 0 | 8 | **3** |
| 수정 파일 | 2 | 6 | **4** |
| 복잡도 | 낮음 | 높음 | **중간** |
| 유지보수 | 낮음 | 높음 | **높음** |

**Selected**: Option C — 재사용 컴포넌트만 추출, 기존 store 확장, 과설계 없음.

### 2.1 컴포넌트 구조

```
app/(tabs)/
├── index.tsx          (수정) 홈: KPI + 공지 배너 + CTA. FlatList 제거.
├── survey.tsx         (수정) 조사: 세그먼트 탭 + 검색 + AssignmentCard
└── map.tsx            (수정) 지도: re-export 유지 → map/index.tsx 수정

app/map/index.tsx      (수정) AssignmentSheet 추가

components/survey/
├── AssignmentCard.tsx (신규) 조사 탭 + 지도 시트 공용 카드
└── DDayBadge.tsx      (신규) D-day 배지 (기존 index.tsx에서 추출)

components/map/
└── AssignmentSheet.tsx (신규) BottomSheet 래퍼 — 배정 목록 카드 수평 스크롤

lib/store/assignments.ts (수정) selectedAssignmentId 필드 + setSelectedAssignment 액션
```

### 2.2 데이터 흐름

```
조사 탭
  [AssignmentCard] → [지도 버튼 탭]
    → setSelectedAssignment(id)   (Zustand)
    → router.push('/(tabs)/map')  (탭 전환)

지도 탭 진입
  → useAssignmentStore(s => s.selectedAssignmentId)
  → cameraRef.flyTo(lon, lat)    (해당 필지 포커스)
  → AssignmentSheet에서 해당 카드 하이라이트

지도 핀/폴리곤 탭
  → setSelectedAssignment(id)    (Zustand)
  → AssignmentSheet 스크롤/하이라이트
```

### 2.3 의존성

| 컴포넌트 | 의존 | 목적 |
|---------|------|------|
| AssignmentCard | StatusBadge, DDayBadge | 상태 배지 표시 |
| AssignmentSheet | AssignmentCard, useAssignmentStore | 지도 위 목록 |
| survey.tsx | AssignmentCard, useAssignmentStore | 미완료/제출현황 |
| app/map/index.tsx | AssignmentSheet, useAssignmentStore | 카메라 연동 |

---

## 3. 상태 모델

### 3.1 AssignmentState 확장 (assignments.ts)

```typescript
interface AssignmentState {
  // 기존 필드 유지
  assignments: Assignment[];
  rejected: Assignment[];
  isLoading: boolean;
  searchQuery: string;

  // 신규: 탭 간 공유 선택 상태
  selectedAssignmentId: number | null;

  // 신규 액션
  setSelectedAssignment: (id: number | null) => void;
}
```

### 3.2 조사 탭 로컬 상태

```typescript
// survey.tsx 내부 useState
type SurveyTab = 'todo' | 'submitted';
const [activeTab, setActiveTab] = useState<SurveyTab>('todo');
const [searchQuery, setSearchQuery] = useState('');
```

---

## 4. API

### 4.1 기존 엔드포인트 (변경 없음)

- `GET /mobile/api/survey/my-assignments` → `useAssignmentStore`
- `GET /mobile/api/survey/rejected` → `useAssignmentStore`

### 4.2 공지사항 API — v1.4 Breaking Change (Web 구현 완료)

Ref: `Web/agmap/docs/mobile-api-spec.md` §2.10, §2.10.1

#### M10 `GET /mobile/api/survey/notices?page=1&size=20`

응답 포맷이 **v1.3 배열 → v1.4 페이지네이션 객체**로 변경. 정렬: `pinned DESC, createdAt DESC`.

```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 31,
        "scope": "GLOBAL",
        "title": "4월 현장조사 일정 공지",
        "content": "# 안내\n본문 Markdown...",
        "noticeType": "GENERAL",
        "pinned": true,
        "authorId": 12,
        "authorName": "홍길동",
        "ownerManagerId": null,
        "createdAt": "2026-04-15T09:00:00",
        "updatedAt": "2026-04-15T09:00:00"
      }
    ],
    "totalCount": 42,
    "page": 1,
    "size": 20,
    "totalPages": 3
  }
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | Long | 공지 ID (**v1.3 `noticeId`에서 변경**) |
| `scope` | String | `GLOBAL` (ADMIN 전체) / `MANAGER` (소속 매니저 공지) |
| `noticeType` | String | `GENERAL` / `URGENT` / `GUIDE` |
| `content` | String | Markdown 원문 |
| `authorId` | Long | 작성자 user_id |
| `authorName` | String | 작성자 표시명 |
| `ownerManagerId` | Long? | MANAGER scope 시 매니저 ID, GLOBAL은 null |

**scope 가시성**: 서버가 자동 필터링 (GLOBAL 전체 + 본인 담당 MANAGER 공지만). 클라이언트는 `scope` 기준 섹션 분리 렌더 권장.

#### M15 `GET /mobile/api/survey/notices/{noticeId}` — 신규 (v1.4)

단건 상세 조회. 응답 구조는 목록 아이템과 동일.

**에러 처리**:
- 미존재 or 비가시성 → `404 NOTICE_001` (존재 은닉, 403 아님)
- `noticeId`가 숫자가 아닌 경우 → Spring 500 → **클라이언트에서 `Number.isNaN(id)` 검증 후 호출 필수**

### 4.3 모바일 코드 업데이트 필요 항목

| 파일 | 현재 | 변경 |
|------|------|------|
| `lib/api/types.ts` — `Notice` | `noticeId, title, content, noticeType, pinned, createdAt` | `id`로 rename, `authorId`·`authorName`·`ownerManagerId`·`updatedAt`·`scope` 추가, `noticeId` 제거 |
| `lib/api/types.ts` — `NoticePageResponse` | 없음 | 신규: `{ list, totalCount, page, size, totalPages }` |
| `lib/api/survey.ts` — `getNotices()` | 반환 `Notice[]` | 반환 `NoticePageResponse` |
| `lib/api/survey.ts` — `getNoticeDetail(id)` | 없음 | 신규: `GET /notices/{noticeId}` (호출 전 `Number.isNaN` 체크) |
| `lib/store/notices.ts` | `notices: Notice[]` 단순 배열 | `notices`, `totalCount`, `page`, `hasMore`, `fetchMore()` 추가 |

---

## 5. UI/UX 설계

### 5.1 홈 탭 (index.tsx)

```
┌─────────────────────────────────┐
│  헤더: "홈"                      │
│  SyncPendingBanner (조건부)      │
│  ─────────────────────────────  │
│  [반려 알림 배너] (반려 N건 존재시) │
│  [핀고정 공지 배너] (pinned 있을때) │
│  ─────────────────────────────  │
│  AssignStatusKpi                 │
│    배정/진행중/완료/반려 + 완료율  │
│  ─────────────────────────────  │
│  이번주 실적 위젯               │
│  ─────────────────────────────  │
│  [조사 시작하기 CTA 버튼]        │
└─────────────────────────────────┘
```

**제거**: FlatList(할당목록), 검색바, 세그먼트 탭 (미완료/제출현황)

**공지 배너 상세**:
- `pinned=true` 공지 중 최신 1건 표시 (`noticeType` 색상 분기)
  - URGENT: 빨간 배경 (`#fff5f5` / `#fa5252`)
  - GENERAL/GUIDE: 파란 배경 (`#e7f5ff` / `#228be6`)
- 탭 시 → `/notice/[id]` 공지 상세 화면으로 이동 (이동 전 `Number.isNaN(id)` 검증)

### 5.2 조사 탭 (survey.tsx)

```
┌─────────────────────────────────┐
│  헤더: "조사"                    │
│  ─────────────────────────────  │
│  [검색바] 주소 검색               │
│  ─────────────────────────────  │
│  [미완료 N] [제출현황 N]  ← 세그먼트 │
│  ─────────────────────────────  │
│  AssignmentCard (목록)           │
│   - assignStatus 배지           │
│   - 우선순위 배지                │
│   - D-day 배지                  │
│   - 주소, riskGrade, PNU        │
│   - [🗺 지도] 버튼              │
│                                  │
│  (미완료 0건 시 empty state)     │
└─────────────────────────────────┘
```

**제출현황 탭** (`resultStatus` != DRAFT):
- 상단 요약 카운트: SUBMITTED / UNDER_REVIEW / APPROVED / REJECTED
- 반려 카드: 반려 사유 + "재조사 시작" 버튼

### 5.3 내정보 탭 — 공지사항 섹션 (신규)

```
┌─────────────────────────────────┐
│  내정보 탭                       │
│  ...프로필/비밀번호 섹션...        │
│  ─────────────────────────────  │
│  공지사항                         │
│  ┌────────────────────────────┐ │
│  │ [URGENT] 현장 주의사항      │ │  ← 핀고정 배지
│  │ 홍길동 · 2026-04-22        │ │
│  ├────────────────────────────┤ │
│  │ [GENERAL] 조사 매뉴얼 v3   │ │
│  │ ...                       │ │
│  └────────────────────────────┘ │
│  [더 불러오기] (페이지네이션)      │
└─────────────────────────────────┘
```

탭 시 → `/notice/[id]` 상세 화면으로 이동.

**내정보 탭 공지 목록 — scope 기반 섹션 분리 렌더 (v1.4.1 권장)**:
```
📢 전체 공지 (GLOBAL)          👤 매니저 공지 (MANAGER)
─────────────────────────      ──────────────────────────
[URGENT] 4월 주의사항           [GENERAL] 담당구역 안내
[GENERAL] 조사 매뉴얼 v3
```

**신규 화면**: `app/notice/[id].tsx`

```
┌─────────────────────────────────┐
│  ← 공지 제목                     │
│  ─────────────────────────────  │
│  [URGENT] · 📌 핀고정  · GLOBAL │
│  홍길동 · 2026-04-22            │
│  ─────────────────────────────  │
│  Markdown 렌더링 (content)      │
│  (ScrollView)                   │
└─────────────────────────────────┘
```

Markdown 렌더링: `react-native-marked` 또는 `marked` + sanitize (웹 레퍼런스: `marked`+`DOMPurify`).

### 5.4 지도 탭 (AssignmentSheet)

```
┌─────────────────────────────────┐
│  [지도 영역]                     │
│                                  │
│  ╔═══════════════════════════╗  │
│  ║ ▲  배정 목록 (3건)         ║  │  ← 기본: 미니 높이 (약 140pt)
│  ║ [●카드1] [카드2] [카드3]   ║  │     스와이프 업: 전체 높이
│  ║  선택된 카드 → 하이라이트  ║  │
│  ╚═══════════════════════════╝  │
└─────────────────────────────────┘
```

- **구현**: 기존 `components/BottomSheet.tsx` 사용 (Reanimated + RNGH 기반)
- `snapPoints={[140, '50%']}` — index 0: 축소, index 1: 확장
- `BottomSheetScrollView horizontal` — 카드 가로 스크롤 (index=0 시)
- `BottomSheetFlatList` — 확장 시 세로 전체 목록
- `sheetRef.snapToIndex(0)` — 지도 탭 진입 시 기본 축소 상태
- `enablePanDownToClose={false}` — 항상 표시 (닫기 불가)

### 5.4 Page UI Checklist

#### 홈 탭 (index.tsx)

- [ ] Banner: 반려 알림 배너 (`rejected.length > 0` 조건부, 탭 시 조사 탭 이동)
- [ ] Banner: 핀고정 공지 배너 (`notices.pinned=true` 최신 1건 조건부, noticeType별 색상 분기)
- [ ] KPI Card: AssignStatusKpi (배정/진행중/완료/반려 숫자 + 완료율)
- [ ] KPI Card: 진행률 프로그레스 바
- [ ] Widget: 이번주 실적 (완료 N / 전체 N)
- [ ] Button: "조사 시작하기" CTA (탭 시 조사 탭 전환)
- [ ] Banner: SyncPendingBanner (동기화 대기 건수 조건부)
- [ ] 검증: FlatList 없음 (할당 목록 제거 확인)

#### 조사 탭 (survey.tsx)

- [ ] SearchBar: 주소 검색 입력 (실시간 필터링)
- [ ] SegmentControl: "미완료" 탭 (카운트 배지 포함)
- [ ] SegmentControl: "제출현황" 탭 (카운트 배지 포함)
- [ ] AssignmentCard: assignStatus 배지 (ASSIGNED/IN_PROGRESS/RETURNED)
- [ ] AssignmentCard: 우선순위 배지 (1=긴급/2=보통/3=낮음)
- [ ] AssignmentCard: DDayBadge (D+N=빨강, D-day=빨강, D-3이내=주황, 이후=회색)
- [ ] AssignmentCard: 지도 버튼 (탭 시 지도 탭 전환 + 필지 포커스)
- [ ] AssignmentCard: 전체 주소 + riskGrade + PNU (뒤 9자)
- [ ] 제출현황 탭: 상단 요약 카운트 (SUBMITTED/UNDER_REVIEW/APPROVED/REJECTED)
- [ ] 제출현황 탭: 반려 카드에 반려 사유 박스
- [ ] 제출현황 탭: 반려 카드에 "재조사 시작" 버튼
- [ ] Empty State: 미완료 0건 시 "모든 조사 완료" 메시지

#### 내정보 탭 — 공지사항 섹션

- [ ] Section: GLOBAL 섹션 + MANAGER 섹션 분리 렌더 (`scope` 기준)
- [ ] List: 공지 카드 — noticeType 배지, pinned 배지, authorName, createdAt
- [ ] Pagination: "더 불러오기" (`hasMore` 조건부)
- [ ] 탭: 공지 카드 → `Number.isNaN(id)` 검증 후 `/notice/[id]` 이동

#### 공지 상세 (`app/notice/[id].tsx`)

- [ ] Header: 공지 제목 + 뒤로가기
- [ ] Meta: noticeType 배지, pinned 배지, scope 표시, authorName, createdAt
- [ ] Content: Markdown 렌더링 (`content` 필드, react-native-marked)
- [ ] Error: 404 NOTICE_001 → "공지를 찾을 수 없습니다" 화면

#### 지도 탭 AssignmentSheet

- [ ] Sheet: 항상 표시 (지도 화면 위 오버레이)
- [ ] Sheet: 미니/확장 스냅 포인트 (스와이프 제스처)
- [ ] Sheet: 가로 스크롤 카드 목록
- [ ] Sheet 카드: selectedAssignmentId 일치 시 하이라이트 (파란 테두리)
- [ ] Sheet 카드 탭: 해당 필지로 카메라 flyTo

---

## 6. 에러 처리

| 상황 | 처리 |
|------|------|
| notices API 실패 | 공지 배너 미표시 (silent fail) |
| assignment 없음 | empty state 표시 |
| 지도 탭 전환 시 좌표 없음 (lat/lon null) | flyTo 스킵, 팝업 없이 탭 전환만 |

---

## 7. 보안

- 기존 JWT 인증 구조 변경 없음
- selectedAssignmentId는 읽기 전용 (UI 상태, 민감 데이터 아님)

---

## 8. 테스트 계획

### 8.1 범위

| 유형 | 대상 | 도구 |
|------|------|------|
| L2: UI | 홈 탭 FlatList 없음 확인, 조사 탭 세그먼트 전환 | 수동 |
| L2: UI | 카드 지도 버튼 → 탭 전환 + 카메라 이동 | 수동 |
| L2: UI | AssignmentSheet 스와이프 | 수동 |

### 8.2 L2 시나리오

| # | 페이지 | 액션 | 기대 결과 |
|---|--------|------|-----------|
| 1 | 홈 탭 | 화면 진입 | FlatList 없음, KPI/CTA 표시 |
| 2 | 홈 탭 | 반려 N건 배너 탭 | 조사 탭으로 이동 |
| 3 | 홈 탭 | CTA 탭 | 조사 탭으로 이동 |
| 4 | 조사 탭 | 세그먼트 "제출현황" 탭 | 목록 변경, 요약 카운트 표시 |
| 5 | 조사 탭 | 검색 "덕진" 입력 | 주소 필터링 |
| 6 | 조사 탭 | 카드 지도 버튼 탭 | 지도 탭 전환 + 필지 카메라 이동 |
| 7 | 지도 탭 | AssignmentSheet 스와이프 업 | 목록 확장 |
| 8 | 지도 탭 | Sheet 카드 탭 | 지도 카메라 해당 필지 이동 |
| 9 | 지도 탭 | 지도 핀 탭 | Sheet에서 해당 카드 하이라이트 |

---

## 9. 레이어 구조

| 컴포넌트 | 레이어 | 위치 |
|---------|--------|------|
| AssignmentCard, DDayBadge, AssignmentSheet | Presentation | `components/survey/`, `components/map/` |
| survey.tsx, index.tsx | Presentation (Screen) | `app/(tabs)/` |
| selectedAssignmentId, setSelectedAssignment | Application (State) | `lib/store/assignments.ts` |
| getMyAssignments, getRejected | Infrastructure | `lib/api/survey.ts` |

---

## 10. 코딩 컨벤션

| 항목 | 적용 |
|------|------|
| 컴포넌트 명명 | PascalCase (AssignmentCard, DDayBadge) |
| 파일 구성 | 기능별 폴더 (`components/survey/`, `components/map/`) |
| 상태 관리 | Zustand (기존 store 확장) |
| 스타일 | StyleSheet.create 인라인 (shadcn/tailwind 없음) |
| 하단 시트 | 기존 `BottomSheet` 컴포넌트 재사용 (`snapPoints`, `BottomSheetFlatList`) |

---

## 11. 구현 가이드

### 11.1 파일 구조

```
components/
├── survey/
│   ├── AssignmentCard.tsx   (신규) — index.tsx AssignmentCard + survey.tsx SurveyCard 통합
│   └── DDayBadge.tsx        (신규) — index.tsx에서 추출 (두 파일 중복 제거)
└── map/
    └── AssignmentSheet.tsx  (신규) — 기존 BottomSheet 래퍼, 배정 카드 수평 목록

app/(tabs)/
├── index.tsx                (수정) — 대시보드 전용, 인라인 AssignmentCard/DDayBadge 제거
└── survey.tsx               (수정) — 세그먼트+검색+AssignmentCard, SurveyCard 제거

app/map/index.tsx            (수정) — AssignmentSheet 추가

lib/store/assignments.ts     (수정) — selectedAssignmentId 추가
lib/store/notices.ts         (수정) — 페이지네이션 지원 (totalCount, page, hasMore)
lib/api/survey.ts            (수정) — getNotices() 반환 타입 변경, getNoticeDetail() 신규
lib/api/types.ts             (수정) — Notice 타입: authorName, scope 추가 / NoticePageResponse 추가
lib/utils/address.ts         (신규) — shortAddr() 추출 (index.tsx, survey.tsx 중복 제거)

app/notice/
└── [id].tsx                 (신규) — 공지 상세 화면 (Markdown 렌더링)
```

> **재사용 불가 컴포넌트**: `lib/map/components/SearchBar.tsx` — 지도 전용 (`statusMap`, `onSelect(pnu)` 인터페이스,
> absolute 포지션). 조사 탭용 검색바는 survey.tsx 내 인라인으로 구현 (규모 작음).

### 11.2 구현 순서

**Module 1 — 공통 기반**
1. [ ] `lib/api/types.ts` — `Notice` 타입 확장 (`authorName`, `scope`), `NoticePageResponse` 추가
2. [ ] `lib/api/survey.ts` — `getNotices()` 반환 타입 수정, `getNoticeDetail(id)` 신규
3. [ ] `lib/store/notices.ts` — 페이지네이션 상태 추가 (`totalCount`, `page`, `hasMore`, `fetchMore`)
4. [ ] `lib/utils/address.ts` — `shortAddr()` 추출
5. [ ] `DDayBadge.tsx` 추출 (index.tsx 인라인 → `components/survey/`)
6. [ ] `AssignmentCard.tsx` — `AssignmentCard` + `SurveyCard` 통합 (`components/survey/`)
7. [ ] `assignments.ts` — `selectedAssignmentId` + `setSelectedAssignment` 추가

**Module 2 — 홈·조사 탭**
8. [ ] `index.tsx` — FlatList 제거, 공지 배너(noticeType별 색상) 추가, CTA 버튼 추가
9. [ ] `survey.tsx` — 세그먼트 탭 + 검색바 인라인 + `AssignmentCard` 적용
10. [ ] `app/(tabs)/profile.tsx` — 공지사항 목록 섹션 추가 (페이지네이션)

**Module 3 — 지도 연동 + 공지 상세**
11. [ ] `AssignmentSheet.tsx` 신규 (`BottomSheet` 래핑)
12. [ ] `app/map/index.tsx` — `AssignmentSheet` 추가, `selectedAssignmentId` → `cameraRef.flyTo`
13. [ ] `app/notice/[id].tsx` 신규 — 공지 상세 화면 (Markdown 렌더링)

### 11.3 Session Guide

#### Module Map

| 모듈 | Scope Key | 설명 | 예상 턴 |
|------|-----------|------|:------:|
| 공통 기반 | `module-1` | Notice 타입/API/Store 업데이트, DDayBadge·AssignmentCard 추출, store 확장 | 20-25 |
| 홈·조사·내정보 탭 | `module-2` | index.tsx 대시보드화, survey.tsx 세그먼트, profile.tsx 공지 목록 | 25-35 |
| 지도 연동 + 공지 상세 | `module-3` | AssignmentSheet + map flyTo + notice/[id].tsx | 25-30 |

#### Recommended Session Plan

| 세션 | 단계 | Scope | 턴 |
|------|------|-------|:--:|
| Session 1 | Plan + Design | 전체 | ✅ (현재) |
| Session 2 | Do | `--scope module-1,module-2` | 40-50 |
| Session 3 | Do | `--scope module-3` | 30-35 |
| Session 4 | Check + Report | 전체 | 20-30 |

---

## Version History

| 버전 | 날짜 | 내용 | 작성자 |
|------|------|------|--------|
| 0.1 | 2026-04-22 | 초안 (Option C Pragmatic 선택) | JY Kim |
