import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import Config from '@/app/js/config';

interface SearchState {
  results: any[];
  loading: boolean;
  currentPage: number;
  lastPage: number;
  selectedIndex: number | null;
  selectedCoord: [number, number] | null;
  fetchSearchData: (query: string, isMore?: boolean) => Promise<void>;
  selectItem: (index: number, coord: [number, number]) => void;
  clearSelection: () => void;
  reset: () => void;
}

const createStore = (set, get) => ({
  results: [],
  loading: false,
  currentPage: 1,
  lastPage: 1,
  selectedIndex: null,
  selectedCoord: null,

  fetchSearchData: async (searchCn, nextPage = false) => {
    if (!searchCn || searchCn === '') return;
    const { currentPage, lastPage } = get();

    let url = Config.url + 'map/kakaoKeyword.do?';
    let page = nextPage ? currentPage + 1 : 1;

    if (!nextPage) {
      set({ results: [], currentPage: 1, lastPage: 1, selectedIndex: null, selectedCoord: null });
    } else if (lastPage === currentPage) {
      return;
    }

    set({ loading: true });

    const queryString = `query=${encodeURIComponent(searchCn)}&page=${page}&size=10&sort=accuracy`;

    url += `query=${encodeURIComponent(queryString)}`;

    try {
      const response = await fetch(url);
      const json = await response.json();

      set({
        results: nextPage
          ? [...get().results, ...json.documents]
          : json.documents,
        currentPage: page,
        lastPage: json.meta['is_end'] ? page : page + 1,
        loading: false,
      });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },

  selectItem: (index, coord) => set({
    selectedIndex: index,
    selectedCoord: coord,
  }),

  clearSelection: () => set({
    selectedIndex: null,
    selectedCoord: null,
  }),

  reset: () => set({
    results: [],
    currentPage: 1,
    lastPage: 1,
    selectedIndex: null,
    selectedCoord: null,
  }),
});

export default create<SearchState>()(
  process.env.NODE_ENV === 'development'
    ? devtools(createStore, { name: 'Search Store' })
    : createStore
);
