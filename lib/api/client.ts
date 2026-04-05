// API 클라이언트 — fetch wrapper
// - Authorization 헤더 자동 주입
// - 401 → 로그아웃 + 로그인 화면 이동
// - ApiResponse<T> 파싱
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

/** 서버 응답에서 사용자에게 보여줄 메시지 추출 */
function extractErrorMessage(status: number, text: string): string {
  // ApiResponse JSON이면 message 추출
  try {
    const json = JSON.parse(text);
    if (json.message && typeof json.message === 'string') {
      return json.message;
    }
  } catch {}
  // HTTP 상태 코드 기반 메시지
  return STATUS_MESSAGES[status] ?? '요청 처리 중 오류가 발생했습니다.';
}

let getToken: (() => string | null) | null = null;
let onUnauthorized: (() => void) | null = null;

/** auth store에서 토큰 getter와 401 핸들러를 주입 */
export function configureClient(opts: {
  getToken: () => string | null;
  onUnauthorized: () => void;
}) {
  getToken = opts.getToken;
  onUnauthorized = opts.onUnauthorized;
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: any,
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

  if (res.status === 401) {
    if (__DEV__) console.warn(`[API] 401 ${method} ${path}`);
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

/** multipart/form-data 업로드 */
async function uploadFile<T>(
  path: string,
  formData: FormData,
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

  if (res.status === 401) {
    if (__DEV__) console.warn(`[API] 401 POST ${path} (upload)`);
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
