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
    getRefreshToken: () => get().refreshToken,
    onTokenRefreshed: (accessToken, refreshToken) => {
      const user = get().user;
      set({ accessToken, refreshToken });
      // AsyncStorage 업데이트
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken, refreshToken, user }));
    },
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
        // client.ts에서 이미 사용자 친화적 메시지로 변환됨
        // 네트워크 에러만 별도 처리
        let message = raw;
        if (!raw || raw.includes('Network') || raw.includes('fetch') || raw === 'Unauthorized') {
          message = '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.';
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
          // 토큰 복원 — accessToken 만료 시 자동 갱신됨 (client.ts에서 처리)
          set({ accessToken, refreshToken, user, isAuthenticated: true });
        }
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    },
  };
});

export default useAuthStore;
