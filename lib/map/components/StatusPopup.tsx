// Design Ref: §5.4 — 필지 탭 팝업 + 조사 시작
// Plan SC: SC-3, SC-4 — 팝업 표시 + 조사 시작 네비게이션
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { STATUS_COLORS, STATUS_LABELS, type ParcelStatusEntry } from '../types';

interface Props {
  entry: ParcelStatusEntry;
  onStartSurvey: (assignmentId: number) => void;
  onClose: () => void;
}

export const StatusPopup = memo(({ entry, onStartSurvey, onClose }: Props) => {
  const color = STATUS_COLORS[entry.status];
  const canStart = entry.status === 'NOT_SURVEYED' || entry.status === 'REJECTED' || entry.status === 'DRAFT';

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.address} numberOfLines={2}>{entry.address}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <View style={[styles.badge, { backgroundColor: color.fill }]}>
            <Text style={styles.badgeText}>{STATUS_LABELS[entry.status]}</Text>
          </View>
          <View style={[styles.riskBadge, {
            backgroundColor: entry.riskGrade === 'HIGH' ? '#FFE3E3' : entry.riskGrade === 'MEDIUM' ? '#FFF3BF' : '#E6FCF5',
          }]}>
            <Text style={[styles.riskText, {
              color: entry.riskGrade === 'HIGH' ? '#C92A2A' : entry.riskGrade === 'MEDIUM' ? '#E67700' : '#2B8A3E',
            }]}>
              {entry.riskGrade === 'HIGH' ? '고위험' : entry.riskGrade === 'MEDIUM' ? '중위험' : '저위험'}
            </Text>
          </View>
        </View>

        {entry.surveyedAt && (
          <Text style={styles.date}>조사일: {entry.surveyedAt.split('T')[0]}</Text>
        )}

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

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 180,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '85%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  address: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  close: {
    fontSize: 18,
    color: '#adb5bd',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
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
  date: {
    fontSize: 13,
    color: '#868e96',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#339AF0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
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
