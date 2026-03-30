import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MeasureState {
  isMeasuring: boolean;
  measurePoints: number[][];
  currentCenter: number[] | null;
  measureDistance: number;
  measureArea: number;
  setIsMeasuring: (isMeasuring: boolean) => void;
  setMeasurePoints: (points: number[][]) => void;
  setCurrentCenter: (center: number[] | null) => void;
  setMeasureDistance: (dist: number) => void;
  setMeasureArea: (measureArea: number) => void;
  reset: () => void;
}

const createStore = (set) => ({
  isMeasuring: false,
  measurePoints: [],
  currentCenter: null,
  measureDistance: 0,
  measureArea: 0,
  setIsMeasuring: (isMeasuring) => set({ isMeasuring }),
  setMeasurePoints: (measurePoints) => set({ measurePoints }),
  setCurrentCenter: (currentCenter) => set({ currentCenter }),
  setMeasureDistance: (measureDistance) => set({ measureDistance }),
  setMeasureArea: (measureArea) => set({ measureArea }),
  reset: () => set({ isMeasuring: false, measurePoints: [], currentCenter: null, measureArea: 0, measureDistance: 0 }),
});

export default create<MeasureState>()(
  process.env.NODE_ENV === 'development'
    ? devtools(createStore, { name: 'Measure Store' })
    : createStore
);
