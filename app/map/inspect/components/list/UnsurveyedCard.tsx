import Config from '@/app/js/config';
import inspectStore from '@/store/inspectStore';
import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

interface UnsurveyedCardProps {
  remainArea: number;
  totalArea: number;
}

const UnsurveyedCard = memo(
  ({ remainArea, totalArea }: UnsurveyedCardProps) => {
    const percentage =
      totalArea > 0 ? ((remainArea / totalArea) * 100).toFixed(1) : '0.0';
    const setIsEdit = inspectStore((s) => s.setIsEdit);

    const handleAdd = useCallback(() => {
      const { remainArea: currentRemain } = inspectStore.getState();
      if (currentRemain <= 0) {
        Toast.show({ type: 'error', text1: Config.message.error.remainArea });
        return;
      }
      setIsEdit(true);
    }, [setIsEdit]);

    return (
      <Pressable style={styles.card} onPress={handleAdd}>
        <View style={styles.content}>
          <Text style={styles.label}>미조사</Text>
          <Text style={styles.value}>
            {percentage}% {'  '}
            {remainArea.toFixed(1)}㎡
          </Text>
        </View>
        <View style={styles.button}>
          <Ionicons name="add-circle-outline" size={20} color="#339af0" />
          <Text style={styles.buttonText}>조사 추가</Text>
        </View>
      </Pressable>
    );
  }
);

export default UnsurveyedCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#dee2e6',
    borderRadius: 12,
    backgroundColor: 'rgba(248,249,250,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#adb5bd',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: '#868e96',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#e7f5ff',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#339af0',
  },
});
