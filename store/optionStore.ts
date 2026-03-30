import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface OptionState {
  options: {
    mapType: 'base' | 'satellite' | 'hybrid';
    jijuk: boolean;           // 연속지적도
    road: boolean;            // 도로경계
    sgg: boolean;             // 시군구경계
    emd: boolean;             // 읍면동경계
    ri: boolean;              // 리경계
    farmMap: boolean;         // 팜맵
    lxMap: boolean;           // LX맵
    inspect25: boolean;       // 일제정비('25)
    use25: boolean;           // 이용실태('25)
    unregistered25: boolean; // 미등재필지('25)
    fieldMap25: boolean;     // 농지도('25)
    shelter25: boolean;      // 체류형쉼터('25)
    fmlLayer: boolean;        // 기존 농지도
  };
  setOptions: (options: any) => void;
  reset: () => void;
}
const createStore = (set) => ({
  options: {
    mapType: 'base' as 'base' | 'satellite' | 'hybrid',
    jijuk: false,
    road: false,
    sgg: false,
    emd: false,
    ri: false,
    farmMap: false,
    lxMap: false,
    inspect25: false,
    use25: false,
    unregistered25: false,
    fieldMap25: false,
    shelter25: false,
    fmlLayer: false,
  },
  setOptions: (options) => set({ options }),
  reset: () => set({ options: { 
    mapType: 'base',
    jijuk: false,
    road: false,
    sgg: false,
    emd: false,
    ri: false,
    farmMap: false,
    lxMap: false,
    inspect25: false,
    use25: false,
    unregistered25: false,
    fieldMap25: false,
    shelter25: false,
    fmlLayer: false,
  } }),
});

export default create<OptionState>()(
  process.env.NODE_ENV === 'development'
    ? devtools(createStore, { name: 'Option Store' })
    : createStore
);
