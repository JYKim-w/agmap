# 모던 기술 스택 가이드 (2026년 기준)

> **대상 프로젝트**: agmap — React Native + Expo 기반 AR 대피소 지도 앱
> (지도, AR, GPS/센서, 오프라인 지원, 좌표 변환, 면적 측정)
>
> **대상 독자**: 레거시 스택에 익숙한 개발자가 모던 스택을 빠르게 훑어보고 싶을 때

---

## TL;DR — 이 프로젝트를 2026년에 새로 시작한다면

```
Mobile:       Expo SDK 53+ (React Native New Architecture) + TypeScript
Routing:      Expo Router (file-based)
State:        Zustand (client) + TanStack Query (server)
UI:           NativeWind (Tailwind) + Tamagui 또는 Gluestack UI
Map:          MapLibre Native + MapTiler/Protomaps (벡터 타일)
AR:           ViroReact 또는 three.js + expo-gl (커스텀)
Backend:      Hono (Cloudflare Workers) + tRPC 또는 Supabase
DB:           PostgreSQL + PostGIS (지리쿼리) + Redis (캐시)
Realtime:     Supabase Realtime 또는 PartyKit
Auth:         Clerk 또는 Supabase Auth
CI/CD:        GitHub Actions + EAS Build/Submit
Monitoring:   Sentry + PostHog + Expo Insights
Testing:      Jest + RNTL + Maestro (E2E)
```

---

## 1. 모바일 프론트엔드

### 프레임워크

| 선택지 | 설명 | 추천도 |
|--------|------|--------|
| **Expo (SDK 53+)** | React Native 위에 올라가는 메타 프레임워크. OTA 업데이트, EAS 빌드, 라우팅, 다수 네이티브 모듈 번들링 | ⭐⭐⭐⭐⭐ (현재 사용 중) |
| Bare React Native | Expo 없이 직접 네이티브 설정. 제어권 ↑, 보일러플레이트 ↑ | ⭐⭐⭐ |
| Flutter | Dart 기반, 높은 성능. AR/네이티브 모듈 생태계는 RN보다 약함 | ⭐⭐⭐ |

**포인트**: React Native 0.76+ 부터 **New Architecture** (Fabric 렌더러 + TurboModules + JSI) 가 기본. 브릿지 오버헤드 없이 JS ↔ 네이티브 동기 호출 가능 → AR/센서처럼 빈번한 네이티브 호출에 유리.

### 라우팅

- **Expo Router** (파일 기반, Next.js App Router 스타일) ← 이미 사용 중
- 레거시: React Navigation 단독 → 이제는 Expo Router가 내부에서 감싸줌

### 언어/타입

- **TypeScript strict mode** 필수
- `tsconfig.json` 에 `"strict": true`, `"noUncheckedIndexedAccess": true` 권장

---

## 2. 상태 관리

**"서버 상태"와 "클라이언트 상태"를 분리하는 게 현대의 핵심.**

| 용도 | 추천 | 레거시 |
|------|------|--------|
| 서버 상태 (fetch/cache/sync) | **TanStack Query** (구 React Query) | Redux + thunk/saga |
| 전역 클라이언트 상태 | **Zustand** (현재 사용 중) 또는 Jotai | Redux, MobX |
| 폼 상태 | React Hook Form + Zod | Formik |
| 로컬 저장소 | MMKV (빠름) 또는 expo-sqlite/kv | AsyncStorage |

**이유**: Redux 보일러플레이트 → Zustand 한 파일로 대체. API 캐싱/재검증 → TanStack Query 가 stale-while-revalidate, optimistic update, 무한 스크롤까지 제공.

---

## 3. UI 라이브러리

| 선택지 | 특징 |
|--------|------|
| **NativeWind v4** | Tailwind CSS를 RN에 그대로. CSS 변수, dark mode, 반응형 | 가장 인기 |
| **Tamagui** | 컴파일러가 StyleSheet로 변환해 성능 ↑. 디자인 시스템 구축 용이 | 대형 앱 |
| **Gluestack UI v2** | 헤드리스 + 유틸리티. NativeWind 기반 | 커스터마이징 중심 |
| Legacy (React Native Paper, NativeBase) | Material/MD 기반. 번들 크기 크고 커스터마이징 제약 | 신규 추천 X |

**포인트**: `native-base` 는 유지보수가 사실상 중단 상태. 지금 프로젝트에서 점진적으로 NativeWind나 Tamagui로 이관하는 것 추천.

---

## 4. 지도 (Geospatial)

### 지도 렌더링

- **MapLibre GL Native** ← 이미 사용 중. Mapbox v1의 오픈소스 포크, 라이선스 부담 없음.
- 대안: Mapbox GL (상용, 월 MAU 기반 과금), Google Maps SDK (유료 & 크로스플랫폼 이슈)

### 벡터 타일 / 스타일

- **MapTiler** (클라우드, 무료 티어 있음)
- **Protomaps** (정적 `.pmtiles` 파일로 셀프 호스팅, S3/R2에 올리면 끝) ← 비용 절감용 최고
- **OpenFreeMap** (완전 무료 오픈소스 타일 서비스)

### 지리 연산

- **Turf.js** ← 이미 사용 중. 거리, 면적, 버퍼, 교차 등 200+ 함수
- **proj4js** ← 이미 사용 중. 좌표계 변환 (EPSG:5179 ↔ WGS84 등)
- 서버 측: **PostGIS** (PostgreSQL 확장). ST_DWithin, ST_Distance, ST_Intersects 등

### 오프라인 지도

- MapLibre의 `OfflineManager` + 타일 팩 다운로드
- 또는 `.pmtiles` 파일을 로컬에 저장해 파일 URL로 직접 서빙

---

## 5. AR (증강현실)

현재 프로젝트는 `expo-camera` + GPS + 센서로 자체 AR 로직 구현 중인 것으로 보임. 고도화한다면:

| 선택지 | 설명 |
|--------|------|
| **ViroReact (Viro Community)** | RN 전용 AR 라이브러리. ARKit/ARCore 래핑. 3D 오브젝트 배치 쉬움 |
| **three.js + expo-gl + expo-three** | WebGL 기반 커스텀 3D. 카메라 피드 위에 합성 |
| **react-three-fiber-native** | three.js를 React 선언형으로. 위와 조합 |
| **네이티브 브릿지 (ARKit/ARCore 직접)** | SLAM/앵커가 필요한 고급 기능 |

**VPS (Visual Positioning)**: Google Geospatial API (ARCore), Niantic Lightship 등을 활용하면 GPS 오차(5~20m)를 극복하고 센티미터 수준 위치 추정 가능.

---

## 6. 백엔드

### 런타임/프레임워크

| 선택지 | 특징 |
|--------|------|
| **Hono + Cloudflare Workers** | Edge에서 실행, cold start ~5ms, 지리 기반 앱에 이상적 |
| **Bun + Elysia** | Bun 런타임, 초고속. 최근 1.0+ 안정화 |
| **tRPC** | 타입 안전한 end-to-end API. 프론트/백 TypeScript 공유 시 최고 |
| **Next.js Route Handlers** | 백엔드까지 묶어 단일 배포 |
| **FastAPI (Python)** | ML/AI 파이프라인 결합 시 |
| **Go (Gin/Fiber)** | 고성능 지리 서비스, CPU intensive 작업 |

**BaaS (Backend as a Service)** — 레거시 개발자에게 특히 추천:

- **Supabase**: PostgreSQL + PostGIS + Auth + Realtime + Storage. 자체 호스팅도 가능
- **Firebase**: 여전히 강력하지만 지리쿼리는 제한적
- **Appwrite**: 오픈소스 대안

### 데이터베이스

- **PostgreSQL 16+ with PostGIS** — 지리정보의 사실상 표준
- **Redis / Valkey** — 근처 검색 캐시 (GEOADD/GEOSEARCH)
- **SQLite (Turso/libSQL)** — 엣지 분산 SQLite, 가벼운 서비스에 최적
- **DuckDB** — 분석/배치 지리쿼리

### ORM

- **Drizzle ORM** — 최근 대세. SQL-first, 타입 안전, 가벼움
- Prisma — 여전히 인기, 마이그레이션 UX 최고

---

## 7. 실시간 / 푸시 / 백그라운드

- **Supabase Realtime** / **PartyKit** / **Liveblocks** — WebSocket 추상화
- **Expo Notifications** — 푸시 (FCM/APNs 통합)
- **expo-task-manager + expo-location** — 백그라운드 위치 추적
- **WatermelonDB** 또는 **PowerSync** — 오프라인 우선 동기화

---

## 8. 인증

| 선택지 | 특징 |
|--------|------|
| **Clerk** | RN SDK 완비. 패스키, OAuth, 2FA 즉시. 유료 |
| **Supabase Auth** | BaaS와 결합. 무료 티어 넉넉 |
| **Better Auth** | 오픈소스, self-host, 2025 급부상 |
| NextAuth / Auth.js | 주로 웹 중심 |

---

## 9. 인프라 / 배포

| 계층 | 추천 |
|------|------|
| 앱 빌드/배포 | **EAS Build + EAS Submit** (이미 사용 중), EAS Update (OTA) |
| 서버 | **Cloudflare Workers**, Fly.io, Railway, Render |
| DB 호스팅 | Neon, Supabase, Turso |
| 오브젝트 스토리지 | **Cloudflare R2** (S3 호환, egress 무료), AWS S3 |
| CDN / 엣지 | Cloudflare, Vercel Edge |
| IaC | **Terraform** 또는 **Pulumi** (TypeScript로 인프라 작성) |
| 컨테이너 | Docker + Compose 로컬, 운영은 PaaS 위주 |

---

## 10. CI/CD

```
GitHub Actions
  ├─ PR → lint + typecheck + jest + maestro (E2E)
  ├─ merge → EAS Build (dev/preview)
  └─ tag   → EAS Build (production) + EAS Submit (스토어)
```

- **EAS Workflows** (2025 출시) 로 EAS 내부 파이프라인 구성 가능
- **Renovate** 또는 Dependabot 으로 의존성 자동 PR

---

## 11. 모니터링 / 분석

- **Sentry** — 에러 + 성능 (RN native crash까지)
- **PostHog** — 제품 분석, 세션 리플레이, 피처 플래그
- **Expo Insights** (현재 활성화) — Expo 통합 기본 지표
- **Grafana + Loki + Tempo** — 셀프 호스팅 옵저버빌리티 스택

---

## 12. 테스트

| 계층 | 도구 |
|------|------|
| Unit | **Jest** + **React Native Testing Library** |
| Integration / API | **MSW** (API 모킹), **Vitest** (서버) |
| E2E 모바일 | **Maestro** (YAML 시나리오, Detox보다 쉬움) |
| 시각 회귀 | Chromatic, Percy |
| 성능 | Flashlight (RN 성능 스코어링) |

---

## 13. 개발자 도구

- **Biome** 또는 **ESLint 9 + Prettier** (현재) — 린트/포맷
- **Reactotron** (현재 사용 중) — RN 디버깅
- **Flipper 대체**: Expo Dev Tools, React Native DevTools (v0.76+ 기본 탑재)
- **MMKV Inspector**, **Zustand DevTools** (현재 사용 중)

---

## 14. 이 프로젝트 기준 "다음 단계" 추천

이미 꽤 모던합니다. 점진적으로 개선한다면:

1. **UI 통일**: `native-base` + `react-native-paper` 중복 → NativeWind 또는 Tamagui로 단일화
2. **서버 상태**: API 호출이 늘어나면 **TanStack Query** 도입 (수동 fetch/loading 관리 제거)
3. **오프라인 지도**: `.pmtiles` + Protomaps 로 대피소 주변 타일 팩 사전 다운로드
4. **PostGIS 서버**: 대피소 근처 검색을 클라 Turf.js 연산 → 서버 PostGIS 쿼리로 위임 (배터리 절약)
5. **OTA 업데이트**: `expo-updates` (이미 사용 중) 로 스토어 심사 없이 긴급 패치
6. **E2E 테스트**: Maestro로 "대피소 검색 → AR 측정" 시나리오 자동화
7. **Sentry 추가**: 에러 트래킹. 프로덕션에서 AR/센서 크래시 원인 파악에 필수

---

## 15. 레거시 → 모던 매핑 치트시트

| 레거시 | 모던 |
|--------|------|
| jQuery / Backbone | React / Vue / Svelte |
| Redux + saga | Zustand + TanStack Query |
| CSS / Sass | Tailwind / NativeWind |
| REST + Swagger | tRPC / GraphQL / OpenAPI + codegen |
| Express | Hono / Elysia / Fastify |
| MySQL | PostgreSQL (+ PostGIS) |
| Sequelize | Drizzle / Prisma |
| Webpack | Vite / Turbopack / Metro |
| Mocha + Chai | Vitest / Jest + RNTL |
| Jenkins | GitHub Actions |
| VM + Nginx | Cloudflare Workers / Vercel / Fly.io |
| AWS EC2 + RDS | Supabase / Neon / Turso |
| Cordova / Ionic | React Native + Expo / Flutter |

---

## 참고 링크

- Expo: https://docs.expo.dev
- React Native New Architecture: https://reactnative.dev/architecture/landing-page
- MapLibre: https://maplibre.org
- PostGIS: https://postgis.net
- TanStack Query: https://tanstack.com/query
- Supabase: https://supabase.com
- Hono: https://hono.dev
- Drizzle: https://orm.drizzle.team
- Maestro: https://maestro.mobile.dev
