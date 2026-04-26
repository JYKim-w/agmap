// Design Ref: home-survey-ux.design.md §5.2
// 미완료 카드 (미조사 + DRAFT) — 조사 탭 사용
import StatusBadge, { getStatusBadgeType } from '@/components/StatusBadge';
import DDayBadge from '@/components/survey/DDayBadge';
import { shortAddr, formatSurveyedAt } from '@/lib/utils/address';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Assignment } from '@/lib/api/types';

const ASSIGN_STATUS_LABEL: Record<string, string> = {
  ASSIGNED: '배정',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  RETURNED: '반려',
};

const PRIORITY_STYLE: Record<number, { label: string; color: string }> = {
  1: { label: '긴급', color: '#fa5252' },
  2: { label: '우선', color: '#fd7e14' },
  3: { label: '일반', color: '#868e96' },
};

interface AssignmentCardProps {
  item: Assignment;
  onPress: () => void;
  onMapPress?: () => void;
}

export function AssignmentCard({ item, onPress, onMapPress }: AssignmentCardProps) {
  const badgeType = getStatusBadgeType(item.resultId, item.resultStatus);
  const isDraft = item.resultStatus === 'DRAFT';
  const priorityStyle = item.priority ? PRIORITY_STYLE[item.priority] : null;
  const assignLabel = item.assignStatus ? ASSIGN_STATUS_LABEL[item.assignStatus] ?? item.assignStatus : null;

  return (
    <Pressable style={[s.card, isDraft && s.cardDraft]} onPress={onPress}>
      <View style={s.cardRow}>
        <StatusBadge type={badgeType} />
        <Text style={s.cardAddr} numberOfLines={1}>{shortAddr(item.address)}</Text>
        <DDayBadge dueDate={item.dueDate} />
        {onMapPress && (
          <Pressable style={s.mapBtn} onPress={onMapPress} hitSlop={8}>
            <Ionicons name="map-outline" size={14} color="#228be6" />
            <Text style={s.mapBtnText}>지도</Text>
          </Pressable>
        )}
        <Ionicons name="chevron-forward" size={16} color="#ced4da" />
      </View>
      <View style={s.cardMeta}>
        {item.riskGrade && <StatusBadge type={item.riskGrade as any} />}
        {assignLabel && (
          <View style={s.assignBadge}>
            <Text style={s.assignBadgeText}>{assignLabel}</Text>
          </View>
        )}
        {priorityStyle && (
          <View style={[s.priorityBadge, { borderColor: priorityStyle.color }]}>
            <Text style={[s.priorityBadgeText, { color: priorityStyle.color }]}>{priorityStyle.label}</Text>
          </View>
        )}
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

interface ResultCardProps {
  item: Assignment;
  onResurvey?: () => void;
  onMapPress?: () => void;
}

export function ResultCard({ item, onResurvey, onMapPress }: ResultCardProps) {
  const badgeType = getStatusBadgeType(item.resultId, item.resultStatus);
  const isRejected = item.resultStatus === 'REJECTED';
  const rejectReason = item.rejectComment ?? item.reviewComment;
  const summary = [item.surveyorOpinion, item.cropType, item.cropCondition].filter(Boolean).join(' · ');

  return (
    <View style={[s.card, isRejected && s.cardRejected]}>
      <View style={s.cardRow}>
        <StatusBadge type={badgeType} />
        <Text style={s.cardAddr} numberOfLines={1}>{shortAddr(item.address)}</Text>
        {onMapPress && (
          <Pressable style={s.mapBtn} onPress={onMapPress} hitSlop={8}>
            <Ionicons name="map-outline" size={14} color="#228be6" />
            <Text style={s.mapBtnText}>지도</Text>
          </Pressable>
        )}
      </View>
      {isRejected && rejectReason ? (
        <Text style={s.rejectedReason}>사유: {rejectReason}</Text>
      ) : summary ? (
        <Text style={s.cardSummary}>{summary}</Text>
      ) : null}
      {item.surveyedAt && (
        <Text style={s.cardDate}>제출: {formatSurveyedAt(item.surveyedAt)}</Text>
      )}
      {isRejected && onResurvey && (
        <Pressable style={s.resurveyBtn} onPress={onResurvey}>
          <Text style={s.resurveyBtnText}>재조사 시작</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardDraft: { borderLeftWidth: 3, borderLeftColor: '#228be6' },
  cardRejected: { borderLeftWidth: 3, borderLeftColor: '#fd7e14', backgroundColor: '#fff4e6' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardAddr: { flex: 1, fontSize: 16, fontWeight: '600', color: '#212529' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  cardAddrFull: { flex: 1, fontSize: 12, color: '#adb5bd' },
  cardSummary: { fontSize: 13, color: '#868e96', marginTop: 4 },
  cardDate: { fontSize: 12, color: '#ced4da', marginTop: 4 },
  rejectedReason: { fontSize: 13, color: '#fd7e14', fontWeight: '500', marginTop: 6 },
  assignBadge: {
    backgroundColor: '#f1f3f5',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  assignBadgeText: { fontSize: 11, color: '#495057', fontWeight: '600' },
  priorityBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  priorityBadgeText: { fontSize: 11, fontWeight: '700' },
  draftBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e7f5ff',
  },
  draftText: { fontSize: 13, color: '#228be6', fontWeight: '500' },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#228be6',
  },
  mapBtnText: { fontSize: 12, color: '#228be6', fontWeight: '600' },
  resurveyBtn: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#228be6',
    alignItems: 'center',
  },
  resurveyBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
