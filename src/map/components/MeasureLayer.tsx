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

  // 1. Static Features (Confirmed markers, confirmed line segments, and confirmed polygon area)
  // MUST BE CALLED UNCONDITIONALLY
  const staticFeatures = useMemo(() => {
    if (!isMeasuring || measurePoints.length === 0) return [];

    const features: any[] = [];
    const pointsCount = measurePoints.length;

    // Confirmed lines between points
    if (pointsCount >= 2) {
      for (let i = 0; i < pointsCount - 1; i++) {
        const p1 = measurePoints[i];
        const p2 = measurePoints[i + 1];
        if (!p1 || !p2) continue;
        const line = turfLineString([p1, p2]);
        const dist = length(line, { units: 'meters' });

        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2],
          },
          properties: { type: 'lineLabel', text: `${dist.toFixed(1)}m` },
        });
      }
    }

    // Confirmed Polygon Area Label (when >= 3 points)
    if (pointsCount >= 3) {
      try {
        const confirmedPoly = turfPolygon([
          [...measurePoints, measurePoints[0]],
        ]);
        const confirmedArea = area(confirmedPoly);
        const confirmedLabelPoint = centroid(confirmedPoly);
        if (confirmedLabelPoint && confirmedLabelPoint.geometry) {
          features.push({
            type: 'Feature',
            geometry: confirmedLabelPoint.geometry,
            properties: {
              type: 'confirmedAreaLabel',
              text: `${confirmedArea.toLocaleString(undefined, { maximumFractionDigits: 1 })} ㎡`,
            },
          });
        }
      } catch (e) {}
    }

    // Confirmed markers
    measurePoints.forEach((p, i) => {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: p },
        properties: { type: 'marker', label: String(i + 1) },
      });
    });

    return features;
  }, [isMeasuring, measurePoints]);

  // 2. Dynamic Features (Guide line, closure line, and polygon preview)
  // MUST BE CALLED UNCONDITIONALLY
  const dynamicFeatures = useMemo(() => {
    if (!isMeasuring || !currentCenter || measurePoints.length === 0) return [];

    const features: any[] = [];
    const pointsCount = measurePoints.length;
    const lastP = measurePoints[pointsCount - 1];
    if (!lastP) return features;

    // 1. Confirmed Polygon (Existing points only)
    if (pointsCount >= 3) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[...measurePoints, measurePoints[0]]],
        },
        properties: { type: 'confirmedPolygon' },
      });
    }

    // 2. Guide line from last point to crosshair
    const guideLine = turfLineString([lastP, currentCenter]);
    const guideDist = length(guideLine, { units: 'meters' });

    features.push({
      type: 'Feature',
      geometry: guideLine.geometry,
      properties: { type: 'guideLine' },
    });

    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          (lastP[0] + currentCenter[0]) / 2,
          (lastP[1] + currentCenter[1]) / 2,
        ],
      },
      properties: { type: 'lineLabel', text: `${guideDist.toFixed(1)}m` },
    });

    // 3. Closure Line (Current Center to First Point)
    if (pointsCount >= 2) {
      const firstP = measurePoints[0];
      if (firstP) {
        // Closure line geometry
        const closureLine = turfLineString([currentCenter, firstP]);
        const closureDist = length(closureLine, { units: 'meters' });

        // Closure line feature
        features.push({
          type: 'Feature',
          geometry: closureLine.geometry,
          properties: { type: 'closureLine' },
        });

        // Closure line label midpoint
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              (currentCenter[0] + firstP[0]) / 2,
              (currentCenter[1] + firstP[1]) / 2,
            ],
          },
          properties: { type: 'lineLabel', text: `${closureDist.toFixed(1)}m` },
        });
      }
    }

    return features;
  }, [isMeasuring, measurePoints, currentCenter]);

  // Early return after all hook calls
  if (!isMeasuring || (measurePoints.length === 0 && !currentCenter))
    return null;

  return (
    <>
      <MapLibreGL.ShapeSource
        id="measure_dynamic_source"
        shape={{ type: 'FeatureCollection', features: dynamicFeatures }}
      >
        {/* 1. Confirmed Polygon (Filled & Solid Outline) */}
        <MapLibreGL.FillLayer
          id="measure_confirmed_fill"
          filter={['==', 'type', 'confirmedPolygon']}
          style={{ fillColor: 'rgba(51, 154, 240, 0.25)' }}
        />
        <MapLibreGL.LineLayer
          id="measure_confirmed_line"
          filter={['==', 'type', 'confirmedPolygon']}
          style={{ lineColor: '#339af0', lineWidth: 2.5 }}
        />

        {/* 2. Guide line (Last Point to Crosshair) - White */}
        <MapLibreGL.LineLayer
          id="measure_guide_line"
          filter={['==', 'type', 'guideLine']}
          style={{
            lineColor: '#ffffff',
            lineWidth: 2,
            lineDasharray: [3, 2],
          }}
        />

        {/* 3. Closure Line (Crosshair to First Point) - White */}
        <MapLibreGL.LineLayer
          id="measure_closure_line"
          filter={['==', 'type', 'closureLine']}
          style={{
            lineColor: '#ffffff',
            lineWidth: 2,
            lineDasharray: [3, 2],
          }}
        />

        <MapLibreGL.SymbolLayer
          id="measure_dynamic_line_labels"
          filter={['==', 'type', 'lineLabel']}
          style={{
            textField: ['get', 'text'],
            textSize: 11,
            textColor: '#4b5563',
            textHaloColor: '#ffffff',
            textHaloWidth: 1.5,
            textIgnorePlacement: true,
            textAllowOverlap: true,
          }}
        />
      </MapLibreGL.ShapeSource>

      {/* Static features (markers and labels) are rendered on TOP of dynamic features (polygons) */}
      <MapLibreGL.ShapeSource
        id="measure_static_source"
        shape={{ type: 'FeatureCollection', features: staticFeatures }}
      >
        <MapLibreGL.CircleLayer
          id="measure_marker_circles"
          filter={['==', 'type', 'marker']}
          style={{
            circleRadius: 8,
            circleColor: '#339af0',
            circleStrokeWidth: 2,
            circleStrokeColor: '#ffffff',
            circlePitchAlignment: 'map',
          }}
        />
        <MapLibreGL.SymbolLayer
          id="measure_marker_labels"
          filter={['==', 'type', 'marker']}
          style={{
            textField: ['get', 'label'],
            textSize: 10,
            textColor: '#ffffff',
            textAllowOverlap: true,
            textIgnorePlacement: true,
          }}
        />
        <MapLibreGL.SymbolLayer
          id="measure_static_line_labels"
          filter={['==', 'type', 'lineLabel']}
          style={{
            textField: ['get', 'text'],
            textSize: 11,
            textColor: '#4b5563',
            textHaloColor: '#ffffff',
            textHaloWidth: 1.5,
            textIgnorePlacement: true,
            textAllowOverlap: true,
          }}
        />
        <MapLibreGL.SymbolLayer
          id="measure_confirmed_area_label"
          filter={['==', 'type', 'confirmedAreaLabel']}
          style={{
            textField: ['get', 'text'],
            textSize: 16,
            textColor: '#339af0',
            textHaloColor: '#ffffff',
            textHaloWidth: 2.5,
            textIgnorePlacement: true,
            textAllowOverlap: true,
          }}
        />
      </MapLibreGL.ShapeSource>
    </>
  );
});
