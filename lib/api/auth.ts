// 인증 API
import { API } from '@/lib/config';
import { api } from './client';
import type { LoginData, LoginRequest } from './types';

export async function loginApi(loginId: string, password: string) {
  return api.post<LoginData>(API.LOGIN, { loginId, password } satisfies LoginRequest);
}

export async function changePasswordApi(currentPassword: string, newPassword: string) {
  return api.post<null>('/auth/api/change-password', { currentPassword, newPassword });
}
