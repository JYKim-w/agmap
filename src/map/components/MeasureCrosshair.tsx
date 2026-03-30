import optionStore from '@/store/optionStore';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

const MeasureCrosshair = memo(() => {
  const mapType = optionStore((s) => s.options.mapType);
  const isDark = mapType === 'base';
  const lineColor = isDark ? '#1a1d1e' : '#ffffff';
  const lineOpacity = isDark ? 0.7 : 0.8;
  const ringColor = isDark ? '#1a1d1e' : '#ffffff';

  return (
    <View style={styles.container} pointerEvents="none">
      <View
        style={[
          styles.verticalLine,
          { backgroundColor: lineColor, opacity: lineOpacity },
        ]}
      />
      <View
        style={[
          styles.horizontalLine,
          { backgroundColor: lineColor, opacity: lineOpacity },
        ]}
      />
      <View style={styles.centerCircle} />
      <View
        style={[styles.outerCircle, { borderColor: ringColor }]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  verticalLine: {
    position: 'absolute',
    width: 2,
    height: 30,
  },
  horizontalLine: {
    position: 'absolute',
    width: 30,
    height: 2,
  },
  centerCircle: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#339af0',
  },
  outerCircle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    opacity: 0.6,
  },
});

export default MeasureCrosshair;
