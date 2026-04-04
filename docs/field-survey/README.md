# 현장조사 Mobile 구현 가이드

> Web 프로젝트(`/Users/dev/Desktop/Project/Web/agmap`)에서 Backend API가 완성된 상태.
> 이 문서는 Mobile 앱에서 API를 연동하여 조사원용 화면을 구현하기 위한 가이드.
>
> **최종 현행화**: 2026-04-04

---

## 이 폴더 문서 목록

| 문서 | 설명 |
|------|------|
| `README.md` | 이 파일 — 전체 개요, 구현 범위, 주의사항 |
| `auth-guide.md` | JWT 로그인 API + 토큰 관리 + 테스트 계정 |
| `mobile-api-spec.md` | Mobile API 7개 엔드포인트 상세 스펙 |
| `survey-form-spec.md` | 조사 폼 7단계 + 마스터코드 13그룹 + UX 원칙 |
| `known-gaps.md` | 설계 대비 미구현/불일치 항목 + 모바일 대응 방안 |
| `tech-stack-cleanup.md` | 기술 스택 정비 — 제거 대상 8개, 유지 스택, bottom sheet 직접 구현 방안 |

## 외부 참조 문서

| 문서 | 위치 |
|------|------|
| 서비스 설계 원본 | `docs/field-survey-service-design.md` (같은 프로젝트 내) |
| Web DB 스키마 | Web 프로젝트 `sql/20_create_survey_tables.sql` |
| Web Plan 문서 | Web 프로젝트 `docs/01-plan/features/field-survey.plan.md` |

---

## 역할 체계

> 설계 문서와 구현 간 역할 코드 불일치가 있었음. **아래가 최종 확정(구현 기준)**:

| 역할 코드 | 설명 | 사용 시스템 |
|-----------|------|-----------|
| `ADMIN` | 최종 관리자 (농어촌공사) | Web — 전체 데이터 접근, 최종 검수 |
| `MANAGER` | 중간 관리자 (지자체 담당자) | Web — 소속 지역(region_code) 데이터만 접근, 1차 검수 |
| `SURVEYOR` | 현장 조사원 (외주/알바) | **Mobile** — 본인 할당 건만 접근 |

> 설계 문서의 `SUPER_ADMIN` = 구현의 `ADMIN`, 설계의 `ADMIN` = 구현의 `MANAGER`

---

## 구현 범위

### Mobile 하단 탭 4개

```
[하단 탭]
├── 홈 (오늘의 조사)
│   ├── 오늘 할당 필지 목록 ← GET /mobile/api/survey/my-assignments?date=2026-04-04
│   ├── 진행률 (완료 N / 전체 N) ← 클라이언트에서 목록 기반 집계
│   ├── 반려 건 알림 ← GET /mobile/api/survey/rejected
│   └── 공지사항 ← ⚠️ API 미구현 (known-gaps.md 참조)
│
├── 지도 (조사 맵)
│   ├── 담당 구역 + 필지별 상태 색상
│   │   미조사(빨강) / 진행중(노랑) / 완료(초록) / 반려(주황)
│   ├── 정사영상 레이어 ← /tiles/{type}/{projectId}/{z}/{x}/{y}.png
│   ├── 필지 탭 → 조사 시작
│   └── 내 위치 추적 (GPS)
│
├── 조사 (입력 — 필지 선택 시 활성)
│   ├── 필지 기본 정보 (자동 로드) ← GET /mobile/api/survey/assignment/{id}
│   ├── 현장 확인 폼 (7단계 위저드) ← survey-form-spec.md 참조
│   ├── 사진 촬영 ← POST /mobile/api/survey/photo/upload
│   ├── 품질 검증 (클라이언트) ← 필수항목 + GPS거리 + 시간 검증
│   └── 저장/제출 ← POST /mobile/api/survey/result
│
└── 내정보
    ├── 실적/이력 ← ⚠️ my-stats API는 Phase 2 (미구현)
    ├── 오프라인 지도 관리 ← ⚠️ 미구현 (known-gaps.md 참조)
    ├── 매뉴얼 ← 정적 컨텐츠 (앱 내장)
    └── 설정
```

---

## 서버 정보

| 환경 | URL | 비고 |
|------|-----|------|
| 개발 서버 | `http://112.218.160.197:8080` | |
| 로그인 | `POST /auth/api/login` | JWT 발급 |
| Mobile API | `/mobile/api/survey/*` | `Bearer {accessToken}` 필수 |
| 마스터코드 | `GET /admin/survey/api/target/codes?codeGroup={그룹}` | 인증 필요 |
| 정사영상 타일 | `GET /tiles/{type}/{projectId}/{z}/{x}/{y}.png` | 인증 필요 |
| 조사 사진 | `GET /survey-photo/{path}` | 인증 필요 |

---

## 기술 스택

> **farmfield 기반 스택을 정비 완료. 상세는 `tech-stack-cleanup.md` 참조.**

- React Native 0.79 (New Arch) + Expo 53 + expo-router
- MapLibre + turf + proj4 (지도/GIS)
- zustand (상태관리)
- reanimated + gesture-handler (애니메이션/제스처, bottom sheet 직접 구현)
- UI: RN 기본 컴포넌트 + StyleSheet (NativeBase/Paper 제거)
- TypeScript

---

## 구현 우선순위

### 1순위 (핵심 — 조사 가능한 최소 기능)

1. 로그인 화면 (JWT)
2. 홈 탭 — 오늘의 할당 목록 + 반려 건
3. 조사 폼 (7단계 위저드) + 사진 촬영
4. 결과 제출/임시저장

### 2순위 (효율화)

5. 지도 탭 — 필지 상태 색상 + 내 위치
6. 재조사 제출 (반려 건)
7. 클라이언트 품질 검증 (GPS 거리, 소요 시간, 필수 사진)

### 3순위 (편의)

8. 정사영상 오버레이
9. 오프라인 모드 (로컬 저장 + 동기화)
10. Push 알림 (FCM)
