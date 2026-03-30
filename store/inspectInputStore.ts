import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface InspectInputStore {
  inspectId: null;
  fmlId: null;
  fmlUseCategory: string;
  fmlUseSitu: null;
  sunlgtEsbYn: string;
  ownAr: number;
  isFacility: string;
  isFarm: string;
  useSitu: null;
  useCategory: string;
  setIsFacility: (isFacility: string) => void;
  setIsFarm: (isFarm: string) => void;
  setFmlUseSitu: (fmlUseSitu: string) => void;
  setUseSitu: (useSitu: string) => void;
  setUseCategory: (useCategory: string) => void;
  setSunlgtEsbYn: (sunlgtEsbYn: string) => void;
  setOwnAr: (ownAr: number) => void;
  setInspectInput: (inspectInput: any) => void;
  reset: () => void;
}

const createStore = (set) => ({
  inspectId: null,
  fmlId: null,
  fmlUseCategory: '',
  fmlUseSitu: null,
  sunlgtEsbYn: 'N',
  ownAr: 0,
  isFacility: null,
  isFarm: null,
  useSitu: null,
  useCategory: '',
  setInspectInput: (inspectInput: any) => {
    for (let field in inspectInput) {
      if (inspectInput[field] !== undefined) {
        set({ [field]: inspectInput[field] });
      }
    }
  },
  setIsFacility: (isFacility: string) => set({ isFacility }),
  setIsFarm: (isFarm: string) => set({ isFarm }),
  setFmlUseSitu: (fmlUseSitu: string) => set({ fmlUseSitu }),
  setUseSitu: (useSitu: string) => set({ useSitu }),
  setUseCategory: (useCategory: string) => set({ useCategory }),
  setSunlgtEsbYn: (sunlgtEsbYn: string) => set({ sunlgtEsbYn }),
  setOwnAr: (ownAr: number) => set({ ownAr }),
  reset: () => {
    set({
      inspectId: null,
      fmlId: null,
      fmlUseCategory: '',
      fmlUseSitu: null,
      sunlgtEsbYn: 'N',
      ownAr: 0,
      isFacility: null,
      isFarm: null,
      useSitu: null,
      useCategory: '',
    });
  },
});

export default create<InspectInputStore>()(
  process.env.NODE_ENV === 'development'
    ? devtools(createStore, { name: 'Inspect Input Store' })
    : createStore
);
