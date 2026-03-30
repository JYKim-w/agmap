import MapLibreGL from '@maplibre/maplibre-react-native';
import React, { memo } from 'react';

export const VWorldBaseLayers = memo(({ mapType }: { mapType: string }) => {
  return (
    <>
      <MapLibreGL.RasterLayer
        id="vworld-base-layer"
        sourceID="vworld-base"
        style={{ visibility: mapType === 'base' ? 'visible' : 'none' }}
      />
      <MapLibreGL.RasterLayer
        id="vworld-satellite-layer"
        sourceID="vworld-satellite"
        style={{
          visibility:
            mapType === 'satellite' || mapType === 'hybrid'
              ? 'visible'
              : 'none',
        }}
      />
      <MapLibreGL.RasterLayer
        id="vworld-hybrid-layer"
        sourceID="vworld-hybrid"
        style={{ visibility: mapType === 'hybrid' ? 'visible' : 'none' }}
      />
    </>
  );
});

export const VWorldWMSLayers = memo(
  ({ options, vworldKey }: { options: any; vworldKey: string }) => {
    const vworldLayers = [
      { id: 'jijuk', layer: 'lp_pa_cbnd_bu,lp_pa_cbnd_bon', minZoom: 15 },
      { id: 'road', layer: 'lt_l_moctlink', minZoom: 13 },
      { id: 'emd', layer: 'lt_c_ademd', minZoom: 10 },
      { id: 'ri', layer: 'lt_c_adli', minZoom: 12 },
    ];

    return (
      <>
        {vworldLayers.map(
          (l) =>
            options[l.id] && (
              <MapLibreGL.RasterSource
                key={l.id}
                id={`${l.id}_source`}
                tileUrlTemplates={[
                  `https://api.vworld.kr/req/wms?key=${vworldKey}&service=WMS&request=GetMap&version=1.3.0&layers=${l.layer}&styles=${l.layer}&format=image/png&transparent=true&width=256&height=256&crs=EPSG:3857&bbox={bbox-epsg-3857}`,
                ]}
                tileSize={256}
              >
                <MapLibreGL.RasterLayer
                  id={`${l.id}_layer`}
                  sourceID={`${l.id}_source`}
                  style={{ rasterOpacity: 0.6 }}
                  minZoomLevel={l.minZoom}
                />
              </MapLibreGL.RasterSource>
            )
        )}
      </>
    );
  }
);
