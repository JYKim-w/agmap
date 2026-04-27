// Design Ref: field-survey-map-ux.design.md §5.4 — StatusPopup
// Plan SC: FR-07 (D-Day + 위험등급 + 반려횟수 + validationWarnings)
import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { STATUS_COLORS, STATUS_LABELS, URGENCY_STYLES, type ParcelStatusEntry } from '../types';

interface Props {
  entry: ParcelStatusEntry;
  onStartSurvey: (assignmentId: number) => void;
  onClose: () => void;
}

const RISK_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  HIGH:   { bg: '#FFE3E3', color: '#C92A2A', label: '고위험' },
  MEDIUM: { bg: '#FFF3BF', color: '#E67700', label: '중위험' },
  LOW:    { bg: '#E6FCF5', color: '#2B8A3E', label: '저위험' },
};

export const StatusPopup = memo(({ entry, onStartSurvey, onClose }: Props) => {
  const color = STATUS_COLORS[entry.status];
  const risk = RISK_STYLE[entry.riskGrade] ?? RISK_STYLE.LOW;
  const urgency = URGENCY_STYLES[entry.urgencyLevel];
  const canStart = entry.status === 'NOT_SURVEYED' || entry.status === 'REJECTED' || entry.status === 'DRAFT';
  const hasDDay = entry.dDayLabel.length > 0;
  const hasReject = (entry.rejectCount ?? 0) >= 1;
  const hasWarnings = !!entry.validationWarnings;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.card}>
        {/* 핸들바 */}
        <View style={styles.handle} />

        {/* 주소 + 닫기 */}
        <View style={styles.header}>
          <Text style={styles.address} numberOfLines={2}>{entry.address}</Text>
          <Pressable onPress={onClose} hitSlop={16} style={styles.closeBtn}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>

        {/* 배지 행: 상태 + D-Day + 위험등급 */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: color.fill }]}>
            <Text style={styles.badgeText}>{STATUS_LABELS[entry.status]}</Text>
          </View>

          {hasDDay && (
            <View style={[styles.badge, { backgroundColor: urgency.ringColor }]}>
              <Text style={styles.badgeText}>{entry.dDayLabel}</Text>
            </View>
          )}

          <View style={[styles.riskBadge, { backgroundColor: risk.bg }]}>
            <Text style={[styles.riskText, { color: risk.color }]}>{risk.label}</Text>
          </View>
        </View>

        {/* 반려횟수 + 경고 */}
        {(hasReject || hasWarnings) && (
          <View style={styles.infoBox}>
            {hasReject && (
              <View style={styles.infoRow}>
                <Ionicons name="return-down-back" size={13} color="#e67700" />
                <Text style={styles.infoText}>반려 {entry.rejectCount}회</Text>
              </View>
            )}
            {hasWarnings && (
              <View style={styles.infoRow}>
                <Ionicons name="warning-outline" size={13} color="#e67700" />
                <Text style={[styles.infoText, styles.warningText]} numberOfLines={1}>
                  {entry.validationWarnings}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 조사 시작/보기 버튼 */}
        <Pressable
          style={[styles.button, !canStart && styles.buttonDisabled]}
          onPress={() => canStart && onStartSurvey(entry.assignmentId)}
          disabled={!canStart}
        >
          <Text style={[styles.buttonText, !canStart && styles.buttonTextDisabled]}>
            {canStart ? '조사 시작' : '조사 보기'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

StatusPopup.displayName = 'StatusPopup';

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  card: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#dee2e6',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  address: {
    fontSize: 17,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
    marginRight: 8,
  },
  closeBtn: {
    paddingTop: 2,
  },
  close: {
    fontSize: 16,
    color: '#adb5bd',
  },

  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  riskText: {
    fontSize: 13,
    fontWeight: '600',
  },

  infoBox: {
    gap: 3,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  infoText: {
    fontSize: 13,
    color: '#868e96',
  },
  warningText: {
    flex: 1,
    color: '#e67700',
  },

  button: {
    backgroundColor: '#228be6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: '#e9ecef',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  buttonTextDisabled: {
    color: '#868e96',
  },
});
