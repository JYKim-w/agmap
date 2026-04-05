// API 클라이언트 — fetch wrapper
// - Authorization 헤더 자동 주입
// - 401 → refreshToken으로 자동 갱신 → 원래 요청 재시도
// - refresh도 실패 → 로그아웃 + 로그인 화면 이동
import { BASE_URL } from '@/lib/config';
import type { ApiResponse } from './types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const STATUS_MESSAGES: Record<number, string> = {
  400: '요청 형식이 올바르지 않습니다.',
  403: '접근 권한이 없습니다.',
  404: '요청한 정보를 찾을 수 없습니다.',
  500: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  502: '서버에 연결할 수 없습니다.',
  503: '서버 점검 중입니다. 잠시 후 다시 시도해주세요.',
};

function extractErrorMessage(status: number, text: string): string {
  try {
    const json = JSON.parse(text);
    if (json.message && typeof json.message === 'string') return json.message;
  } catch {}
  return STATUS_MESSAGES[status] ?? '요청 처리 중 오류가 발생했습니다.';
}

// ---------------------------------------------------------------------------
// Client config — auth store에서 주입
// ---------------------------------------------------------------------------

let getToken: (() => string | null) | null = null;
let getRefreshToken: (() => string | null) | null = null;
let onTokenRefreshed: ((accessToken: string, refreshToken: string) => void) | null = null;
let onUnauthorized: (() => void) | null = null;

/** 토큰 갱신 중 중복 호출 방지 */
let refreshPromise: Promise<boolean> | null = null;

export function configureClient(opts: {
  getToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokenRefreshed: (accessToken: string, refreshToken: string) => void;
  onUnauthorized: () => void;
}) {
  getToken = opts.getToken;
  getRefreshToken = opts.getRefreshToken;
  onTokenRefreshed = opts.onTokenRefreshed;
  onUnauthorized = opts.onUnauthorized;
}

// ---------------------------------------------------------------------------
// Token refresh
// ---------------------------------------------------------------------------

async function tryRefreshToken(): Promise<boolean> {
  const rt = getRefreshToken?.();
  if (!rt) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/api/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });

    if (!res.ok) {
      if (__DEV__) console.warn('[API] refresh failed:', res.status);
      return false;
    }

    const json: ApiResponse<any> = await res.json();
    if (json.success && json.data?.accessToken) {
      onTokenRefreshed?.(json.data.accessToken, json.data.refreshToken);
      if (__DEV__) console.log('[API] token refreshed');
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** 중복 방지 — 동시에 여러 401이 와도 refresh 한 번만 */
function refreshOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = tryRefreshToken().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

// ---------------------------------------------------------------------------
// Request
// ---------------------------------------------------------------------------

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: any,
  _isRetry = false,
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getToken?.();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 401 → 토큰 갱신 시도 → 재시도
  if (res.status === 401 && !_isRetry) {
    const refreshed = await refreshOnce();
    if (refreshed) {
      return request<T>(method, path, body, true);
    }
    onUnauthorized?.();
    throw new Error('Unauthorized');
  }

  if (res.status === 401) {
    onUnauthorized?.();
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    if (__DEV__) {
      console.warn(`[API] ${res.status} ${method} ${path}`);
      console.warn(`[API] req:`, body ?? '(no body)');
      console.warn(`[API] res:`, text.slice(0, 500));
    }
    throw new Error(extractErrorMessage(res.status, text));
  }

  return res.json();
}

async function uploadFile<T>(
  path: string,
  formData: FormData,
  _isRetry = false,
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {};

  const token = getToken?.();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (res.status === 401 && !_isRetry) {
    const refreshed = await refreshOnce();
    if (refreshed) {
      return uploadFile<T>(path, formData, true);
    }
    onUnauthorized?.();
    throw new Error('Unauthorized');
  }

  if (res.status === 401) {
    onUnauthorized?.();
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    if (__DEV__) {
      console.warn(`[API] ${res.status} POST ${path} (upload)`);
      console.warn(`[API] res:`, text.slice(0, 500));
    }
    throw new Error(extractErrorMessage(res.status, text));
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: any) => request<T>('POST', path, body),
  put: <T>(path: string, body?: any) => request<T>('PUT', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
  upload: <T>(path: string, formData: FormData) => uploadFile<T>(path, formData),
};
