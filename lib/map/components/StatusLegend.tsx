// Design Ref: §5.4 — 색상 범례
// Plan SC: SC-5 — 범례 UI 토글
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { STATUS_COLORS, STATUS_LABELS, type SurveyStatus } from '../types';

const ITEMS: SurveyStatus[] = ['NOT_SURVEYED', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'];

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
    <View style={styles.items}>
      {ITEMS.map((status) => (
        <View key={status} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: STATUS_COLORS[status].fill }]} />
          <Text style={styles.label}>{STATUS_LABELS[status]}</Text>
        </View>
      ))}
    </View>
  </View>
));

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
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#495057',
  },
  close: {
    fontSize: 14,
    color: '#adb5bd',
  },
  items: {
    gap: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    color: '#495057',
  },
});
