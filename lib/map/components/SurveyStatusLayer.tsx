// Design Ref: §10.2 — MVT FillLayer+LineLayer 상태별 색상 렌더링
// Plan SC: SC-1 — 할당 필지 5색 벡터 표시
import MapLibreGL from '@maplibre/maplibre-react-native';
import React, { memo } from 'react';
import { MVT_PARCEL_URL, MVT_SOURCE_LAYER_ID } from '../constants';

interface Props {
  fillColorExpr: any;
  lineColorExpr: any;
  onParcelPress?: (pnu: string) => void;
}

export const SurveyStatusLayer = memo(({ fillColorExpr, lineColorExpr, onParcelPress }: Props) => (
  <MapLibreGL.VectorSource
    id="survey_status_source"
    tileUrlTemplates={[MVT_PARCEL_URL]}
    onPress={(e: any) => {
      const pnu = e.features?.[0]?.properties?.pnu;
      if (pnu) onParcelPress?.(pnu);
    }}
  >
    <MapLibreGL.FillLayer
      id="survey_status_fill"
      sourceLayerID={MVT_SOURCE_LAYER_ID}
      style={{ fillColor: fillColorExpr, fillOpacity: 0.45 }}
      minZoomLevel={12}
    />
    <MapLibreGL.LineLayer
      id="survey_status_line"
      sourceLayerID={MVT_SOURCE_LAYER_ID}
      style={{ lineColor: lineColorExpr, lineWidth: 1.5, lineOpacity: 0.8 }}
      minZoomLevel={12}
    />
  </MapLibreGL.VectorSource>
));
