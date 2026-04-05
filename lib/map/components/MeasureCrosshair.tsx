// 면적 측정 크로스헤어 (src/map에서 이식, optionStore 의존 제거)
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  mapType: 'base' | 'satellite';
}

export const MeasureCrosshair = memo(({ mapType }: Props) => {
  const isDark = mapType === 'base';
  const lineColor = isDark ? '#1a1d1e' : '#ffffff';
  const lineOpacity = isDark ? 0.7 : 0.8;

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={[styles.verticalLine, { backgroundColor: lineColor, opacity: lineOpacity }]} />
      <View style={[styles.horizontalLine, { backgroundColor: lineColor, opacity: lineOpacity }]} />
      <View style={styles.centerCircle} />
      <View style={[styles.outerCircle, { borderColor: lineColor }]} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  verticalLine: { position: 'absolute', width: 2, height: 30 },
  horizontalLine: { position: 'absolute', width: 30, height: 2 },
  centerCircle: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#339af0' },
  outerCircle: { position: 'absolute', width: 24, height: 24, borderRadius: 12, borderWidth: 2, opacity: 0.6 },
});
