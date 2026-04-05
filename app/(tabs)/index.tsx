// Design Ref: mockup/screens/home.html + home-submitted.html
// 홈 탭 — 오늘의 조사 진행률 + 할당 목록 / 제출 현황
import StatusBadge, { getStatusBadgeType } from '@/components/StatusBadge';
import useAssignmentStore from '@/lib/store/assignments';
import useAuthStore from '@/lib/store/auth';
import { useSubmitQueue } from '@/lib/offline';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { Assignment } from '@/lib/api/types';

/** surveyedAt이 배열([2026,4,2,0,0]) 또는 문자열일 수 있음 */
function formatDate(val: any): string {
  if (!val) return '';
  if (Array.isArray(val)) {
    const [y, m, d, h, min] = val;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} ${String(h ?? 0).padStart(2, '0')}:${String(min ?? 0).padStart(2, '0')}`;
  }
  return String(val).replace('T', ' ').slice(0, 16);
}

// ─── Sync Pending Banner ───────────────────────────────────────
function SyncPendingBanner() {
  const queue = useSubmitQueue((s) => s.queue);
  const processQueue = useSubmitQueue((s) => s.processQueue);
  const pending = queue.filter((q) => q.status !== 'failed');
  if (pending.length === 0) return null;
  return (
    <Pressable style={s.syncBanner} onPress={processQueue}>
      <Ionicons name="sync-outline" size={16} color="#228be6" />
      <Text style={s.syncText}>동기화 대기 {pending.length}건</Text>
      <Text style={s.syncRetry}>탭하여 동기화</Text>
    </Pressable>
  );
}

// ─── Progress Card ─────────────────────────────────────────────
function ProgressCard() {
  const assignments = useAssignmentStore((s) => s.assignments);
  const total = assignments.length;
  const completed = assignments.filter((a) => a.resultId !== null).length;
  const remaining = total - completed;
  const rate = total > 0 ? completed / total : 0;
  return (
    <View style={s.progressCard}>
      <View style={s.progressTop}>
        <Text style={s.progressTitle}>오늘의 조사</Text>
        <Text style={s.progressCount}>{completed}/{total}</Text>
      </View>
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: `${Math.round(rate * 100)}%` }]} />
      </View>
      <View style={s.progressLabels}>
        <Text style={s.progressLabel}>완료 {completed}</Text>
        <Text style={s.progressLabel}>남은 {remaining}</Text>
      </View>
    </View>
  );
}

// ─── Rejected Banner ───────────────────────────────────────────
function RejectedBanner() {
  const count = useAssignmentStore((s) => s.rejected.length);
  if (count === 0) return null;
  return (
    <Pressable style={s.rejectedBanner}>
      <Text style={s.rejectedText}>⚠ 반려 {count}건 - 재조사 필요</Text>
      <Text style={s.rejectedArrow}>›</Text>
    </Pressable>
  );
}

// ─── Segment Tabs ──────────────────────────────────────────────
function SegmentTabs({ active, onChange }: { active: number; onChange: (i: number) => void }) {
  return (
    <View style={s.tabs}>
      <Pressable style={[s.tab, active === 0 && s.tabActive]} onPress={() => onChange(0)}>
        <Text style={[s.tabText, active === 0 && s.tabTextActive]}>할당 목록</Text>
      </Pressable>
      <Pressable style={[s.tab, active === 1 && s.tabActive]} onPress={() => onChange(1)}>
        <Text style={[s.tabText, active === 1 && s.tabTextActive]}>제출 현황</Text>
      </Pressable>
    </View>
  );
}

// ─── Search Bar ────────────────────────────────────────────────
function SearchBar() {
  const setSearchQuery = useAssignmentStore((s) => s.setSearchQuery);
  return (
    <View style={s.searchBar}>
      <Ionicons name="search" size={14} color="#adb5bd" />
      <TextInput
        style={s.searchInput}
        placeholder="주소로 검색"
        placeholderTextColor="#ced4da"
        onChangeText={setSearchQuery}
      />
    </View>
  );
}

// ─── Assignment Card (할당 목록) ───────────────────────────────
function AssignmentCard({ item, onPress }: { item: Assignment; onPress?: () => void }) {
  const badgeType = getStatusBadgeType(item.resultId, item.resultStatus);
  const shortAddr = item.address?.split(' ').slice(-1)[0] ?? item.address;
  return (
    <Pressable style={s.card} onPress={onPress}>
      <View style={s.cardRow}>
        <StatusBadge type={badgeType} />
        <Text style={s.cardAddr}>{shortAddr}</Text>
      </View>
      <View style={s.cardMeta}>
        {item.riskGrade && <StatusBadge type={item.riskGrade as any} />}
      </View>
    </Pressable>
  );
}

// ─── Result Card (제출 현황) ───────────────────────────────────
function ResultCard({ item, onResurvey }: { item: Assignment; onResurvey?: () => void }) {
  const badgeType = getStatusBadgeType(item.resultId, item.resultStatus);
  const shortAddr = item.address?.split(' ').slice(-1)[0] ?? item.address;
  const summary = [item.surveyorOpinion, item.cropType, item.cropCondition].filter(Boolean).join(' · ');
  const isRejected = item.resultStatus === 'REJECTED';

  return (
    <View style={[s.card, isRejected && s.cardRejected]}>
      <View style={s.cardRow}>
        <StatusBadge type={badgeType} />
        <Text style={s.cardAddr}>{shortAddr}</Text>
      </View>
      {isRejected && item.reviewComment ? (
        <Text style={s.rejectedReason}>사유: {item.reviewComment}</Text>
      ) : summary ? (
        <Text style={s.cardSummary}>{summary}</Text>
      ) : null}
      {item.surveyedAt && (
        <Text style={s.cardDate}>제출: {formatDate(item.surveyedAt)}</Text>
      )}
      {isRejected && onResurvey && (
        <Pressable style={s.resurveyBtn} onPress={onResurvey}>
          <Text style={s.resurveyBtnText}>재조사</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Status Counts (제출 현황 탭 상단) ─────────────────────────
function StatusCounts() {
  const assignments = useAssignmentStore((s) => s.assignments);
  const rejected = useAssignmentStore((s) => s.rejected);
  const submitted = assignments.filter((a) => a.resultId && a.resultStatus && a.resultStatus !== 'DRAFT');
  const counts = {
    submitted: submitted.filter((a) => a.resultStatus === 'SUBMITTED').length,
    reviewing: submitted.filter((a) => a.resultStatus === 'REVIEWING').length,
    approved: submitted.filter((a) => a.resultStatus === 'APPROVED').length,
    rejected: rejected.length,
  };
  const items = [
    { label: '제출완료', count: counts.submitted, bg: '#e7f5ff', color: '#228be6' },
    { label: '검수중', count: counts.reviewing, bg: '#f3f0ff', color: '#7048e8' },
    { label: '승인', count: counts.approved, bg: '#ebfbee', color: '#2b8a3e' },
    { label: '반려', count: counts.rejected, bg: '#fff4e6', color: '#e8590c' },
  ];
  return (
    <View style={s.statusCounts}>
      {items.map((it) => (
        <View key={it.label} style={[s.statusCount, { backgroundColor: it.bg }]}>
          <Text style={[s.statusNum, { color: it.color }]}>{it.count}</Text>
          <Text style={s.statusLabel}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────
export default function HomeScreen() {
  const [tab, setTab] = useState(0);
  const isLoading = useAssignmentStore((s) => s.isLoading);
  const fetchMyAssignments = useAssignmentStore((s) => s.fetchMyAssignments);
  const fetchRejected = useAssignmentStore((s) => s.fetchRejected);
  const assignments = useAssignmentStore((s) => s.assignments);
  const searchQuery = useAssignmentStore((s) => s.searchQuery);
  const rejected = useAssignmentStore((s) => s.rejected);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const refresh = useCallback(() => {
    fetchMyAssignments();
    fetchRejected();
  }, [fetchMyAssignments, fetchRejected]);

  useEffect(() => { refresh(); }, [refresh]);

  const q = searchQuery.trim().toLowerCase();
  const filteredList = q
    ? assignments.filter((a) => a.address?.toLowerCase().includes(q))
    : assignments;

  const listData = tab === 0
    ? filteredList.filter((a) => !a.resultId || a.resultStatus === 'DRAFT')
    : [
        ...assignments.filter((a) => a.resultId && a.resultStatus && a.resultStatus !== 'DRAFT'),
        ...rejected,
      ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>안녕하세요, {user?.userName ?? '조사원'}님</Text>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item, index) => `${tab}-${item.assignmentId}-${item.resultId}-${index}`}
        renderItem={({ item }) => tab === 0
          ? <AssignmentCard item={item} onPress={() => router.push(`/survey/${item.assignmentId}`)} />
          : <ResultCard item={item} onResurvey={item.resultStatus === 'REJECTED' ? () => router.push(`/survey/${item.assignmentId}`) : undefined} />
        }
        contentContainerStyle={s.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor="#228be6" />}
        ListHeaderComponent={
          <>
            <SyncPendingBanner />
            <ProgressCard />
            <RejectedBanner />
            <SegmentTabs active={tab} onChange={setTab} />
            <SearchBar />
            {tab === 1 && <StatusCounts />}
          </>
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyText}>{isLoading ? '' : tab === 0 ? '할당된 조사가 없습니다' : '제출 내역이 없습니다'}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { paddingHorizontal: 24, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#212529' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },

  // Progress Card
  progressCard: { backgroundColor: '#e7f5ff', borderRadius: 12, padding: 16, marginBottom: 16 },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  progressTitle: { fontSize: 17, fontWeight: '600', color: '#212529' },
  progressCount: { fontSize: 20, fontWeight: '700', color: '#228be6' },
  progressBar: { height: 8, backgroundColor: '#e9ecef', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#228be6', borderRadius: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 13, color: '#868e96' },

  // Rejected Banner
  rejectedBanner: {
    backgroundColor: '#fff4e6', borderLeftWidth: 3, borderLeftColor: '#fd7e14',
    borderRadius: 6, padding: 12, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  rejectedText: { fontSize: 14, fontWeight: '600', color: '#343a40' },
  rejectedArrow: { fontSize: 18, color: '#fd7e14' },

  // Segment Tabs
  tabs: { flexDirection: 'row', backgroundColor: '#f1f3f5', borderRadius: 8, padding: 3, marginBottom: 16 },
  tab: { flex: 1, height: 36, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#adb5bd' },
  tabTextActive: { color: '#212529' },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', height: 40, backgroundColor: '#f1f3f5', borderRadius: 20, paddingHorizontal: 14, gap: 8, marginBottom: 16 },
  searchInput: { flex: 1, fontSize: 14, color: '#212529' },

  // Status Counts
  statusCounts: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statusCount: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  statusNum: { fontSize: 20, fontWeight: '700' },
  statusLabel: { fontSize: 12, color: '#868e96', marginTop: 2 },

  // Cards
  card: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e9ecef',
    padding: 16, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2,
  },
  cardRejected: { borderLeftWidth: 3, borderLeftColor: '#fd7e14', backgroundColor: '#fff4e6' },
  cardRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 4 },
  cardAddr: { fontSize: 16, fontWeight: '500', color: '#212529' },
  cardMeta: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  cardSummary: { fontSize: 13, color: '#868e96' },
  cardDate: { fontSize: 12, color: '#ced4da', marginTop: 4 },
  rejectedReason: { fontSize: 13, color: '#fd7e14', fontWeight: '500', marginTop: 6 },
  resurveyBtn: { marginTop: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#228be6', alignItems: 'center' },
  resurveyBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  syncBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#e7f5ff', borderRadius: 10, padding: 12, marginBottom: 12,
  },
  syncText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1864ab' },
  syncRetry: { fontSize: 13, color: '#228be6' },

  // Empty
  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#adb5bd' },
});
