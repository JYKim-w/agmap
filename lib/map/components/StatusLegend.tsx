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
    <View style={styles.header}>
      <Text style={styles.title}>범례</Text>
      <Pressable onPress={onClose} hitSlop={12}>
        <Text style={styles.close}>✕</Text>
      </Pressable>
    </View>

    {/* 조사 상태 */}
    <View style={styles.items}>
      {STATUS_ITEMS.map((status) => (
        <View key={status} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: STATUS_COLORS[status].fill }]} />
          <Text style={styles.label}>{STATUS_LABELS[status]}</Text>
        </View>
      ))}
    </View>

    {/* 구분선 + 긴급도 */}
    <View style={styles.divider} />
    <Text style={styles.sectionLabel}>기한 긴급도 (테두리)</Text>
    <View style={styles.items}>
      {URGENCY_ITEMS.map(({ label, color }) => (
        <View key={label} style={styles.item}>
          <View style={[styles.urgencyLine, { backgroundColor: color }]} />
          <Text style={styles.label}>{label}</Text>
        </View>
      ))}
    </View>
  </View>
));

StatusLegend.displayName = 'StatusLegend';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 150,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 12, fontWeight: '700', color: '#495057' },
  close: { fontSize: 14, color: '#adb5bd' },
  items: { gap: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 12, height: 12, borderRadius: 3 },
  label: { fontSize: 12, color: '#495057' },
  divider: { height: 1, backgroundColor: '#e9ecef', marginVertical: 8 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: '#adb5bd', marginBottom: 4 },
  urgencyLine: { width: 16, height: 3, borderRadius: 2 },
});
