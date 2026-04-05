// 환경 설정 — 서버 URL, API 경로
// Phase 1: 개발 서버 고정. 추후 환경별 분리.

export const BASE_URL = 'http://211.214.194.88:5632';

export const API = {
  // 인증
  LOGIN: '/auth/api/login',
  REFRESH: '/auth/api/refresh',

  // 조사 (Phase 2+)
  MY_ASSIGNMENTS: '/mobile/api/survey/my-assignments',
  ASSIGNMENT: '/mobile/api/survey/assignment', // /{id}
  RESULT: '/mobile/api/survey/result',
  PHOTO_UPLOAD: '/mobile/api/survey/photo/upload',
  REJECTED: '/mobile/api/survey/rejected',

  // 마스터코드 (Phase 3+)
  CODES: '/mobile/api/survey/codes',
} as const;
