// Design Ref: field-survey-map-ux.design.md §5.4 — 색상 범례 (상태 + 긴급도)
// Plan SC: SC-5 — 범례 UI 토글
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { STATUS_COLORS, STATUS_LABELS, URGENCY_STYLES, type SurveyStatus } from '../types';

const STATUS_ITEMS: SurveyStatus[] = ['NOT_SURVEYED', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'];

const URGENCY_ITEMS = [
  { label: '기한초과', color: URGENCY_STYLES.OVERDUE.strokeColor },
  { label: 'D-3 이내', color: URGENCY_STYLES.CRITICAL.strokeColor },
  { label: 'D-7 이내', color: URGENCY_STYLES.WARNING.strokeColor },
] as const;

interface Props {
  onClose: () => void;
}

export const StatusLegend = memo(({ onClose }: Props) => (
  <View style={styles.container}>
    {/* 조사 상태 + 긴급도 좌우 분리 */}
    <View style={styles.body}>
      {/* 좌: 조사 상태 */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>조사 상태</Text>
        <View style={styles.grid}>
          {STATUS_ITEMS.map((status) => (
            <View key={status} style={styles.item}>
              <View style={[styles.dot, { backgroundColor: STATUS_COLORS[status].fill }]} />
              <Text style={styles.label}>{STATUS_LABELS[status]}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.separator} />

      {/* 우: 기한 긴급도 */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>기한 긴급도</Text>
        <View style={styles.grid}>
          {URGENCY_ITEMS.map(({ label, color }) => (
            <View key={label} style={styles.item}>
              <View style={[styles.urgencyLine, { backgroundColor: color }]} />
              <Text style={styles.label}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>

    {/* 닫기 */}
    <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
      <Text style={styles.close}>✕</Text>
    </Pressable>
  </View>
));

StatusLegend.displayName = 'StatusLegend';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 160,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  body: {
    flexDirection: 'row',
    gap: 10,
  },
  section: {
    gap: 5,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#adb5bd',
    letterSpacing: 0.3,
  },
  grid: {
    gap: 3,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  label: {
    fontSize: 11,
    color: '#495057',
  },
  separator: {
    width: 1,
    backgroundColor: '#e9ecef',
  },
  urgencyLine: {
    width: 14,
    height: 3,
    borderRadius: 2,
  },
  closeBtn: {
    position: 'absolute',
    top: 6,
    right: 8,
  },
  close: {
    fontSize: 11,
    color: '#adb5bd',
  },
});
