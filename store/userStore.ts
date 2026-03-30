import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UserState {
  userId: string;
  sessionId: string;
  isInitializing: boolean;
  setUser: (user: any) => void;
  reset: () => void;
  setIsInitializing: (value: boolean) => void;
}

const createStore = (set) => ({
  userId: null,
  sessionId: null,
  isInitializing: true,
  setUser: (user: any) =>
    set({ userId: user.userId, sessionId: user.sessionId }),
  reset: () => set({ userId: null, sessionId: null }),
  setIsInitializing: (value: boolean) => set({ isInitializing: value }),
});

export default create<UserState>()(
  process.env.NODE_ENV === 'development'
    ? devtools(createStore, { name: 'User Store' })
    : createStore
);
