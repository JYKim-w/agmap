# Field Survey Offline — Design (Option C: Pragmatic)

> 작성일: 2026-04-05
> 선택 설계안: C (Pragmatic) — 큐 로직 독립 모듈 + UI 기존 코드 통합

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 농촌/산간 현장에서 일시적 통신 불가 시 제출 실패 → 재작업 부담 |
| **WHO** | 현장 조사원 5,000명 (농촌 환경) |
| **RISK** | AsyncStorage 용량 한계, 사진 파일 대용량, 동기화 충돌 |
| **SUCCESS** | 네트워크 끊김 상태에서 조사 완료 → 복귀 시 자동 제출 → 데이터 유실 0건 |
| **SCOPE** | 제출 큐 + 사진 큐 + 네트워크 감지 + 오프라인 배너 + 할당 캐시 |

---

## 1. 폴더 구조

```
lib/offline/
├── networkStatus.ts      # NetInfo 기반 네트워크 상태 (zustand store)
├── submitQueue.ts        # 제출 큐 관리 (AsyncStorage 영속화)
└── index.ts              # re-export

components/
└── OfflineBanner.tsx     # 오프라인 상태 배너 + 동기화 대기 건수

수정 대상:
├── components/survey/SurveyWizard.tsx   # 제출 → 큐 연동
├── lib/store/assignments.ts            # API 응답 캐시
└── app/(tabs)/index.tsx                # 동기화 대기 UI
└── app/_layout.tsx                     # 큐 자동 처리 시작
```

---

## 2. networkStatus.ts

```typescript
// zustand store — 네트워크 상태 관리
interface NetworkState {
  isConnected: boolean;
  /** 마지막 연결 확인 시각 */
  lastCheckedAt: number;
  /** NetInfo 리스너 시작 */
  startListening: () => () => void;
}
```

**동작:**
- `@react-native-community/netinfo`의 `addEventListener`로 상태 변경 감지
- `isConnected` 변경 시 → `submitQueue.processQueue()` 트리거
- `_layout.tsx`에서 앱 시작 시 `startListening()` 호출

---

## 3. submitQueue.ts

```typescript
interface QueueItem {
  id: string;              // UUID
  assignmentId: number;
  body: SurveyResultInput;
  photos: PhotoEntry[];    // 로컬 파일 URI
  createdAt: number;
  retryCount: number;
  status: 'pending' | 'uploading' | 'failed';
}

interface SubmitQueueState {
  queue: QueueItem[];
  isProcessing: boolean;

  /** 큐에 추가 (오프라인 제출) */
  enqueue: (assignmentId: number, body: SurveyResultInput, photos: PhotoEntry[]) => Promise<void>;
  /** 큐 순차 처리 (온라인 복귀 시) */
  processQueue: () => Promise<void>;
  /** 큐 항목 제거 */
  dequeue: (id: string) => Promise<void>;
  /** AsyncStorage에서 큐 복원 */
  loadQueue: () => Promise<void>;
}
```

**큐 처리 흐름:**
```
enqueue(body, photos)
  → AsyncStorage에 저장 ('submit_queue')
  → isConnected 확인
    → true → processQueue() 즉시 실행
    → false → 대기 (네트워크 복귀 이벤트가 트리거)

processQueue()
  → queue에서 pending 항목 순차 처리
  → submitResult(body) 호출
    → 성공 → 사진 업로드 → dequeue
    → 실패 → retryCount++ → 5회 초과 시 'failed' 상태
  → Toast "N건 동기화 완료" 또는 "N건 실패"
```

**재시도 정책:**
- 간격: 즉시 → 5초 → 15초 → 30초 → 60초 (지수 백오프)
- 최대: 5회
- 5회 실패 → `failed` 상태, 사용자 수동 재시도 가능

---

## 4. OfflineBanner.tsx

```
┌─────────────────────────────────────────────┐
│ ⚡ 오프라인 — 데이터는 자동 저장됩니다       │
└─────────────────────────────────────────────┘
```

- `networkStatus.isConnected === false` 일 때 화면 상단에 표시
- 배경: `warning-light` (#fff4e6), 텍스트: gray-800
- 동기화 대기 건수 있으면: "⚡ 오프라인 — 동기화 대기 N건"
- `_layout.tsx`에서 전역 렌더링 (모든 화면에서 보임)

---

## 5. SurveyWizard 연동

현재:
```
handleSubmit → submitResult(body) → 성공 → 사진 업로드 → 완료
                                  → 실패 → Toast 에러
```

변경:
```
handleSubmit → isConnected 확인
  → true → submitResult(body) → 성공 → 사진 업로드 → 완료
                                → 실패 → enqueue(body, photos) → Toast "오프라인 저장"
  → false → enqueue(body, photos) → Toast "오프라인 저장됨. 복귀 시 자동 제출"
```

---

## 6. 할당 목록 캐시

`lib/store/assignments.ts` 수정:

```
fetchMyAssignments()
  → API 호출 성공 → state 업데이트 + AsyncStorage 캐시 ('assignments_cache')
  → API 호출 실패 (네트워크) → AsyncStorage에서 캐시 로드 → state 업데이트
```

- 캐시 키: `assignments_cache`, `rejected_cache`
- 온라인 복귀 시 자동 갱신

---

## 7. 홈 탭 동기화 표시

`app/(tabs)/index.tsx` 수정:

- ProgressCard 위에 동기화 대기 건수 표시
- `submitQueue.queue.length > 0` 일 때:
  ```
  ┌─────────────────────────────────────┐
  │ 🔄 동기화 대기 2건                    │
  └─────────────────────────────────────┘
  ```
- 탭 시 수동 재시도 가능

---

## 8. 구현 순서

| # | 작업 | 파일 | 의존 |
|---|------|------|------|
| 1 | 네트워크 상태 store | `lib/offline/networkStatus.ts` | — |
| 2 | 제출 큐 store | `lib/offline/submitQueue.ts` | #1 |
| 3 | 오프라인 배너 | `components/OfflineBanner.tsx` | #1 |
| 4 | _layout에 리스너 + 배너 | `app/_layout.tsx` 수정 | #1, #3 |
| 5 | 위저드 제출 연동 | `SurveyWizard.tsx` 수정 | #2 |
| 6 | 할당 목록 캐시 | `lib/store/assignments.ts` 수정 | #1 |
| 7 | 홈 탭 동기화 표시 | `app/(tabs)/index.tsx` 수정 | #2 |

### Module Map

| Module | 범위 | 예상 |
|--------|------|------|
| **module-1** | #1~4 (네트워크 + 큐 + 배너 + 리스너) | 30분 |
| **module-2** | #5~7 (위저드 연동 + 캐시 + UI) | 30분 |

### Session Guide

```
Session 1: module-1 + module-2 (전체 1 session)
  - lib/offline/ 모듈 생성
  - OfflineBanner 컴포넌트
  - SurveyWizard 제출 로직 변경
  - assignments 캐시
  - 검증: 비행기 모드에서 제출 → 큐 저장 → WiFi 켬 → 자동 동기화
```
