import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface InspectProgressBarProps {
  count: number;
  usedArea: number;
  totalArea: number;
}

const InspectProgressBar = memo(
  ({ count, usedArea, totalArea }: InspectProgressBarProps) => {
    const percentage = totalArea > 0 ? (usedArea / totalArea) * 100 : 0;

    return (
      <View style={styles.container}>
        <View style={styles.textRow}>
          <Text style={styles.label}>조사 {count}건</Text>
          <Text style={styles.value}>
            {usedArea.toFixed(1)}㎡ / {totalArea.toFixed(1)}㎡{'  '}
            <Text style={styles.percent}>({percentage.toFixed(1)}%)</Text>
          </Text>
        </View>
        <View style={styles.barBg}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.min(percentage, 100)}%` },
            ]}
          />
        </View>
      </View>
    );
  }
);

export default InspectProgressBar;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#495057',
  },
  value: {
    fontSize: 12,
    fontWeight: '500',
    color: '#868e96',
  },
  percent: {
    fontWeight: '700',
    color: '#339af0',
  },
  barBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e9ecef',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#339af0',
  },
});
