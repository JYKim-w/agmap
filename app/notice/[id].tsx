// Design Ref: home-survey-ux.design.md §5.3 — 공지 상세 화면
// Plan SC: 공지 상세 (Markdown 렌더링, 404 에러 처리)
import { getNoticeDetail } from '@/lib/api/survey';
import type { Notice } from '@/lib/api/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Marked from 'react-native-marked';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NOTICE_TYPE_COLOR: Record<string, { bg: string; color: string; label: string }> = {
  URGENT:  { bg: '#fff0f0', color: '#fa5252', label: '긴급' },
  GUIDE:   { bg: '#e7f5ff', color: '#228be6', label: '안내' },
  GENERAL: { bg: '#f1f3f5', color: '#495057', label: '공지' },
};

export default function NoticeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const numId = Number(id);
    // Plan SC: Number.isNaN 검증 필수 (Spring 500 방지)
    if (Number.isNaN(numId) || !numId) {
      setError('잘못된 공지 ID입니다.');
      setLoading(false);
      return;
    }

    getNoticeDetail(numId)
      .then((res) => {
        if (res.success && res.data) {
          setNotice(res.data);
        } else {
          setError('공지를 찾을 수 없습니다.');
        }
      })
      .catch(() => setError('공지를 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [id]);

  const theme = notice
    ? (NOTICE_TYPE_COLOR[notice.noticeType] ?? NOTICE_TYPE_COLOR.GENERAL)
    : NOTICE_TYPE_COLOR.GENERAL;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color="#212529" />
        </Pressable>
        <Text style={s.headerTitle} numberOfLines={1}>
          {notice?.title ?? '공지사항'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={s.loader} color="#228be6" />
      ) : error ? (
        <View style={s.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ced4da" />
          <Text style={s.errorText}>{error}</Text>
        </View>
      ) : notice ? (
        <ScrollView contentContainerStyle={s.content}>
          {/* Meta */}
          <View style={s.metaRow}>
            <View style={[s.typeBadge, { backgroundColor: theme.color }]}>
              <Text style={s.typeBadgeText}>{theme.label}</Text>
            </View>
            {notice.pinned && (
              <View style={s.pinnedBadge}>
                <Ionicons name="pin" size={12} color="#868e96" />
                <Text style={s.pinnedText}>고정</Text>
              </View>
            )}
            <Text style={s.scopeText}>
              {notice.scope === 'GLOBAL' ? '전체 공지' : '담당 공지'}
            </Text>
          </View>
          <Text style={s.metaAuthor}>
            {notice.authorName} · {notice.createdAt?.slice(0, 10)}
          </Text>

          <View style={s.divider} />

          {/* Markdown content */}
          <Marked
            value={notice.content}
            flatListProps={{ scrollEnabled: false }}
          />
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    gap: 8,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: '#212529' },

  loader: { marginTop: 60 },

  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 15, color: '#868e96' },

  content: { padding: 20, paddingBottom: 40 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  typeBadge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  typeBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  pinnedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#f1f3f5', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3,
  },
  pinnedText: { fontSize: 11, color: '#868e96' },
  scopeText: { fontSize: 12, color: '#adb5bd', marginLeft: 'auto' },

  metaAuthor: { fontSize: 13, color: '#868e96', marginBottom: 16 },

  divider: { height: 1, backgroundColor: '#f1f3f5', marginBottom: 20 },
});
