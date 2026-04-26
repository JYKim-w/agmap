// 마스터코드 store — 서버 동적 로딩 + AsyncStorage 캐시
// 서버 실패 시 lib/survey/codes.ts 하드코딩 폴백
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { getCodes } from '@/lib/api/survey';
import {
  CROP_TYPE, CROP_CONDITION, CULTIVATOR_TYPE,
  FACILITY_TYPE, FACILITY_DETAIL, PERMIT_STATUS,
  FALLOW_PERIOD, FALLOW_REASON, NEGLECT_LEVEL,
  CONVERSION_USE, CONVERSION_SCALE,
  OWNER_CONTACT, SURVEYOR_OPINION,
} from '@/lib/survey/codes';

const CACHE_KEY = 'survey_codes_cache';

// 하드코딩 폴백 — 서버 코드 그룹명 → 기존 상수 매핑
const FALLBACK: Record<string, { value: string; label: string }[]> = {
  CROP_TYPE,
  CROP_CONDITION,
  CULTIVATOR_TYPE,
  FACILITY_TYPE,
  FACILITY_DETAIL,
  PERMIT_STATUS,
  FALLOW_PERIOD,
  FALLOW_REASON,
  NEGLECT_LEVEL,
  CONVERSION_USE,
  CONVERSION_SCALE,
  OWNER_CONTACT,
  SURVEYOR_OPINION,
};

const CODE_GROUPS = Object.keys(FALLBACK);

interface CodesState {
  groups: Record<string, { value: string; label: string }[]>;
  isLoaded: boolean;
  /** 앱 부팅 후 캐시 복원 */
  loadFromCache: () => Promise<void>;
  /** 서버에서 최신 코드 로딩 (로그인 후 호출) */
  fetchFromServer: () => Promise<void>;
  /** 코드 그룹 아이템 반환 — 없으면 폴백 */
  getItems: (group: string) => { value: string; label: string }[];
  /** 코드값 → 라벨 반환 */
  getLabel: (group: string, value: string | null) => string;
}

export const useCodesStore = create<CodesState>((set, get) => ({
  groups: { ...FALLBACK },
  isLoaded: false,

  loadFromCache: async () => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        set({ groups: { ...FALLBACK, ...cached }, isLoaded: true });
      }
    } catch {}
  },

  fetchFromServer: async () => {
    try {
      const results = await Promise.allSettled(
        CODE_GROUPS.map((g) => getCodes(g).then((res) => ({ group: g, items: res.data ?? [] })))
      );

      const updated: Record<string, { value: string; label: string }[]> = {};
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.items.length > 0) {
          const { group, items } = result.value;
          updated[group] = items
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(({ codeValue, codeLabel }) => ({ value: codeValue, label: codeLabel }));
        }
      }

      if (Object.keys(updated).length > 0) {
        set({ groups: { ...FALLBACK, ...updated }, isLoaded: true });
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      }
    } catch {}
  },

  getItems: (group) => get().groups[group] ?? FALLBACK[group] ?? [],

  getLabel: (group, value) => {
    if (!value) return '';
    return get().getItems(group).find((c) => c.value === value)?.label ?? value;
  },
}));

export default useCodesStore;
