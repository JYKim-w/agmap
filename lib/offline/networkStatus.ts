// Design Ref: §2 — 네트워크 상태 관리
// Plan SC: SC-4 오프라인 배너, SC-2 네트워크 복귀 트리거
import NetInfo from '@react-native-community/netinfo';
import { create } from 'zustand';

interface NetworkState {
  isConnected: boolean;
  lastCheckedAt: number;
  /** NetInfo 리스너 시작 — cleanup 함수 반환 */
  startListening: () => () => void;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  isConnected: true,
  lastCheckedAt: Date.now(),

  startListening: () => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? false;
      const prev = get().isConnected;
      set({ isConnected: connected, lastCheckedAt: Date.now() });

      // 오프라인 → 온라인 전환 시 큐 처리 트리거
      if (!prev && connected) {
        // submitQueue의 processQueue를 동적 import로 호출 (순환 참조 방지)
        import('./submitQueue').then(({ useSubmitQueue }) => {
          useSubmitQueue.getState().processQueue();
        });
      }
    });
    return unsubscribe;
  },
}));

export default useNetworkStore;
