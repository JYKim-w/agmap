# AGMap Mobile — Claude 작업 가이드

## API 명세

**Mobile Backend API 명세서** (Web팀 작성, v1.1 / 2026-04-22)
경로: `/Users/dev/Desktop/Project/Web/agmap/docs/mobile-api-spec.md`

- Base URL: `http://{WEB_HOST}:{PORT}`
- 인증: JWT Bearer Token (`Authorization: Bearer <accessToken>`)
- 공통 응답: `ApiResponse<T>` — `{ success, code, message, data, timestamp }`
- API 그룹: `/auth/api/**` (인증), `/mobile/api/survey/**` (업무)

> API 관련 작업 시 반드시 위 파일을 Read로 읽고 엔드포인트·필드명·타입을 확인할 것.
> agmap ≠ farmfield — farmfield 코드/API 참조 금지.

## 주요 규칙

- UI 구현 전 `docs/02-design/mockup/` 목업 확인 필수
- 서버 API 필드 불확실 시 Web팀 확인 후 진행
- NativeBase, gorhom 등 제거된 라이브러리 사용 금지 (RN 기본 컴포넌트 사용)
