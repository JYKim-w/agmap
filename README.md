# 개발 가이드

## 📱 구동 (Development)

**⚠️ 주의:** 프로젝트는 **네이티브 기능(AR, 센서)**을 사용하므로 **Expo Go 앱 미지원**입니다.
반드시 **로컬 빌드** 또는 **EAS 원격빌드** 후 실기기/시뮬레이터에서 실행하세요.

### 개발 흐름

```
코드 수정 (VSCode)
       ↓
npm run build:android/ios  (또는 EAS 빌드)
       ↓
시뮬레이터/실기기에서 실행 및 테스트
       ↓
필요시 코드 수정 후 반복
```

---

## 🔨 빌드 및 실행

### 1. 로컬 빌드 (가장 빠름)

자신의 컴퓨터에서 네이티브 코드 컴파일:

#### Android 로컬 빌드

```bash
npm run build:android
```

**실행 방식:**

- Android Emulator에 자동 설치 및 실행
- 또는 `adb install build/app/outputs/bundle/release/app-release.apk` 로 수동 설치

#### iOS 로컬 빌드

```bash
npm run build:ios
```

**실행 방식:**

- Xcode 시뮬레이터에 자동 설치 및 실행
- 또는 `ios/` 폴더에서 `xed .` 로 Xcode 열어서 직접 실행

**특징:**

- 가장 빠른 빌드 속도 (3~10분)
- 로컬 환경 필수 (Android Studio, Xcode)
- 개발 중 반복 테스트용

#### 캐시 제거 후 빌드

문제 발생 시:

```bash
npm run build:android:no-cache
npm run build:ios:no-cache
```

---

### 2. 시뮬레이터에서 테스트 (로컬 빌드)

#### Android 시뮬레이터

1. Android Studio에서 Virtual Device Manager 열기
2. 원하는 Emulator 선택 후 시작
3. 빌드 완료 후 자동 설치 또는:

```bash
adb install <apk-path>
```

#### iOS 시뮬레이터

1. Xcode 시뮬레이터 실행:

```bash
open -a Simulator
```

2. 빌드 완료 후 자동 설치

---

### 3. 실기기에서 테스트

#### Android 실기기

**필수 조건:**

- USB 디버깅 활성화된 Android 기기
- USB 케이블 연결

**설치 방법:**

```bash
# 연결된 기기 확인
adb devices

# 빌드 및 설치
npm run build:android
```

또는 수동 설치:

```bash
adb install -r <apk-path>
```

---

#### iOS 실기기

**필수 조건:**

- 애플 개발자 계정
- Xcode에 Apple ID 로그인
- 기기 신뢰 설정 완료

**설치 방법:**

1. **Xcode를 통한 설치 (권장):**

```bash
npm run build:ios
# Xcode 수동으로 열어서 기기 선택 후 Run
```

2. **터미널을 통한 설치:**

```bash
# ios/ 폴더의 .xcworkspace 열기
cd ios
open app.xcworkspace
```

- Xcode에서 기기 선택 후 Build & Run

---

## 🌐 원격 빌드 (EAS)

기기 설정 없이 Expo 클라우드에서 빌드:

### 원격 개발 빌드

#### Android 원격 개발 빌드

```bash
npm run build:android:dev
```

#### iOS 원격 개발 빌드

```bash
npm run build:ios:dev
```

**특징:**

- 로컬 환경 설정 불필요
- 소요 시간: 5~15분
- CI/CD 통합 가능

**설치 방법:**

- 빌드 완료 후 QR 코드 또는 링크 제공
- Expo Go 앱에서 스캔 (만약 사용 가능할 경우)
- **또는** 직접 APK/IPA 다운로드 후 기기에 설치

---

### 로컬 EAS 빌드

로컬에서 EAS 프로필을 사용해 빌드 (배포 환경과 동일):

#### Android 로컬 EAS 개발 빌드

```bash
npm run build:android:dev-local
```

#### iOS 로컬 EAS 개발 빌드

```bash
npm run build:ios:dev-local
```

**특징:**

- EAS 설정 사용 (프로덕션과 동일한 환경)
- 로컬에서 빌드 (네이티브 도구 필요)
- 배포 전 최종 검증용
- 소요 시간: 10~30분

---

### 프로덕션 빌드 및 배포

#### 원격 프로덕션 빌드

```bash
npm run build:android:prod
npm run build:ios:prod
```

#### 로컬 EAS 프로덕션 빌드

```bash
npm run build:android:prod-local
npm run build:ios:prod-local
```

**특징:**

- 최적화된 성능 및 보안
- Signing 자동 적용
- 배포 준비 완료
- 원격 소요 시간: 10~20분

---

## 📦 앱스토어 제출 및 인증서 관리

### 사전 준비

#### Android (Google Play Store)

```bash
# 업로드 키 생성 (EAS가 관리)
# 자세한 내용: https://docs.expo.dev/build/internal-distribution/
```

#### iOS (Apple App Store)

```bash
# Apple 개발자 계정 필수
# Certificate 및 Provisioning Profile 필요
# EAS가 자동 생성 가능
```

### 앱스토어 제출

프로덕션 빌드 완료 후 제출:

#### Android (Google Play Store)

```bash
npm run submit:android
```

**제출 전 확인:**

- 프로덕션 빌드 완료됨
- `package.json` 버전 번호 업데이트
- 앱 설명 및 스크린샷 작성
- Privacy Policy 준비

**심사 시간:** 보통 몇 시간 ~ 1일

---

#### iOS (Apple App Store)

```bash
npm run submit:ios
```

**제출 전 확인:**

- 프로덕션 빌드 완료됨
- `package.json` 버전 번호 업데이트
- 앱 설명 및 스크린샷 작성 (최소 5개)
- 개인정보 보호정책 준비
- 앱 심사 가이드라인 확인

**심사 시간:** 보통 1~2일 (거부 시 추가 심사)

---

### 인증서 관리 (EAS)

#### 인증서 자동 생성 (권장)

EAS가 빌드 시 자동으로 생성 및 관리:

```bash
# 직접 설정 필요 없음
npm run build:*:prod
```

#### 수동 인증서 관리

```bash
# 인증서 상태 확인
eas credentials

# 인증서 생성/갱신
eas credentials -p android
eas credentials -p ios
```

---

## 배포 흐름

```
┌─────────────────────────────────┐
│   코드 수정 (VSCode)            │
│   + 테스트 (시뮬레이터/실기기)  │
└──────────────┬──────────────────┘
               │
┌──────────────▼─────────────────┐
│  버전 업데이트 (package.json)   │
│  인증서 확인                    │
└──────────────┬──────────────────┘
               │
┌──────────────▼─────────────────┐
│  프로덕션 빌드 생성             │
│  npm run build:*:prod           │
└──────────────┬──────────────────┘
               │
┌──────────────▼─────────────────┐
│  앱스토어 스토어 페이지 작성    │
│  (설명, 스크린샷 등)           │
└──────────────┬──────────────────┘
               │
┌──────────────▼─────────────────┐
│  앱스토어에 제출                │
│  npm run submit:android/ios     │
└──────────────┬──────────────────┘
               │
┌──────────────▼─────────────────┐
│     심사 대기                   │
│  (Google Play: 몇 시간)         │
│  (App Store: 1~2일)            │
└──────────────┬──────────────────┘
               │
┌──────────────▼─────────────────┐
│     배포 완료 🎉                 │
└─────────────────────────────────┘
```

---

## 기타 명령어

```bash
npm run lint          # 코드 스타일 검사
npm run lint:fix      # 자동 수정
npm run format        # 코드 포매팅
npm run test          # 테스트 실행
```

---

## 환경별 추천 (Quick Reference)

| 상황                            | 추천 방식                    | 소요 시간 |
| ------------------------------- | ---------------------------- | --------- |
| **빠른 개발 (시뮬레이터)**      | `npm run build:android`      | 3~10분    |
| **빠른 개발 (실기기)**          | `npm run build:ios`          | 3~10분    |
| **로컬 환경 없음 (시뮬레이터)** | `npm run build:*:dev`        | 5~15분    |
| **배포 전 검증 (로컬)**         | `npm run build:*:dev-local`  | 10~30분   |
| **배포 전 최종 빌드**           | `npm run build:*:prod`       | 10~20분   |
| **앱스토어 제출**               | `npm run submit:android/ios` | 수동 작업 |
