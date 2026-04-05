// Design Ref: §4 — 오프라인 배너
// Plan SC: SC-4 오프라인 상태 표시
import { useNetworkStore } from '@/lib/offline/networkStatus';
import { useSubmitQueue } from '@/lib/offline/submitQueue';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function OfflineBanner() {
  const isConnected = useNetworkStore((s) => s.isConnected);
  const queue = useSubmitQueue((s) => s.queue);
  const retryFailed = useSubmitQueue((s) => s.retryFailed);

  const pendingCount = queue.filter((q) => q.status === 'pending' || q.status === 'uploading').length;
  const failedCount = queue.filter((q) => q.status === 'failed').length;

  if (isConnected && pendingCount === 0 && failedCount === 0) return null;

  return (
    <View style={[s.banner, !isConnected ? s.offline : failedCount > 0 ? s.failed : s.syncing]}>
      <Ionicons
        name={!isConnected ? 'cloud-offline-outline' : failedCount > 0 ? 'alert-circle-outline' : 'sync-outline'}
        size={16}
        color={!isConnected ? '#e8590c' : failedCount > 0 ? '#fa5252' : '#228be6'}
      />
      <Text style={s.text}>
        {!isConnected
          ? `오프라인 — 데이터는 자동 저장됩니다${pendingCount > 0 ? ` (대기 ${pendingCount}건)` : ''}`
          : failedCount > 0
            ? `동기화 실패 ${failedCount}건`
            : `동기화 중 ${pendingCount}건`}
      </Text>
      {failedCount > 0 && isConnected && (
        <Pressable onPress={retryFailed} hitSlop={8}>
          <Text style={s.retry}>재시도</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  offline: { backgroundColor: '#fff4e6' },
  syncing: { backgroundColor: '#e7f5ff' },
  failed: { backgroundColor: '#fff5f5' },
  text: { flex: 1, fontSize: 13, fontWeight: '500', color: '#343a40' },
  retry: { fontSize: 13, fontWeight: '600', color: '#228be6' },
});
