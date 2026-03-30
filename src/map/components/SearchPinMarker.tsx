import useSearchStore from '@/store/searchStore';
import MapLibreGL from '@maplibre/maplibre-react-native';
import React, { memo, useMemo } from 'react';

const pinImage = require('@/assets/images/map_pin.png');

const SearchPinMarker = memo(() => {
  const selectedCoord = useSearchStore((s) => s.selectedCoord);

  const geoJSON = useMemo(() => {
    if (!selectedCoord) return null;
    return {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: selectedCoord,
          },
          properties: {},
        },
      ],
    };
  }, [selectedCoord]);

  if (!geoJSON) return null;

  return (
    <>
      <MapLibreGL.Images images={{ searchPin: pinImage }} />
      <MapLibreGL.ShapeSource id="search-pin-source" shape={geoJSON}>
        {/* 그림자 (살짝 아래 오프셋) */}
        <MapLibreGL.CircleLayer
          id="search-pin-shadow"
          style={{
            circleRadius: 6,
            circleColor: '#000000',
            circleOpacity: 0.12,
            circleBlur: 1,
            circleTranslate: [0, 3],
          }}
        />
        {/* 핀 아이콘 */}
        <MapLibreGL.SymbolLayer
          id="search-pin-symbol"
          style={{
            iconImage: 'searchPin',
            iconSize: 0.1,
            iconAnchor: 'bottom',
            iconAllowOverlap: true,
          }}
        />
      </MapLibreGL.ShapeSource>
    </>
  );
});

export default SearchPinMarker;
