import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useMeasureStore from '@/store/measureStore';

const MeasureInfoCard = memo(() => {
  const distanceVal = useMeasureStore((s) => s.measureDistance);
  const areaVal = useMeasureStore((s) => s.measureArea);

  return (
    <View style={styles.container}>
      <View style={{flexDirection:'column', gap: 8}}>
        <View style={{flexDirection:'row', alignItems:'center', gap: 12}}>
            <View style={styles.iconBox}>
                <Ionicons name="resize-outline" size={18} color="#339af0" />
            </View>
            <View style={{flexDirection:'column'}}>
                <Text style={styles.labelText}>총 거리</Text>
                <View style={{flexDirection:'row', alignItems:'baseline', gap: 4}}>
                    <Text style={styles.valueText}>
                        {distanceVal.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </Text>
                    <Text style={styles.unitText}>m</Text>
                </View>
            </View>
        </View>

        <View style={styles.divider} />

        <View style={{flexDirection:'row', alignItems:'center', gap: 12}}>
            <View style={styles.iconBox}>
                <Ionicons name="layers-outline" size={18} color="#339af0" />
            </View>
            <View style={{flexDirection:'column'}}>
                <Text style={styles.labelText}>면적 크기</Text>
                <View style={{flexDirection:'row', alignItems:'baseline', gap: 4}}>
                    <Text style={styles.valueText}>
                        {areaVal.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </Text>
                    <Text style={styles.unitText}>㎡</Text>
                </View>
            </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 20,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconBox: {
    backgroundColor: 'rgba(51, 154, 240, 0.1)',
    padding: 6,
    borderRadius: 8,
  },
  labelText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  unitText: {
    fontSize: 12,
    color: '#4b5563',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
});

export default MeasureInfoCard;
