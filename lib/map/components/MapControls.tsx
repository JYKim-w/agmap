// Design Ref: §5.3 — FAB 컨트롤 (GPS/나침반/배경전환)
import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useMapStateStore } from '@/store/mapStateStore';

const PRIMARY = '#339af0';

const CompassIcon = memo(({ bearing }: { bearing: number }) => (
  <View style={{ transform: [{ rotate: `${-bearing}deg` }] }}>
    <Svg width="24" height="24" viewBox="0 0 30 30" fill="none">
      <Path d="M15 3L11 15H19L15 3Z" fill="#ff4d4d" />
      <Path d="M15 27L19 15H11L15 27Z" fill="#cccccc" />
      <Circle cx="15" cy="15" r="1.5" fill="white" />
    </Svg>
  </View>
));

const LocationIcon = memo(({ mode }: { mode: 'off' | 'normal' | 'compass' }) => {
  const color = mode === 'off' ? '#adb5bd' : PRIMARY;
  if (mode === 'compass') {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={PRIMARY} strokeWidth="2" />
        <Path d="M12 7L10 12L12 17L14 12L12 7Z" fill={PRIMARY} />
        <Path d="M12 2V5M12 19V22M2 12H5M19 12H22" stroke={PRIMARY} strokeWidth="1" />
      </Svg>
    );
  }
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" />
      <Path d="M12 2V6M12 18V22M2 12H6M18 12H22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {mode === 'normal' && <Circle cx="12" cy="12" r="3" fill={PRIMARY} />}
    </Svg>
  );
});

const MapTypeIcon = memo(({ mapType }: { mapType: 'base' | 'satellite' }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L4 7L12 12L20 7L12 2Z"
      fill={mapType === 'satellite' ? PRIMARY : '#adb5bd'}
      stroke="white" strokeWidth="1.5" strokeLinejoin="round"
    />
    <Path d="M4 12L12 17L20 12" stroke={mapType === 'satellite' ? PRIMARY : '#adb5bd'} strokeWidth="2" strokeLinejoin="round" />
  </Svg>
));

interface Props {
  mapType: 'base' | 'satellite';
  onToggleMapType: () => void;
  onTrackingPress: () => void;
  onCompassPress: () => void;
}

export const MapControls = memo(({ mapType, onToggleMapType, onTrackingPress, onCompassPress }: Props) => {
  const mapBearing = useMapStateStore((s) => s.mapBearing);
  const trackingMode = useMapStateStore((s) => s.trackingMode);
  const showCompass = trackingMode === 'compass' || Math.abs(mapBearing) > 2;

  return (
    <View style={styles.container}>
      <Pressable style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]} onPress={onToggleMapType}>
        <MapTypeIcon mapType={mapType} />
      </Pressable>
      <Pressable style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]} onPress={onTrackingPress}>
        <LocationIcon mode={trackingMode} />
      </Pressable>
      {showCompass && (
        <Pressable style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]} onPress={onCompassPress}>
          <CompassIcon bearing={mapBearing} />
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 18,
    alignItems: 'center',
    gap: 16,
  },
  fab: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});
