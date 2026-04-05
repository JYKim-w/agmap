// 면적 측정 컨트롤 바 (src/map에서 이식)
import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import useMeasureStore from '@/store/measureStore';

interface Props {
  onAdd: () => void;
  onUndo: () => void;
  onReset: () => void;
  onFinish: () => void;
}

export const MeasureControlBar = memo(({ onAdd, onUndo, onReset, onFinish }: Props) => {
  const measurePoints = useMeasureStore((s) => s.measurePoints);
  const canUndo = measurePoints.length > 0;
  const canFinish = measurePoints.length >= 3;

  const handleAdd = useCallback(() => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    onAdd();
  }, [onAdd]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable onPress={onReset} style={[styles.action, { backgroundColor: 'white' }]}>
          <Ionicons name="refresh-outline" size={24} color="#4b5563" />
        </Pressable>
        <Pressable onPress={onUndo} disabled={!canUndo} style={[styles.action, { backgroundColor: 'white', opacity: canUndo ? 1 : 0.5 }]}>
          <Ionicons name="arrow-undo-outline" size={24} color={canUndo ? '#4b5563' : '#d1d5db'} />
        </Pressable>
        <Pressable onPress={handleAdd} style={[styles.addBtn, { backgroundColor: '#339af0' }]}>
          <Ionicons name="add" size={36} color="white" />
        </Pressable>
        <Pressable onPress={onFinish} disabled={!canFinish} style={[styles.action, { backgroundColor: 'white', opacity: canFinish ? 1 : 0.5 }]}>
          <Ionicons name="checkmark" size={26} color={canFinish ? '#339af0' : '#d1d5db'} />
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  action: {
    width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  addBtn: {
    width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#339af0', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
});
