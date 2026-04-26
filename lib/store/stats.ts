// 내 실적 store
import { create } from 'zustand';
import { getMyStats, type MyStats } from '@/lib/api/survey';

interface StatsState {
  stats: MyStats | null;
  isLoading: boolean;
  period: 'daily' | 'weekly' | 'monthly';
  fetch: (period?: 'daily' | 'weekly' | 'monthly') => Promise<void>;
}

export const useStatsStore = create<StatsState>((set, get) => ({
  stats: null,
  isLoading: false,
  period: 'weekly',

  fetch: async (period) => {
    const p = period ?? get().period;
    set({ isLoading: true, period: p });
    try {
      const res = await getMyStats(p);
      if (res.success && res.data) set({ stats: res.data });
    } catch {}
    finally { set({ isLoading: false }); }
  },
}));
