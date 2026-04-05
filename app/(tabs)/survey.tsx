// 조사 탭 — 진행중/임시저장 목록 + 미조사 할당 목록
// 3개 진입점 통일: 홈 카드 탭 / 지도 조사 시작 / 조사 탭 직접 선택
import StatusBadge, { getStatusBadgeType } from '@/components/StatusBadge';
import useAssignmentStore from '@/lib/store/assignments';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Assignment } from '@/lib/api/types';

function SurveyCard({ item, onPress }: { item: Assignment; onPress: () => void }) {
  const badgeType = getStatusBadgeType(item.resultId, item.resultStatus);
  const shortAddr = item.address?.split(' ').slice(-1)[0] ?? item.address;
  const isDraft = item.resultStatus === 'DRAFT';

  return (
    <Pressable style={[s.card, isDraft && s.cardDraft]} onPress={onPress}>
      <View style={s.cardRow}>
        <StatusBadge type={badgeType} />
        <Text style={s.cardAddr} numberOfLines={1}>{shortAddr}</Text>
        <Ionicons name="chevron-forward" size={16} color="#ced4da" />
      </View>
      <View style={s.cardMeta}>
        {item.riskGrade && <StatusBadge type={item.riskGrade as any} />}
        <Text style={s.cardAddrFull} numberOfLines={1}>{item.address}</Text>
      </View>
      {isDraft && (
        <View style={s.draftBanner}>
          <Ionicons name="document-text-outline" size={14} color="#228be6" />
          <Text style={s.draftText}>임시저장 — 이어서 작성</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function SurveyTab() {
  const assignments = useAssignmentStore((s) => s.assignments);
  const isLoading = useAssignmentStore((s) => s.isLoading);
  const fetchMyAssignments = useAssignmentStore((s) => s.fetchMyAssignments);
  const router = useRouter();

  useEffect(() => { fetchMyAssignments(); }, []);

  const refresh = useCallback(() => { fetchMyAssignments(); }, [fetchMyAssignments]);

  // 임시저장(DRAFT) → 미조사 순으로 정렬
  const surveyList = useMemo(() => {
    const drafts = assignments.filter((a) => a.resultStatus === 'DRAFT');
    const unsurveyed = assignments.filter((a) => !a.resultId);
    return [...drafts, ...unsurveyed];
  }, [assignments]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>조사</Text>
        <Text style={s.headerCount}>{surveyList.length}건</Text>
      </View>

      {/* 세그먼트 라벨 */}
      <View style={s.sectionHeader}>
        <View style={s.sectionDot} />
        <Text style={s.sectionLabel}>
          임시저장 {assignments.filter((a) => a.resultStatus === 'DRAFT').length}건
          {'  ·  '}
          미조사 {assignments.filter((a) => !a.resultId).length}건
        </Text>
      </View>

      <FlatList
        data={surveyList}
        keyExtractor={(item) => `survey-${item.assignmentId}`}
        renderItem={({ item }) => (
          <SurveyCard
            item={item}
            onPress={() => router.push(`/survey/${item.assignmentId}`)}
          />
        )}
        contentContainerStyle={s.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor="#228be6" />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="checkmark-circle-outline" size={48} color="#ced4da" />
            <Text style={s.emptyTitle}>모든 조사를 완료했습니다</Text>
            <Text style={s.emptySub}>새로운 할당이 오면 여기에 표시됩니다</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#212529' },
  headerCount: { fontSize: 14, fontWeight: '600', color: '#228be6' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingBottom: 8 },
  sectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#228be6' },
  sectionLabel: { fontSize: 13, color: '#868e96' },

  listContent: { paddingHorizontal: 16, paddingBottom: 24 },

  card: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e9ecef',
    padding: 16, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardDraft: { borderLeftWidth: 3, borderLeftColor: '#228be6' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardAddr: { flex: 1, fontSize: 16, fontWeight: '600', color: '#212529' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  cardAddrFull: { flex: 1, fontSize: 12, color: '#adb5bd' },
  draftBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e7f5ff',
  },
  draftText: { fontSize: 13, color: '#228be6', fontWeight: '500' },

  empty: { paddingVertical: 80, alignItems: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#495057', marginTop: 16 },
  emptySub: { fontSize: 14, color: '#adb5bd', marginTop: 4 },
});
