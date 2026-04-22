import { create } from 'zustand';
import { getNotices } from '@/lib/api/survey';
import type { Notice } from '@/lib/api/types';

interface NoticesState {
  notices: Notice[];
  totalCount: number;
  page: number;
  hasMore: boolean;
  isLoading: boolean;

  fetch: () => Promise<void>;
  fetchMore: () => Promise<void>;
}

export const useNoticesStore = create<NoticesState>((set, get) => ({
  notices: [],
  totalCount: 0,
  page: 0,
  hasMore: false,
  isLoading: false,

  fetch: async () => {
    set({ isLoading: true });
    try {
      const res = await getNotices(0, 20);
      if (res.success && res.data) {
        set({
          notices: res.data.content,
          totalCount: res.data.totalCount,
          page: 0,
          hasMore: res.data.hasMore,
        });
      }
    } catch (e) {
      if (__DEV__) console.warn('[Notices] fetch error:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMore: async () => {
    const { hasMore, isLoading, page, notices } = get();
    if (!hasMore || isLoading) return;
    set({ isLoading: true });
    try {
      const nextPage = page + 1;
      const res = await getNotices(nextPage, 20);
      if (res.success && res.data) {
        set({
          notices: [...notices, ...res.data.content],
          totalCount: res.data.totalCount,
          page: nextPage,
          hasMore: res.data.hasMore,
        });
      }
    } catch (e) {
      if (__DEV__) console.warn('[Notices] fetchMore error:', e);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export const selectPinnedNotice = (s: NoticesState) =>
  s.notices.find((n) => n.pinned) ?? null;

export const selectGlobalNotices = (s: NoticesState) =>
  s.notices.filter((n) => n.scope === 'GLOBAL');

export const selectManagerNotices = (s: NoticesState) =>
  s.notices.filter((n) => n.scope === 'MANAGER');

export default useNoticesStore;
