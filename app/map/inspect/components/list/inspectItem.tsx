import inspectInputStore from '@/store/inspectInputStore';
import inspectStore from '@/store/inspectStore';
import shelterStore from '@/store/shelterStore';
import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { InspectItemIcon } from './item';

interface InspectCardProps {
  item: any;
  totalArea: number;
}

const InspectCard = memo(({ item, totalArea }: InspectCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const handleEdit = useCallback(() => {
    const { setSelectedItem, setIsEdit } = inspectStore.getState();
    const { setIsFacility, setIsFarm, setInspectInput } =
      inspectInputStore.getState();
    setSelectedItem(item);
    setIsEdit(true);
    if (item.fmlUseCategory === 'facility') {
      setIsFacility('Y');
      setIsFarm('N');
    } else if (item.fmlUseCategory === 'farm') {
      setIsFarm('Y');
      setIsFacility('N');
    } else {
      setIsFacility('N');
      setIsFarm('N');
    }
    setInspectInput(item);
    if (item.fmlUseSitu === '체류형쉼터') {
      shelterStore.getState().fetchShelter(item.inspectId);
    }
  }, [item]);

  const handleDelete = useCallback(() => {
    Alert.alert('조사내용 삭제', '선택한 조사내역을 삭제하시겠습니까?', [
      { text: '취소' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          const {
            fetchRemoveInspect,
            fetchInspectList,
            fetchFiles,
            fieldInfo,
          } = inspectStore.getState();
          await fetchRemoveInspect(item.inspectId);
          if (fieldInfo?.pnu) {
            await fetchInspectList(fieldInfo.pnu);
            await fetchFiles(fieldInfo.pnu);
          }
        },
      },
    ]);
  }, [item.inspectId]);

  const handleToggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const percentage =
    totalArea > 0
      ? (((Number(item.ownAr) || 0) / totalArea) * 100).toFixed(1)
      : '0.0';

  return (
    <Pressable
      style={[styles.card, expanded && styles.cardExpanded]}
      onPress={handleToggle}
    >
      {/* 요약 행 */}
      <View style={styles.summaryRow}>
        <InspectItemIcon category={item.fmlUseCategory} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.fmlUseSitu}</Text>
          <Text style={styles.cardSub}>
            {Number(item.ownAr).toFixed(1)}㎡{'  '}·{'  '}태양광{' '}
            {item.sunlgtEsbYn === 'Y' ? '설치' : '미설치'}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{percentage}%</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#adb5bd"
        />
      </View>

      {/* 상세 보기 (펼침) */}
      {expanded && (
        <View style={styles.detailSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>이용현황</Text>
            <Text style={styles.detailValue}>{item.fmlUseSitu}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>면적</Text>
            <Text style={styles.detailValue}>
              {Number(item.ownAr).toFixed(1)}㎡
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>태양광</Text>
            <Text style={styles.detailValue}>
              {item.sunlgtEsbYn === 'Y' ? '설치' : '미설치'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>카테고리</Text>
            <Text style={styles.detailValue}>
              {item.fmlUseCategory === 'facility'
                ? '시설물'
                : item.fmlUseCategory === 'farm'
                  ? '경작'
                  : '기타'}
            </Text>
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={16} color="#ff4d4d" />
              <Text style={styles.deleteButtonText}>삭제</Text>
            </Pressable>
            <Pressable style={styles.editButton} onPress={handleEdit}>
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.editButtonText}>수정하기</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Pressable>
  );
});

export default InspectCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  cardExpanded: {
    backgroundColor: '#fff',
    borderColor: '#339af0',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 13,
    fontWeight: '500',
    color: '#868e96',
  },
  badge: {
    backgroundColor: '#e7f5ff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#339af0',
  },
  detailSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#868e96',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#212529',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#339af0',
    borderRadius: 8,
    paddingVertical: 10,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#ffc9c9',
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff4d4d',
  },
});
