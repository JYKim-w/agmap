import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import Config from '@/app/js/config';

interface CodeStore {
  jimkCodeList: any[];
  farmgSituCodeList: any[];
  farmgSituDtlCodeList: any[];
  fmlUseSituCodeList: any[];
  setJimkCodeList: (jimkCodeList: any[]) => void;
  fetchJimkCodeList: () => Promise<void>;
  fetchFarmgSituCodeList: () => Promise<void>;
  fetchFarmgSituDtlCodeList: () => Promise<void>;
  fetchFmlUseSituCodeList: () => Promise<void>;
  reset: () => void;
}

const createStore = (set) => ({
  jimkCodeList: [],
  farmgSituCodeList: [],
  farmgSituDtlCodeList: [],
  fmlUseSituCodeList: [],
  setJimkCodeList: (jimkCodeList: any[]) => set({ jimkCodeList }),
  fetchJimkCodeList: async () => {
    const response = await fetchCodeList('jimk');

    set({ jimkCodeList: response.list });
  },
  fetchFarmgSituCodeList: async () => {
    const response = await fetchCodeList('farmgSitu');
    set({ farmgSituCodeList: response.list });
  },
  fetchFarmgSituDtlCodeList: async () => {
    const response = await fetchCodeList('farmgSituDtl');
    set({ farmgSituDtlCodeList: response.list });
  },
  fetchFmlUseSituCodeList: async () => {
    const response = await fetchCodeList('fmlUseSitu');
    set({ fmlUseSituCodeList: response.list });
  },
  reset: () => {
    set({
      jimkCodeList: [],
      farmgSituCodeList: [],
      farmgSituDtlCodeList: [],
      fmlUseSituCodeList: [],
    });
  },
});

const fetchCodeList = async (type: string) => {
  const response = await fetch(Config.url + 'lot/code?type=' + type);
  const data = await response.json();
  return data;
};

export default create<CodeStore>()(
  process.env.NODE_ENV === 'development'
    ? devtools(createStore, { name: 'Code Store' })
    : createStore
);
