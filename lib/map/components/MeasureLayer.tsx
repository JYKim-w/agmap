// 면적 측정 레이어 (src/map에서 이식, 변경 없음)
import MapLibreGL from '@maplibre/maplibre-react-native';
import {
  area,
  centroid,
  length,
  lineString as turfLineString,
  polygon as turfPolygon,
} from '@turf/turf';
import React, { memo, useMemo } from 'react';
import useMeasureStore from '@/store/measureStore';

export const MeasureLayer = memo(() => {
  const isMeasuring = useMeasureStore((s) => s.isMeasuring);
  const measurePoints = useMeasureStore((s) => s.measurePoints);
  const currentCenter = useMeasureStore((s) => s.currentCenter);

  const staticFeatures = useMemo(() => {
    if (!isMeasuring || measurePoints.length === 0) return [];
    const features: any[] = [];
    const n = measurePoints.length;

    if (n >= 2) {
      for (let i = 0; i < n - 1; i++) {
        const p1 = measurePoints[i], p2 = measurePoints[i + 1];
        if (!p1 || !p2) continue;
        const dist = length(turfLineString([p1, p2]), { units: 'meters' });
        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2] },
          properties: { type: 'lineLabel', text: `${dist.toFixed(1)}m` },
        });
      }
    }

    if (n >= 3) {
      try {
        const poly = turfPolygon([[...measurePoints, measurePoints[0]]]);
        const a = area(poly);
        const c = centroid(poly);
        if (c?.geometry) {
          features.push({
            type: 'Feature', geometry: c.geometry,
            properties: { type: 'confirmedAreaLabel', text: `${a.toLocaleString(undefined, { maximumFractionDigits: 1 })} ㎡` },
          });
        }
      } catch {}
    }

    measurePoints.forEach((p, i) => {
      features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: p }, properties: { type: 'marker', label: String(i + 1) } });
    });

    return features;
  }, [isMeasuring, measurePoints]);

  const dynamicFeatures = useMemo(() => {
    if (!isMeasuring || !currentCenter || measurePoints.length === 0) return [];
    const features: any[] = [];
    const n = measurePoints.length;
    const lastP = measurePoints[n - 1];
    if (!lastP) return features;

    if (n >= 3) {
      features.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [[...measurePoints, measurePoints[0]]] }, properties: { type: 'confirmedPolygon' } });
    }

    const guide = turfLineString([lastP, currentCenter]);
    const gDist = length(guide, { units: 'meters' });
    features.push({ type: 'Feature', geometry: guide.geometry, properties: { type: 'guideLine' } });
    features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [(lastP[0] + currentCenter[0]) / 2, (lastP[1] + currentCenter[1]) / 2] }, properties: { type: 'lineLabel', text: `${gDist.toFixed(1)}m` } });

    if (n >= 2) {
      const firstP = measurePoints[0];
      if (firstP) {
        const closure = turfLineString([currentCenter, firstP]);
        const cDist = length(closure, { units: 'meters' });
        features.push({ type: 'Feature', geometry: closure.geometry, properties: { type: 'closureLine' } });
        features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [(currentCenter[0] + firstP[0]) / 2, (currentCenter[1] + firstP[1]) / 2] }, properties: { type: 'lineLabel', text: `${cDist.toFixed(1)}m` } });
      }
    }

    return features;
  }, [isMeasuring, measurePoints, currentCenter]);

  if (!isMeasuring || (measurePoints.length === 0 && !currentCenter)) return null;

  return (
    <>
      <MapLibreGL.ShapeSource id="measure_dynamic_source" shape={{ type: 'FeatureCollection', features: dynamicFeatures }}>
        <MapLibreGL.FillLayer id="measure_confirmed_fill" filter={['==', 'type', 'confirmedPolygon']} style={{ fillColor: 'rgba(51, 154, 240, 0.25)' }} />
        <MapLibreGL.LineLayer id="measure_confirmed_line" filter={['==', 'type', 'confirmedPolygon']} style={{ lineColor: '#339af0', lineWidth: 2.5 }} />
        <MapLibreGL.LineLayer id="measure_guide_line" filter={['==', 'type', 'guideLine']} style={{ lineColor: '#ffffff', lineWidth: 2, lineDasharray: [3, 2] }} />
        <MapLibreGL.LineLayer id="measure_closure_line" filter={['==', 'type', 'closureLine']} style={{ lineColor: '#ffffff', lineWidth: 2, lineDasharray: [3, 2] }} />
        <MapLibreGL.SymbolLayer id="measure_dynamic_line_labels" filter={['==', 'type', 'lineLabel']} style={{ textField: ['get', 'text'], textSize: 11, textColor: '#4b5563', textHaloColor: '#ffffff', textHaloWidth: 1.5, textIgnorePlacement: true, textAllowOverlap: true }} />
      </MapLibreGL.ShapeSource>

      <MapLibreGL.ShapeSource id="measure_static_source" shape={{ type: 'FeatureCollection', features: staticFeatures }}>
        <MapLibreGL.CircleLayer id="measure_marker_circles" filter={['==', 'type', 'marker']} style={{ circleRadius: 8, circleColor: '#339af0', circleStrokeWidth: 2, circleStrokeColor: '#ffffff', circlePitchAlignment: 'map' }} />
        <MapLibreGL.SymbolLayer id="measure_marker_labels" filter={['==', 'type', 'marker']} style={{ textField: ['get', 'label'], textSize: 10, textColor: '#ffffff', textAllowOverlap: true, textIgnorePlacement: true }} />
        <MapLibreGL.SymbolLayer id="measure_static_line_labels" filter={['==', 'type', 'lineLabel']} style={{ textField: ['get', 'text'], textSize: 11, textColor: '#4b5563', textHaloColor: '#ffffff', textHaloWidth: 1.5, textIgnorePlacement: true, textAllowOverlap: true }} />
        <MapLibreGL.SymbolLayer id="measure_confirmed_area_label" filter={['==', 'type', 'confirmedAreaLabel']} style={{ textField: ['get', 'text'], textSize: 16, textColor: '#339af0', textHaloColor: '#ffffff', textHaloWidth: 2.5, textIgnorePlacement: true, textAllowOverlap: true }} />
      </MapLibreGL.ShapeSource>
    </>
  );
});
