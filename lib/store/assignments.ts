// 할당 목록 상태 관리
import { create } from 'zustand';
import { getMyAssignments, getRejected } from '@/lib/api/survey';
import type { Assignment } from '@/lib/api/types';

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
      console.log('[Assignments] API response:', JSON.stringify(res).slice(0, 500));
      if (res.success) set({ assignments: res.data ?? [] });
    } catch (e) {
      console.warn('[Assignments] fetchMyAssignments error:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRejected: async () => {
    try {
      const res = await getRejected();
      if (res.success) set({ rejected: res.data ?? [] });
    } catch (e) {
      console.warn('fetchRejected error:', e);
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
