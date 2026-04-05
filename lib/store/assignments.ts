// 할당 목록 상태 관리 + 오프라인 캐시
// Design Ref: field-survey-offline §6
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { getMyAssignments, getRejected } from '@/lib/api/survey';
import type { Assignment } from '@/lib/api/types';

const CACHE_KEY_ASSIGNMENTS = 'assignments_cache';
const CACHE_KEY_REJECTED = 'rejected_cache';

interface AssignmentState {
  assignments: Assignment[];
  rejected: Assignment[];
  isLoading: boolean;
  searchQuery: string;

  fetchMyAssignments: (date?: string) => Promise<void>;
  fetchRejected: () => Promise<void>;
  setSearchQuery: (q: string) => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  assignments: [],
  rejected: [],
  isLoading: false,
  searchQuery: '',

  fetchMyAssignments: async (date) => {
    set({ isLoading: true });
    try {
      const res = await getMyAssignments(date);
      if (res.success) {
        const data = res.data ?? [];
        set({ assignments: data });
        // 캐시 저장
        AsyncStorage.setItem(CACHE_KEY_ASSIGNMENTS, JSON.stringify(data));
      }
    } catch (e) {
      // 네트워크 실패 → 캐시에서 로드
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY_ASSIGNMENTS);
        if (cached) set({ assignments: JSON.parse(cached) });
      } catch {}
      if (__DEV__) console.warn('[Assignments] fetchMyAssignments error:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRejected: async () => {
    try {
      const res = await getRejected();
      if (res.success) {
        const data = res.data ?? [];
        set({ rejected: data });
        AsyncStorage.setItem(CACHE_KEY_REJECTED, JSON.stringify(data));
      }
    } catch (e) {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY_REJECTED);
        if (cached) set({ rejected: JSON.parse(cached) });
      } catch {}
      if (__DEV__) console.warn('fetchRejected error:', e);
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
}));

// 파생 값 selectors
export const selectProgress = (s: AssignmentState) => {
  const total = s.assignments.length;
  const completed = s.assignments.filter((a) => a.resultId !== null).length;
  return { total, completed, remaining: total - completed, rate: total > 0 ? completed / total : 0 };
};

export const selectFiltered = (s: AssignmentState) => {
  const q = s.searchQuery.trim().toLowerCase();
  if (!q) return s.assignments;
  return s.assignments.filter((a) => a.address?.toLowerCase().includes(q));
};

export const selectUnsubmitted = (s: AssignmentState) =>
  s.assignments.filter((a) => !a.resultId || a.resultStatus === 'DRAFT');

export const selectSubmitted = (s: AssignmentState) =>
  s.assignments.filter((a) => a.resultId && a.resultStatus && a.resultStatus !== 'DRAFT');

export const selectStatusCounts = (s: AssignmentState) => {
  const submitted = selectSubmitted(s);
  return {
    submitted: submitted.filter((a) => a.resultStatus === 'SUBMITTED').length,
    reviewing: submitted.filter((a) => a.resultStatus === 'REVIEWING').length,
    approved: submitted.filter((a) => a.resultStatus === 'APPROVED').length,
    rejected: s.rejected.length,
  };
};

export default useAssignmentStore;
