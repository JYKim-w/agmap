# 인증 가이드 (현행화 2026-04-04)

> 설계 문서의 역할명(SUPER_ADMIN/ADMIN)과 구현의 역할명(ADMIN/MANAGER)이 다릅니다.
> **이 문서는 구현 기준**입니다.

| 설계 문서 | 구현 (최종) | 설명 |
|----------|-----------|------|
| SUPER_ADMIN | **ADMIN** | 최종 관리자 (농어촌공사) |
| ADMIN | **MANAGER** | 중간 관리자 (지자체) |
| SURVEYOR | **SURVEYOR** | 현장 조사원 |

## 로그인

```
POST /auth/api/login
Content-Type: application/json

{
  "loginId": "surveyor01",
  "password": "test1234"
}
```

### 응답 (ApiResponse 래퍼)

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "로그인 성공",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "userId": 12,
    "loginId": "surveyor01",
    "userName": "김현장",
    "role": "SURVEYOR",
    "companyName": "업체명"
  },
  "timestamp": "2026-04-04T10:00:00"
}
```

## 토큰 사용

모든 Mobile API 요청에 헤더 추가:

```
Authorization: Bearer {accessToken}
```

## JWT Claim 구조

| Claim | 설명 |
|-------|------|
| `userId` | 사용자 PK (Long) |
| `loginId` | 로그인 ID (String) |
| `role` | 역할 — `SURVEYOR` / `MANAGER` / `ADMIN` |
| `companyId` | 소속 업체 PK (Long) |

## 역할별 접근 권한

| 경로 | 허용 역할 |
|------|----------|
| `/mobile/api/survey/**` | SURVEYOR, MANAGER, ADMIN |
| `/admin/survey/**` | ADMIN, MANAGER |

## 에러 응답

| HTTP Status | 의미 |
|-------------|------|
| `401 Unauthorized` | 토큰 없음/만료 → 재로그인 필요 |
| `403 Forbidden` | 역할 부족 (SURVEYOR가 admin API 호출 등) |

## 테스트 계정

| loginId | password | role | 이름 |
|---------|----------|------|------|
| `surveyor01` | `test1234` | SURVEYOR | 김현장 |
| `surveyor02` | `test1234` | SURVEYOR | 이조사 |
| `surveyor03` | `test1234` | SURVEYOR | 박실사 |
