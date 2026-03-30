import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface BottomState {
  isExpand: boolean;
  activeMenu: string | null;
  index: number;
  setActiveMenu: (menu: string | null) => void;
  setExpand: (expand: boolean) => void;
  setIndex: (index: number) => void;
  reset: () => void;
}

const createStore = (set) => ({
  isExpand: false,
  activeMenu: null,
  index: -1,
  setActiveMenu: (menu) => set({ activeMenu: menu }),
  setExpand: (expand) => set({ isExpand: expand }),
  setIndex: (index) => set({ index }),
  reset: () => set({ isExpand: false, activeMenu: null, index: -1 }),
});

export default create<BottomState>()(
  process.env.NODE_ENV === 'development'
    ? devtools(createStore, { name: 'Bottom Store' })
    : createStore
);
