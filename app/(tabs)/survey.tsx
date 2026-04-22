// Design Ref: home-survey-ux.design.md §5.2 — 조사 탭
// 역할: 전체 작업 목록 (미완료 / 제출현황 세그먼트)
import { AssignmentCard, ResultCard } from '@/components/survey/AssignmentCard';
import useAssignmentStore from '@/lib/store/assignments';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Assignment } from '@/lib/api/types';

// ─── Segment Control ──────────────────────────────────────────
function SegmentControl({ active, onChange }: { active: number; onChange: (i: number) => void }) {
  return (
    <View style={s.segment}>
      <Pressable style={[s.segBtn, active === 0 && s.segBtnActive]} onPress={() => onChange(0)}>
        <Text style={[s.segText, active === 0 && s.segTextActive]}>미완료</Text>
      </Pressable>
      <Pressable style={[s.segBtn, active === 1 && s.segBtnActive]} onPress={() => onChange(1)}>
        <Text style={[s.segText, active === 1 && s.segTextActive]}>제출현황</Text>
      </Pressable>
    </View>
  );
}

// ─── Search Bar ───────────────────────────────────────────────
function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={s.searchBar}>
      <Ionicons name="search" size={14} color="#adb5bd" />
      <TextInput
        style={s.searchInput}
        placeholder="주소로 검색"
        placeholderTextColor="#ced4da"
        value={value}
        onChangeText={onChange}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChange('')} hitSlop={8}>
          <Ionicons name="close-circle" size={16} color="#ced4da" />
        </Pressable>
      )}
    </View>
  );
}

// ─── Status Summary (제출현황 탭 상단) ────────────────────────
function StatusSummary({ assignments, rejected }: { assignments: Assignment[]; rejected: Assignment[] }) {
  const submitted = assignments.filter((a) => a.resultId && a.resultStatus && a.resultStatus !== 'DRAFT');
  const counts = [
    { label: '제출완료', value: submitted.filter((a) => a.resultStatus === 'SUBMITTED').length, bg: '#e7f5ff', color: '#228be6' },
    { label: '검수중', value: submitted.filter((a) => a.resultStatus === 'UNDER_REVIEW').length, bg: '#f3f0ff', color: '#7048e8' },
    { label: '승인', value: submitted.filter((a) => a.resultStatus === 'APPROVED').length, bg: '#ebfbee', color: '#2b8a3e' },
    { label: '반려', value: rejected.length, bg: '#fff4e6', color: '#e8590c' },
  ];
  return (
    <View style={s.statusSummary}>
      {counts.map((c) => (
        <View key={c.label} style={[s.statusItem, { backgroundColor: c.bg }]}>
          <Text style={[s.statusValue, { color: c.color }]}>{c.value}</Text>
          <Text style={s.statusLabel}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────
export default function SurveyTab() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');

  const assignments = useAssignmentStore((s) => s.assignments);
  const rejected = useAssignmentStore((s) => s.rejected);
  const isLoading = useAssignmentStore((s) => s.isLoading);
  const fetchMyAssignments = useAssignmentStore((s) => s.fetchMyAssignments);
  const fetchRejected = useAssignmentStore((s) => s.fetchRejected);
  const setSelectedAssignment = useAssignmentStore((s) => s.setSelectedAssignment);
  const router = useRouter();

  const refresh = useCallback(() => {
    fetchMyAssignments();
    fetchRejected();
  }, [fetchMyAssignments, fetchRejected]);

  useEffect(() => { refresh(); }, [refresh]);

  const q = search.trim().toLowerCase();

  const pendingList = useMemo(() => {
    const drafts = assignments.filter((a) => a.resultStatus === 'DRAFT');
    const unsurveyed = assignments.filter((a) => !a.resultId);
    const list = [...drafts, ...unsurveyed];
    return q ? list.filter((a) => a.address?.toLowerCase().includes(q)) : list;
  }, [assignments, q]);

  const submittedList = useMemo(() => {
    const list = [
      ...assignments.filter((a) => a.resultId && a.resultStatus && a.resultStatus !== 'DRAFT'),
      ...rejected,
    ];
    return q ? list.filter((a) => a.address?.toLowerCase().includes(q)) : list;
  }, [assignments, rejected, q]);

  const listData = tab === 0 ? pendingList : submittedList;

  const handleMapPress = useCallback((item: Assignment) => {
    setSelectedAssignment(item.assignmentId);
    router.push('/(tabs)/map');
  }, [setSelectedAssignment, router]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>조사</Text>
        <Text style={s.headerCount}>{listData.length}건</Text>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item, idx) => `${tab}-${item.assignmentId}-${item.resultId ?? 'n'}-${idx}`}
        renderItem={({ item }) =>
          tab === 0 ? (
            <AssignmentCard
              item={item}
              onPress={() => router.push(`/survey/${item.assignmentId}`)}
              onMapPress={() => handleMapPress(item)}
            />
          ) : (
            <ResultCard
              item={item}
              onResurvey={item.resultStatus === 'REJECTED' ? () => router.push(`/survey/${item.assignmentId}`) : undefined}
              onMapPress={() => handleMapPress(item)}
            />
          )
        }
        contentContainerStyle={s.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor="#228be6" />}
        ListHeaderComponent={
          <View>
            <SegmentControl active={tab} onChange={setTab} />
            <SearchBar value={search} onChange={setSearch} />
            {tab === 1 && <StatusSummary assignments={assignments} rejected={rejected} />}
          </View>
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="checkmark-circle-outline" size={48} color="#ced4da" />
            <Text style={s.emptyTitle}>
              {tab === 0 ? '모든 조사를 완료했습니다' : '제출 내역이 없습니다'}
            </Text>
            <Text style={s.emptySub}>
              {tab === 0 ? '새로운 할당이 오면 여기에 표시됩니다' : '조사를 완료하고 제출해보세요'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#212529' },
  headerCount: { fontSize: 14, fontWeight: '600', color: '#228be6' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },

  // Segment
  segment: {
    flexDirection: 'row', backgroundColor: '#f1f3f5', borderRadius: 10,
    padding: 3, marginHorizontal: 16, marginBottom: 12,
  },
  segBtn: { flex: 1, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  segBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1,
  },
  segText: { fontSize: 14, fontWeight: '600', color: '#adb5bd' },
  segTextActive: { color: '#212529' },

  // Search Bar
  searchBar: {
    flexDirection: 'row', alignItems: 'center', height: 40,
    backgroundColor: '#f1f3f5', borderRadius: 20, paddingHorizontal: 14,
    gap: 8, marginHorizontal: 16, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#212529' },

  // Status Summary
  statusSummary: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 12 },
  statusItem: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  statusValue: { fontSize: 20, fontWeight: '700' },
  statusLabel: { fontSize: 12, color: '#868e96', marginTop: 2 },

  // Empty
  empty: { paddingVertical: 80, alignItems: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#495057', marginTop: 16 },
  emptySub: { fontSize: 14, color: '#adb5bd', marginTop: 4 },
});
