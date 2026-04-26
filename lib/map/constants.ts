// Design Ref: §10.3 — 지도 상수

/** 한국 bbox 범위 */
export const KOREA_BOUNDS = { ne: [132.0, 39.0], sw: [124.0, 33.0] } as const;

/** 기본 지도 중심 (한국 중심) */
export const DEFAULT_CENTER: [number, number] = [127.5, 36.5];

/** 기본 줌 레벨 */
export const DEFAULT_ZOOM = 7;

/** VWorld API key */
export const VWORLD_KEY = 'D34B6D7C-0A50-3A91-BC71-22E1E3C22678';
