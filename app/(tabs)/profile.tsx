// Design Ref: home-survey-ux.design.md §5.4 — 내정보 탭
// 역할: 계정 정보 + 공지사항 목록 (GLOBAL / MANAGER 섹션)
import useAuthStore from '@/lib/store/auth';
import useNoticesStore from '@/lib/store/notices';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo } from 'react';
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
import { router } from 'expo-router';
import type { Notice } from '@/lib/api/types';

const NOTICE_TYPE_COLOR: Record<string, { bg: string; color: string; label: string }> = {
  URGENT:  { bg: '#fff0f0', color: '#fa5252', label: '긴급' },
  GUIDE:   { bg: '#e7f5ff', color: '#228be6', label: '안내' },
  GENERAL: { bg: '#f1f3f5', color: '#495057', label: '공지' },
};

function NoticeItem({ notice }: { notice: Notice }) {
  const theme = NOTICE_TYPE_COLOR[notice.noticeType] ?? NOTICE_TYPE_COLOR.GENERAL;
  const dateStr = notice.createdAt ? notice.createdAt.slice(0, 10) : '';

  const handlePress = () => {
    if (!Number.isNaN(notice.id)) {
      router.push(`/notice/${notice.id}`);
    }
  };

  return (
    <Pressable style={s.noticeItem} onPress={handlePress}>
      <View style={s.noticeHeader}>
        <View style={[s.typeBadge, { backgroundColor: theme.color }]}>
          <Text style={s.typeBadgeText}>{theme.label}</Text>
        </View>
        {notice.pinned && <Ionicons name="pin" size={13} color="#868e96" />}
        <Text style={s.noticeDate}>{dateStr}</Text>
      </View>
      <Text style={s.noticeTitle} numberOfLines={2}>{notice.title}</Text>
    </Pressable>
  );
}

function NoticeSection({ title, notices }: { title: string; notices: Notice[] }) {
  if (notices.length === 0) return null;
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {notices.map((n) => <NoticeItem key={n.id} notice={n} />)}
    </View>
  );
}

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const isLoading = useNoticesStore((s) => s.isLoading);
  const hasMore = useNoticesStore((s) => s.hasMore);
  const fetch = useNoticesStore((s) => s.fetch);
  const fetchMore = useNoticesStore((s) => s.fetchMore);
  const notices = useNoticesStore((s) => s.notices);
  const globalNotices = useMemo(() => notices.filter((n) => n.scope === 'GLOBAL'), [notices]);
  const managerNotices = useMemo(() => notices.filter((n) => n.scope === 'MANAGER'), [notices]);

  useEffect(() => { fetch(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onRefresh = useCallback(() => { fetch(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#228be6" />}
      >
        {/* 프로필 카드 */}
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Ionicons name="person" size={28} color="#228be6" />
          </View>
          <View style={s.profileInfo}>
            <Text style={s.name}>{user?.userName ?? '-'}</Text>
            <Text style={s.role}>{user?.role} · {user?.companyName}</Text>
            <Text style={s.id}>{user?.loginId}</Text>
          </View>
        </View>

        {/* 공지사항 */}
        <View style={s.noticesCard}>
          <Text style={s.cardTitle}>공지사항</Text>
          {isLoading && globalNotices.length === 0 && managerNotices.length === 0 ? (
            <ActivityIndicator color="#228be6" style={{ marginVertical: 24 }} />
          ) : (
            <>
              <NoticeSection title="전체 공지" notices={globalNotices} />
              <NoticeSection title="담당 공지" notices={managerNotices} />
              {globalNotices.length === 0 && managerNotices.length === 0 && (
                <Text style={s.emptyNotice}>공지사항이 없습니다</Text>
              )}
              {hasMore && (
                <Pressable style={s.loadMoreBtn} onPress={fetchMore} disabled={isLoading}>
                  <Text style={s.loadMoreText}>{isLoading ? '불러오는 중...' : '더 불러오기'}</Text>
                </Pressable>
              )}
            </>
          )}
        </View>

        {/* 로그아웃 */}
        <Pressable
          style={s.logoutBtn}
          onPress={async () => {
            await logout();
            router.replace('/login');
          }}
        >
          <Text style={s.logoutText}>로그아웃</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 16, gap: 12, paddingBottom: 32 },

  // Profile Card
  profileCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderWidth: 1, borderColor: '#e9ecef',
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#e7f5ff', alignItems: 'center', justifyContent: 'center',
  },
  profileInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: '#212529' },
  role: { fontSize: 13, color: '#868e96', marginTop: 2 },
  id: { fontSize: 12, color: '#adb5bd', marginTop: 1 },

  // Notices Card
  noticesCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#e9ecef',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#212529', marginBottom: 12 },

  // Section
  section: { marginBottom: 8 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#adb5bd', textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 8, marginTop: 4,
  },

  // Notice Item
  noticeItem: {
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f3f5',
  },
  noticeHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  typeBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  typeBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  noticeDate: { marginLeft: 'auto', fontSize: 11, color: '#adb5bd' },
  noticeTitle: { fontSize: 14, color: '#343a40', lineHeight: 20 },

  emptyNotice: { textAlign: 'center', color: '#adb5bd', fontSize: 14, paddingVertical: 24 },

  loadMoreBtn: {
    marginTop: 8, paddingVertical: 10, borderRadius: 8,
    backgroundColor: '#f1f3f5', alignItems: 'center',
  },
  loadMoreText: { fontSize: 14, color: '#495057', fontWeight: '600' },

  // Logout
  logoutBtn: {
    height: 50, borderRadius: 10, backgroundColor: '#fa5252',
    alignItems: 'center', justifyContent: 'center',
  },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
