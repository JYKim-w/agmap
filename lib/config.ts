// 환경 설정 — 서버 URL, API 경로
// Phase 1: 개발 서버 고정. 추후 환경별 분리.

// export const BASE_URL = 'http://211.214.194.88:5632';
export const BASE_URL = 'http://juyoungk.iptime.org:18080';

export const API = {
  // 인증
  LOGIN: '/auth/api/login',
  REFRESH: '/auth/api/refresh',

  // 조사 (Phase 2+)
  MY_ASSIGNMENTS: '/mobile/api/survey/my-assignments',
  ASSIGNMENT: '/mobile/api/survey/assignment', // /{id}, /{id}/geom
  RESULT: '/mobile/api/survey/result',
  RESULT_DRAFT: '/mobile/api/survey/result/draft', // M13 v1.3
  PHOTO_UPLOAD: '/mobile/api/survey/photo/upload',
  REJECTED: '/mobile/api/survey/rejected',

  // 마스터코드 (Phase 3+)
  CODES: '/mobile/api/survey/codes',

  // 공지사항 (v1.4) — M10, M15
  NOTICES: '/mobile/api/survey/notices',
  NOTICE_DETAIL: '/mobile/api/survey/notices', // /{noticeId}

  // 실적/알림
  MY_STATS: '/mobile/api/survey/my-stats',
  DEVICE_TOKEN: '/mobile/api/survey/device-token',
} as const;
