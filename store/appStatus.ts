import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AppStatusStore {
  appStatus: string;
  isNetworkCheck: boolean;
  webviewRef: any;
  insets: any;
  setAppStatus: (appStatus: string) => void;
  setIsNetworkCheck: (isNetworkCheck: boolean) => void;
  setWebviewRef: (webviewRef: any) => void;
  setInsets: (insets: any) => void;
  reset: () => void;
}

const createStore = (set) => ({
  appStatus: 'idle',
  isNetworkCheck: true,
  webviewRef: null,
  insets: null,
  setAppStatus: (appStatus: string) => set({ appStatus }),
  setIsNetworkCheck: (isNetworkCheck: boolean) => set({ isNetworkCheck }),
  setWebviewRef: (webviewRef: any) => set({ webviewRef }),
  setInsets: (insets: any) => set({ insets }),
  reset: () =>
    set({ appStatus: 'idle', isNetworkCheck: true, webviewRef: null }),
});

export default create<AppStatusStore>()(
  process.env.NODE_ENV === 'development'
    ? devtools(createStore, { name: 'App Status Store' })
    : createStore
);
