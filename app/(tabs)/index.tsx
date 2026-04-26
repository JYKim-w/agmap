// Design Ref: home-survey-ux.design.md §5.1 — 홈 탭 대시보드
// 역할: 현황 파악 (Read-only). 배정 목록 없음.
import useAssignmentStore from '@/lib/store/assignments';
import useAuthStore from '@/lib/store/auth';
import useNoticesStore, { selectPinnedNotice } from '@/lib/store/notices';
import { useSubmitQueue } from '@/lib/offline';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { Notice } from '@/lib/api/types';

const NOTICE_TYPE_COLOR: Record<string, { bg: string; color: string; label: string }> = {
  URGENT:  { bg: '#fff0f0', color: '#fa5252', label: '긴급' },
  GUIDE:   { bg: '#e7f5ff', color: '#228be6', label: '안내' },
  GENERAL: { bg: '#f1f3f5', color: '#495057', label: '공지' },
};

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

// ─── Pinned Notice Banner ──────────────────────────────────────
function PinnedNoticeBanner({ notice }: { notice: Notice }) {
  const router = useRouter();
  const theme = NOTICE_TYPE_COLOR[notice.noticeType] ?? NOTICE_TYPE_COLOR.GENERAL;
  return (
    <Pressable
      style={[s.noticeBanner, { backgroundColor: theme.bg, borderLeftColor: theme.color }]}
      onPress={() => router.push(`/notice/${notice.id}` as any)}
    >
      <View style={s.noticeRow}>
        <View style={[s.noticeTypeBadge, { backgroundColor: theme.color }]}>
          <Text style={s.noticeTypeText}>{theme.label}</Text>
        </View>
        <Text style={[s.noticeTitle, { color: theme.color }]} numberOfLines={1}>
          {notice.title}
        </Text>
        <Ionicons name="pin" size={14} color={theme.color} />
      </View>
    </Pressable>
  );
}

// ─── Rejected Banner ───────────────────────────────────────────
function RejectedBanner() {
  const count = useAssignmentStore((s) => s.rejected.length);
  const router = useRouter();
  if (count === 0) return null;
  return (
    <Pressable
      style={s.rejectedBanner}
      onPress={() => router.push('/(tabs)/survey')}
    >
      <Ionicons name="warning-outline" size={16} color="#e67700" />
      <Text style={s.rejectedText}>반려 {count}건 — 재조사 필요</Text>
      <Text style={s.rejectedArrow}>›</Text>
    </Pressable>
  );
}

// ─── KPI Cards ────────────────────────────────────────────────
function KpiCards() {
  const assignments = useAssignmentStore((s) => s.assignments);
  const rejected = useAssignmentStore((s) => s.rejected);

  const total = assignments.length;
  const completed = assignments.filter((a) => !!a.resultId && a.resultStatus !== 'DRAFT').length;
  const inProgress = assignments.filter((a) => !!a.resultId && a.resultStatus === 'DRAFT').length;
  const remaining = assignments.filter((a) => !a.resultId).length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const kpis = [
    { label: '전체', value: total, color: '#495057', bg: '#f8f9fa' },
    { label: '미조사', value: remaining, color: '#228be6', bg: '#e7f5ff' },
    { label: '임시저장', value: inProgress, color: '#7048e8', bg: '#f3f0ff' },
    { label: '완료', value: completed, color: '#2b8a3e', bg: '#ebfbee' },
  ];

  return (
    <View style={s.kpiSection}>
      <View style={s.kpiHeader}>
        <Text style={s.kpiTitle}>배정 현황</Text>
        <Text style={s.kpiRate}>완료율 {rate}%</Text>
      </View>
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: `${rate}%` }]} />
      </View>
      <View style={s.kpiRow}>
        {kpis.map((k) => (
          <View key={k.label} style={[s.kpiCard, { backgroundColor: k.bg }]}>
            <Text style={[s.kpiValue, { color: k.color }]}>{k.value}</Text>
            <Text style={s.kpiLabel}>{k.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Stats Widget (이번주 실적) ────────────────────────────────
function StatsWidget() {
  const assignments = useAssignmentStore((s) => s.assignments);
  const submitted = assignments.filter(
    (a) => a.resultId && a.resultStatus && ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED'].includes(a.resultStatus)
  ).length;

  return (
    <View style={s.statsCard}>
      <Text style={s.statsTitle}>이번주 실적</Text>
      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statValue}>{submitted}</Text>
          <Text style={s.statLabel}>제출</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={[s.statValue, { color: '#2b8a3e' }]}>
            {assignments.filter((a) => a.resultStatus === 'APPROVED').length}
          </Text>
          <Text style={s.statLabel}>승인</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={[s.statValue, { color: '#fa5252' }]}>
            {assignments.filter((a) => a.resultStatus === 'REJECTED').length}
          </Text>
          <Text style={s.statLabel}>반려</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Due Soon List ────────────────────────────────────────────
function DueSoonList() {
  const assignments = useAssignmentStore((s) => s.assignments);
  const router = useRouter();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueSoon = assignments
    .filter((a) => {
      if (!a.dueDate) return false;
      if (!!a.resultId && a.resultStatus !== 'DRAFT') return false; // 이미 제출됨
      const due = new Date(a.dueDate);
      due.setHours(0, 0, 0, 0);
      const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
      return diff <= 7; // 7일 이내 + 기한 초과
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  if (dueSoon.length === 0) return null;

  return (
    <View style={s.dueCard}>
      <View style={s.dueHeader}>
        <Ionicons name="time-outline" size={16} color="#fa5252" />
        <Text style={s.dueTitle}>기한 임박</Text>
        <Text style={s.dueCount}>{dueSoon.length}건</Text>
      </View>
      {dueSoon.map((item) => {
        const due = new Date(item.dueDate);
        due.setHours(0, 0, 0, 0);
        const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
        const label = diff === 0 ? 'D-Day' : diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
        const color = diff < 0 ? '#fa5252' : diff <= 3 ? '#fd7e14' : '#f08c00';
        const isDraft = item.resultStatus === 'DRAFT';
        return (
          <Pressable
            key={item.assignmentId}
            style={s.dueRow}
            onPress={() => router.push(`/survey/${item.assignmentId}` as any)}
          >
            <View style={[s.dueDday, { borderColor: color }]}>
              <Text style={[s.dueDdayText, { color }]}>{label}</Text>
            </View>
            <Text style={s.dueAddr} numberOfLines={1}>{item.address}</Text>
            {isDraft && (
              <View style={s.dueDraftTag}>
                <Text style={s.dueDraftText}>임시저장</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={14} color="#ced4da" />
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── CTA Button ───────────────────────────────────────────────
function CtaButton() {
  const router = useRouter();
  return (
    <Pressable style={s.ctaBtn} onPress={() => router.push('/(tabs)/survey')}>
      <Ionicons name="clipboard-outline" size={18} color="#fff" />
      <Text style={s.ctaBtnText}>조사 시작하기</Text>
      <Ionicons name="chevron-forward" size={18} color="#fff" />
    </Pressable>
  );
}

// ─── Main Screen ───────────────────────────────────────────────
export default function HomeScreen() {
  const fetchMyAssignments = useAssignmentStore((s) => s.fetchMyAssignments);
  const fetchRejected = useAssignmentStore((s) => s.fetchRejected);
  const fetchNotices = useNoticesStore((s) => s.fetch);
  const pinnedNotice = useNoticesStore(selectPinnedNotice);
  const user = useAuthStore((s) => s.user);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchMyAssignments(), fetchRejected(), fetchNotices()]);
    setIsRefreshing(false);
  }, [fetchMyAssignments, fetchRejected, fetchNotices]);

  useEffect(() => {
    fetchMyAssignments();
    fetchRejected();
    fetchNotices();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>안녕하세요, {user?.userName ?? '조사원'}님</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#228be6" />}
      >
        <SyncPendingBanner />
        {pinnedNotice && <PinnedNoticeBanner notice={pinnedNotice} />}
        <RejectedBanner />
        <KpiCards />
        <DueSoonList />
        <StatsWidget />
        <CtaButton />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { paddingHorizontal: 24, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#212529' },
  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },

  // Sync Banner
  syncBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#e7f5ff', borderRadius: 10, padding: 12,
  },
  syncText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1864ab' },
  syncRetry: { fontSize: 13, color: '#228be6' },

  // Notice Banner
  noticeBanner: {
    borderRadius: 10, padding: 12, borderLeftWidth: 3,
  },
  noticeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noticeTypeBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  noticeTypeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  noticeTitle: { flex: 1, fontSize: 14, fontWeight: '600' },

  // Rejected Banner
  rejectedBanner: {
    backgroundColor: '#fff4e6', borderLeftWidth: 3, borderLeftColor: '#fd7e14',
    borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  rejectedText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#343a40' },
  rejectedArrow: { fontSize: 18, color: '#fd7e14' },

  // KPI Section
  kpiSection: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e9ecef' },
  kpiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  kpiTitle: { fontSize: 16, fontWeight: '700', color: '#212529' },
  kpiRate: { fontSize: 14, fontWeight: '600', color: '#228be6' },
  progressBar: { height: 6, backgroundColor: '#e9ecef', borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', backgroundColor: '#228be6', borderRadius: 3 },
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpiCard: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  kpiValue: { fontSize: 22, fontWeight: '700' },
  kpiLabel: { fontSize: 12, color: '#868e96', marginTop: 2 },

  // Due Soon Card
  dueCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e9ecef' },
  dueHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  dueTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#212529' },
  dueCount: { fontSize: 13, fontWeight: '600', color: '#fa5252' },
  dueRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 9,
    borderTopWidth: 1, borderTopColor: '#f1f3f5',
  },
  dueDday: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, minWidth: 44, alignItems: 'center' },
  dueDdayText: { fontSize: 11, fontWeight: '700' },
  dueAddr: { flex: 1, fontSize: 14, color: '#343a40' },
  dueDraftTag: { backgroundColor: '#e7f5ff', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  dueDraftText: { fontSize: 11, color: '#228be6', fontWeight: '600' },

  // Stats Card
  statsCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e9ecef' },
  statsTitle: { fontSize: 16, fontWeight: '700', color: '#212529', marginBottom: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700', color: '#212529' },
  statLabel: { fontSize: 12, color: '#868e96', marginTop: 2 },
  statDivider: { width: 1, height: 40, backgroundColor: '#e9ecef' },

  // CTA Button
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#228be6', borderRadius: 12, paddingVertical: 16,
  },
  ctaBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
