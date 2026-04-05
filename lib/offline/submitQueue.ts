// Design Ref: §3 — 제출 큐 관리
// Plan SC: SC-1 오프라인 제출→큐, SC-2 자동 동기화, SC-3 사진 재시도
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { submitResult, uploadPhoto } from '@/lib/api/survey';
import type { SurveyResultInput } from '@/lib/api/types';
import type { PhotoEntry } from '@/lib/store/surveyForm';
import Toast from 'react-native-toast-message';

const QUEUE_KEY = 'offline_submit_queue';
const MAX_RETRIES = 5;
const BACKOFF_MS = [0, 5000, 15000, 30000, 60000];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface QueueItem {
  id: string;
  assignmentId: number;
  body: SurveyResultInput;
  photos: PhotoEntry[];
  createdAt: number;
  retryCount: number;
  status: 'pending' | 'uploading' | 'failed';
}

interface SubmitQueueState {
  queue: QueueItem[];
  isProcessing: boolean;

  enqueue: (assignmentId: number, body: SurveyResultInput, photos: PhotoEntry[]) => Promise<void>;
  processQueue: () => Promise<void>;
  dequeue: (id: string) => Promise<void>;
  loadQueue: () => Promise<void>;
  retryFailed: () => Promise<void>;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function persistQueue(queue: QueueItem[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export const useSubmitQueue = create<SubmitQueueState>((set, get) => ({
  queue: [],
  isProcessing: false,

  enqueue: async (assignmentId, body, photos) => {
    const item: QueueItem = {
      id: generateId(),
      assignmentId,
      body,
      photos,
      createdAt: Date.now(),
      retryCount: 0,
      status: 'pending',
    };
    const queue = [...get().queue, item];
    set({ queue });
    await persistQueue(queue);

    Toast.show({ type: 'info', text1: '오프라인 저장됨', text2: '네트워크 복귀 시 자동 제출됩니다' });

    // 즉시 처리 시도
    get().processQueue();
  },

  processQueue: async () => {
    const { queue, isProcessing } = get();
    if (isProcessing) return;

    const pending = queue.filter((q) => q.status === 'pending');
    if (pending.length === 0) return;

    set({ isProcessing: true });
    let successCount = 0;
    let failCount = 0;

    for (const item of pending) {
      try {
        // 지수 백오프 대기
        const backoff = BACKOFF_MS[Math.min(item.retryCount, BACKOFF_MS.length - 1)];
        if (backoff > 0) await delay(backoff);

        // 상태 업데이트
        set({
          queue: get().queue.map((q) =>
            q.id === item.id ? { ...q, status: 'uploading' as const } : q
          ),
        });

        // 조사 결과 제출
        const res = await submitResult(item.body);
        if (!res.success) throw new Error(res.message);

        const resultId = res.data;

        // 사진 업로드
        for (const photo of item.photos) {
          try {
            await uploadPhoto(resultId, photo.photoType, photo.uri);
          } catch (e) {
            if (__DEV__) console.warn('[Queue] photo upload failed:', photo.photoType, e);
          }
        }

        // 성공 → 큐에서 제거
        await get().dequeue(item.id);
        successCount++;
      } catch (e) {
        // 실패 → 재시도 카운트 증가
        const newRetry = item.retryCount + 1;
        set({
          queue: get().queue.map((q) =>
            q.id === item.id
              ? { ...q, retryCount: newRetry, status: newRetry >= MAX_RETRIES ? 'failed' as const : 'pending' as const }
              : q
          ),
        });
        await persistQueue(get().queue);
        failCount++;

        if (__DEV__) console.warn('[Queue] submit failed:', e);

        // 네트워크 에러면 나머지 큐도 실패할 것이므로 중단
        if (String(e).includes('Network') || String(e).includes('fetch')) break;
      }
    }

    set({ isProcessing: false });

    if (successCount > 0) {
      Toast.show({ type: 'success', text1: `${successCount}건 동기화 완료` });
    }
    if (failCount > 0 && successCount === 0) {
      // 전부 실패는 아직 오프라인 — silent
    }
  },

  dequeue: async (id) => {
    const queue = get().queue.filter((q) => q.id !== id);
    set({ queue });
    await persistQueue(queue);
  },

  loadQueue: async () => {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      if (raw) {
        const queue: QueueItem[] = JSON.parse(raw);
        // uploading 상태는 pending으로 복원 (앱 재시작)
        set({ queue: queue.map((q) => q.status === 'uploading' ? { ...q, status: 'pending' as const } : q) });
      }
    } catch {}
  },

  retryFailed: async () => {
    set({
      queue: get().queue.map((q) =>
        q.status === 'failed' ? { ...q, status: 'pending' as const, retryCount: 0 } : q
      ),
    });
    await persistQueue(get().queue);
    get().processQueue();
  },
}));

export default useSubmitQueue;
