import MapLibreGL from '@maplibre/maplibre-react-native';
import React, { memo } from 'react';

export const SelectionLayer = memo(
  ({ selectedPnu }: { selectedPnu: string | null }) => {
    if (!selectedPnu) return null;
    return (
      <MapLibreGL.VectorSource
        id="selected_lot_source"
        tileUrlTemplates={[
          `https://farmfield.kr/geoserver/farm/gwc/service/tms/1.0.0/farm:vw_fml_lot@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
        ]}
      >
        <MapLibreGL.FillLayer
          id="selected_lot_highlight"
          sourceID="selected_lot_source"
          sourceLayerID="vw_fml_lot"
          filter={['==', 'pnu', selectedPnu]}
          style={{
            fillColor: 'rgba(51, 154, 240, 0.35)',
          }}
        />
        {/* Outer Glow/Halo for contrast */}
        <MapLibreGL.LineLayer
          id="selected_lot_outline_outer"
          sourceID="selected_lot_source"
          sourceLayerID="vw_fml_lot"
          filter={['==', 'pnu', selectedPnu]}
          style={{
            lineColor: '#ffffff',
            lineWidth: 6,
            lineOpacity: 0.4,
            lineJoin: 'round',
            lineCap: 'round',
          }}
        />
        {/* Main Primary Outline */}
        <MapLibreGL.LineLayer
          id="selected_lot_outline_inner"
          sourceID="selected_lot_source"
          sourceLayerID="vw_fml_lot"
          filter={['==', 'pnu', selectedPnu]}
          style={{
            lineColor: '#339af0',
            lineWidth: 3.5,
            lineOpacity: 1,
            lineJoin: 'round',
            lineCap: 'round',
          }}
        />
      </MapLibreGL.VectorSource>
    );
  }
);
