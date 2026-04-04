# Agmap Mobile 기술 스택 정비

> 작성일: 2026-04-04
> 배경: farmfield 기반 소스에서 agmap 현장조사 앱으로 전환하면서 기술 스택 재정비

---

## 1. 현재 상태

- Expo SDK 53 + React Native 0.79.6 (New Architecture 활성)
- farmfield에서 가져온 레거시 코드 (`src/` 20파일, `app/` 46파일)
- UI 라이브러리 이중 사용 (NativeBase + react-native-paper)
- 미사용 패키지 다수 존재

---

## 2. 제거 대상 (8개)

### 즉시 제거 (미사용)

| 패키지 | 사유 |
|--------|------|
| `react-native-immersive` | import 0건, Android only |
| `react-native-fs` | import 0건, expo-file-system으로 대체 가능 |
| `react-native-permissions` | import 0건, expo-* 권한으로 이미 대체됨 |
| `install` | 의미 없는 패키지 |

### NativeBase 제거

| 패키지 | import 수 | 사유 |
|--------|-----------|------|
| `native-base` | 40+ | deprecated, New Arch 충돌, RN 0.79 호환 불안정 |

- 사용 중인 컴포넌트: HStack, VStack, Box, Text, Badge, Button, IconButton, FormControl, Skeleton, Spinner, ScrollView, Pressable, Image, Spacer, Center, View
- 대체: React Native 기본 컴포넌트 + StyleSheet 유틸리티

### react-native-paper 제거

| 패키지 | import 수 | 사유 |
|--------|-----------|------|
| `react-native-paper` | 3 | NativeBase와 이중 사용, 경미한 사용량 |

- 사용: Button, Text, ActivityIndicator, useTheme
- 대체: RN 기본 컴포넌트

### @gorhom/bottom-sheet 제거

| 패키지 | import 수 | 사유 |
|--------|-----------|------|
| `@gorhom/bottom-sheet` | 8 | Reanimated v4 미호환, Fabric 버그, 1인 유지보수 리스크 |

- 알려진 문제:
  - Reanimated v4 호환 안 됨 (Expo SDK 54부터 필수 → 업그레이드 시 블로커)
  - New Architecture에서 터치 블로킹, 애니메이션 렉, TypeError 보고
  - RN 0.81+에서 BottomSheetSectionList 렌더 에러
- 대체: reanimated + gesture-handler 기반 직접 구현 (아래 상세)

### 기타 제거

| 패키지 | import 수 | 대체안 |
|--------|-----------|--------|
| `react-native-version-check` | 1 | expo-constants |
| `react-native-image-zoom-viewer` | 1 | expo-image 또는 직접 구현 |

---

## 3. 유지 스택

### Core

| 패키지 | 버전 | 역할 |
|--------|------|------|
| expo | ~53.0.27 | 프레임워크 |
| react-native | 0.79.6 | 런타임 (New Arch) |
| expo-router | ~5.1.11 | 라우팅 |
| react / react-dom | 19.0.0 | |

### 지도 / GIS

| 패키지 | 버전 | 역할 |
|--------|------|------|
| @maplibre/maplibre-react-native | ^10.4.2 | 지도 엔진 |
| @turf/turf | ^7.3.4 | 공간 연산 |
| proj4 | ^2.20.4 | 좌표 변환 |

### 상태관리

| 패키지 | 버전 | 역할 |
|--------|------|------|
| zustand | ^5.0.3 | 전역 상태 |

### 애니메이션 / 제스처

| 패키지 | 버전 | 역할 |
|--------|------|------|
| react-native-reanimated | ~3.17.4 | 애니메이션 (Expo 관리) |
| react-native-gesture-handler | ~2.24.0 | 제스처 (Expo 관리) |

### Expo 모듈

| 패키지 | 역할 |
|--------|------|
| expo-location | GPS |
| expo-camera | 카메라 |
| expo-image-picker | 갤러리 |
| expo-updates | OTA 업데이트 |
| expo-splash-screen | 스플래시 |
| expo-constants | 앱 메타 정보 |
| expo-font | 폰트 |
| expo-status-bar | 상태바 |
| expo-build-properties | 네이티브 빌드 설정 |

### 기타 유지

| 패키지 | 역할 |
|--------|------|
| @react-native-async-storage/async-storage | 로컬 저장소 |
| @react-native-community/netinfo | 네트워크 상태 (오프라인 지원) |
| react-native-safe-area-context | SafeArea |
| react-native-screens | 네이티브 스크린 |
| react-native-svg | SVG |
| react-native-toast-message | 토스트 알림 |
| react-native-webview | 웹뷰 |

---

## 4. Bottom Sheet 직접 구현 방안

### 필요 기능

지도 앱 특성상 bottom sheet는 핵심 UX 패턴:

| 기능 | 구현 방식 |
|------|----------|
| 드래그로 snap (peek / half / full) | `useAnimatedStyle` + `withSpring` |
| 내부 스크롤 연동 | `ScrollView` + `simultaneousGesture` |
| 배경 지도 터치 통과 | `pointerEvents` 제어 |
| 키보드 대응 | `useAnimatedKeyboard` |

### 장점

- reanimated / gesture-handler는 Expo 공식 관리 → 버전 호환 보장
- 앱에 필요한 동작만 구현 → 300줄 이내 예상
- gorhom 업그레이드 블로커 제거

---

## 5. 설계 시 고려사항

- 기능 설계 단계에서 위 기술 스택 기준으로 컴포넌트 명세 작성
- NativeBase 컴포넌트 → RN 기본 컴포넌트 매핑 테이블 별도 정리 필요
- `src/` 레거시 코드 중 재사용 가능한 로직(지도, GIS) 식별 후 `app/`으로 마이그레이션
- Bottom sheet 커스텀 컴포넌트는 공통 컴포넌트로 먼저 구현 후 각 화면에서 사용
