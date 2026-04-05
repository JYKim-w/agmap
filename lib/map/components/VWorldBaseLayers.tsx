// Design Ref: §5.3 — VWorld 배경지도 (간소화 재작성)
import MapLibreGL from '@maplibre/maplibre-react-native';
import React, { memo } from 'react';

export const VWorldBaseLayers = memo(({ mapType }: { mapType: 'base' | 'satellite' }) => (
  <>
    <MapLibreGL.RasterLayer
      id="vworld-base-layer"
      sourceID="vworld-base"
      style={{ visibility: mapType === 'base' ? 'visible' : 'none' }}
    />
    <MapLibreGL.RasterLayer
      id="vworld-satellite-layer"
      sourceID="vworld-satellite"
      style={{ visibility: mapType === 'satellite' ? 'visible' : 'none' }}
    />
    <MapLibreGL.RasterLayer
      id="vworld-hybrid-layer"
      sourceID="vworld-hybrid"
      style={{ visibility: mapType === 'satellite' ? 'visible' : 'none' }}
    />
  </>
));
