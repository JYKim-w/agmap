// 면적 측정 정보 카드 (src/map에서 이식)
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useMeasureStore from '@/store/measureStore';

export const MeasureInfoCard = memo(() => {
  const distance = useMeasureStore((s) => s.measureDistance);
  const area = useMeasureStore((s) => s.measureArea);

  return (
    <View style={styles.container}>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={styles.iconBox}>
            <Ionicons name="resize-outline" size={18} color="#339af0" />
          </View>
          <View>
            <Text style={styles.label}>총 거리</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text style={styles.value}>{distance.toLocaleString(undefined, { maximumFractionDigits: 1 })}</Text>
              <Text style={styles.unit}>m</Text>
            </View>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={styles.iconBox}>
            <Ionicons name="layers-outline" size={18} color="#339af0" />
          </View>
          <View>
            <Text style={styles.label}>면적 크기</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text style={styles.value}>{area.toLocaleString(undefined, { maximumFractionDigits: 1 })}</Text>
              <Text style={styles.unit}>㎡</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 60, left: 20, backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 16, borderRadius: 20, width: 200,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  iconBox: { backgroundColor: 'rgba(51,154,240,0.1)', padding: 6, borderRadius: 8 },
  label: { fontSize: 12, color: '#6b7280', fontWeight: 'bold' },
  value: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  unit: { fontSize: 12, color: '#4b5563' },
  divider: { height: 1, backgroundColor: '#f3f4f6' },
});
