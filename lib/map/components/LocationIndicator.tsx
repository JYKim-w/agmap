// Design Ref: §5.3 — 사용자 위치 마커 (간소화)
import MapLibreGL from '@maplibre/maplibre-react-native';
import React, { memo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { useMapStateStore } from '@/store/mapStateStore';

const PRIMARY = '#339af0';

const UserDot = memo(({ heading, mode }: { heading: number; mode: string }) => (
  <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
    <Svg width="44" height="44" viewBox="0 0 44 44">
      {mode === 'compass' && (
        <Path d="M22 22 L6 -10 A32 32 0 0 1 38 -10 L22 22 Z" fill={PRIMARY} opacity={0.25} />
      )}
      <G transform={`rotate(${heading}, 22, 22)`}>
        {mode !== 'compass' && (
          <Path d="M22 4 L16 14 L22 12 L28 14 Z" fill={PRIMARY} stroke="white" strokeWidth="1" />
        )}
      </G>
      <Circle cx="22" cy="22" r="7" fill="white" />
      <Circle cx="22" cy="22" r="5" fill={PRIMARY} />
    </Svg>
  </View>
));

export const LocationIndicator = memo(() => {
  const userCoords = useMapStateStore((s) => s.userCoords);
  const userHeading = useMapStateStore((s) => s.userHeading);
  const trackingMode = useMapStateStore((s) => s.trackingMode);
  const isMapReady = useMapStateStore((s) => s.isMapReady);
  const mapBearing = useMapStateStore((s) => s.mapBearing);

  if (!isMapReady || !userCoords || userCoords[0] === 0 || userCoords[1] === 0) return null;
  if (!isFinite(userCoords[0]) || !isFinite(userCoords[1])) return null;

  const displayHeading = trackingMode === 'compass' ? 0 : userHeading - mapBearing;

  return (
    <MapLibreGL.MarkerView coordinate={userCoords} anchor={{ x: 0.5, y: 0.5 }}>
      <UserDot heading={displayHeading} mode={trackingMode} />
    </MapLibreGL.MarkerView>
  );
});
