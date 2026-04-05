// 인증 상태 관리 — JWT 토큰 + 유저 정보
// AsyncStorage에 영속화, 앱 시작 시 복원
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { loginApi } from '@/lib/api/auth';
import { configureClient } from '@/lib/api/client';
import type { AuthUser } from '@/lib/api/types';

const STORAGE_KEY = 'auth_state';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (loginId: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  loadStoredToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // API 클라이언트에 토큰 getter + 401 핸들러 주입
  configureClient({
    getToken: () => get().accessToken,
    onUnauthorized: () => {
      get().logout();
    },
  });

  return {
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,

    login: async (loginId, password) => {
      set({ isLoading: true });
      try {
        const res = await loginApi(loginId, password);
        if (!res.success || !res.data) {
          set({ isLoading: false });
          return { success: false, message: res.message || '로그인 실패' };
        }

        const { accessToken, refreshToken, userId, userName, role, companyName } = res.data;
        const user: AuthUser = { userId, loginId: res.data.loginId, userName, role, companyName };

        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ accessToken, refreshToken, user }),
        );

        return { success: true, message: '로그인 성공' };
      } catch (e: any) {
        set({ isLoading: false });
        const raw = e?.message ?? '';
        let message = '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.';
        if (raw.includes('401') || raw.includes('Unauthorized')) {
          message = '아이디 또는 비밀번호가 올바르지 않습니다.';
        } else if (raw.includes('403')) {
          message = '접근 권한이 없습니다. 관리자에게 문의하세요.';
        } else if (raw.includes('404')) {
          message = '서버를 찾을 수 없습니다. 잠시 후 다시 시도해주세요.';
        } else if (raw.includes('500')) {
          message = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (raw.includes('Network') || raw.includes('fetch')) {
          message = '인터넷 연결을 확인해주세요.';
        }
        return { success: false, message };
      }
    },

    logout: async () => {
      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
      });
      await AsyncStorage.removeItem(STORAGE_KEY);
    },

    loadStoredToken: async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const { accessToken, refreshToken, user } = JSON.parse(raw);
        if (accessToken && user) {
          set({ accessToken, refreshToken, user, isAuthenticated: true });
        }
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    },
  };
});

export default useAuthStore;
