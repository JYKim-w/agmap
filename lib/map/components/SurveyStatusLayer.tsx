// Design Ref: field-survey-map-ux.design.md §3 — 줌 4단계 레이어 전략 (v3.0 teardrop pin)
// marker-preview.html Section 8/9 확정 디자인: 핀=상태색, 배지=긴급도, 클러스터=회색핀+카운트
import MapLibreGL from '@maplibre/maplibre-react-native';
import { memo } from 'react';

interface Props {
  centroidCollection: { type: string; features: any[] };
  polygonCollection: { type: string; features: any[] };
  onParcelPress?: (pnu: string) => void;
  onClusterPress?: (coords: [number, number], currentZoom: number) => void;
}

const CLUSTER_MAX_ZOOM = 14;
const POLYGON_MIN_ZOOM = 16;
const PIN_IMAGES = {
  'pin-not-surveyed': require('../../../assets/images/markers/pin-not-surveyed.png'),
  'pin-draft': require('../../../assets/images/markers/pin-draft.png'),
  'pin-submitted': require('../../../assets/images/markers/pin-submitted.png'),
  'pin-approved': require('../../../assets/images/markers/pin-approved.png'),
  'pin-rejected': require('../../../assets/images/markers/pin-rejected.png'),
  'pin-cluster': require('../../../assets/images/markers/pin-cluster.png'),
};

const COUNT_IMAGES = {
  'count-1': require('../../../assets/images/markers/count-1.png'),
  'count-2': require('../../../assets/images/markers/count-2.png'),
  'count-3': require('../../../assets/images/markers/count-3.png'),
  'count-4': require('../../../assets/images/markers/count-4.png'),
  'count-5': require('../../../assets/images/markers/count-5.png'),
  'count-6': require('../../../assets/images/markers/count-6.png'),
  'count-7': require('../../../assets/images/markers/count-7.png'),
  'count-8': require('../../../assets/images/markers/count-8.png'),
  'count-9': require('../../../assets/images/markers/count-9.png'),
  'count-10p': require('../../../assets/images/markers/count-10p.png'),
};

const BADGE_IMAGES = {
  'badge-warning': require('../../../assets/images/markers/badge-warning.png'),
  'badge-critical': require('../../../assets/images/markers/badge-critical.png'),
  'badge-overdue': require('../../../assets/images/markers/badge-overdue.png'),
};

// 상태 → 핀 이미지명 match 표현식
const PIN_IMAGE_EXPR = [
  'match',
  ['get', 'status'],
  'NOT_SURVEYED',
  'pin-not-surveyed',
  'DRAFT',
  'pin-draft',
  'SUBMITTED',
  'pin-submitted',
  'APPROVED',
  'pin-approved',
  'REJECTED',
  'pin-rejected',
  'pin-not-surveyed', // fallback
] as const;

// 긴급도 → 배지 이미지명 match 표현식
const BADGE_IMAGE_EXPR = [
  'match',
  ['get', 'urgencyLevel'],
  'WARNING',
  'badge-warning',
  'CRITICAL',
  'badge-critical',
  'OVERDUE',
  'badge-overdue',
  '', // NORMAL → 빈 문자열 (미표시)
] as const;

// 핀 기준 배지/카운트 오프셋 (bottom anchor 기준, 우상단)
// iconSize=0.7 기준: 핀 39dp 높이 → 배지 top overlap → [13, -33]
const BADGE_OFFSET: [number, number] = [20, -55];
const COUNT_OFFSET: [number, number] = [15, -45];

// point_count → count 이미지명 (step 표현식)
const COUNT_IMAGE_EXPR = [
  'step',
  ['get', 'point_count'],
  'count-1',
  2,
  'count-2',
  3,
  'count-3',
  4,
  'count-4',
  5,
  'count-5',
  6,
  'count-6',
  7,
  'count-7',
  8,
  'count-8',
  9,
  'count-9',
  10,
  'count-10p',
] as const;

function handlePress(
  e: any,
  onParcelPress?: (pnu: string) => void,
  onClusterPress?: (coords: [number, number], currentZoom: number) => void
) {
  const feature = e.features?.[0];
  if (!feature) return;
  if (feature.properties?.point_count) {
    const coords = feature.geometry?.coordinates as
      | [number, number]
      | undefined;
    const zoom = e.properties?.zoomLevel ?? CLUSTER_MAX_ZOOM;
    if (coords) onClusterPress?.(coords, zoom);
    return;
  }
  const pnu = feature.properties?.pnu;
  if (pnu) onParcelPress?.(pnu);
}

export const SurveyStatusLayer = memo(
  ({
    centroidCollection,
    polygonCollection,
    onParcelPress,
    onClusterPress,
  }: Props) => {
    const onPress = (e: any) => handlePress(e, onParcelPress, onClusterPress);

    return (
      <>
        {/* 마커 이미지 등록 */}
        <MapLibreGL.Images
          images={{ ...PIN_IMAGES, ...BADGE_IMAGES, ...COUNT_IMAGES }}
        />

        {/* ── Source 1: Polygon geom (z≥16, 마커 아래) ── */}
        <MapLibreGL.ShapeSource
          id="survey_polygon_source"
          shape={polygonCollection as any}
          onPress={onPress}
        >
          <MapLibreGL.FillLayer
            id="survey_polygon_fill"
            aboveLayerID="vworld-hybrid-layer"
            minZoomLevel={POLYGON_MIN_ZOOM}
            style={{
              fillColor: ['get', 'fillColor'] as any,
              fillOpacity: 0.25,
            }}
          />
          <MapLibreGL.LineLayer
            id="survey_polygon_status_line"
            aboveLayerID="survey_polygon_fill"
            minZoomLevel={POLYGON_MIN_ZOOM}
            style={{
              lineColor: ['get', 'statusStroke'] as any,
              lineWidth: 2,
              lineOpacity: 0.9,
            }}
          />
          {/* ── 필지 긴급도 배지 (NORMAL 제외, z≥16) ── */}
          <MapLibreGL.SymbolLayer
            id="survey_polygon_urgency_badge"
            aboveLayerID="survey_polygon_status_line"
            minZoomLevel={POLYGON_MIN_ZOOM}
            filter={['!=', ['get', 'urgencyLevel'], 'NORMAL']}
            style={{
              iconImage: BADGE_IMAGE_EXPR as any,
              iconAnchor: 'center' as any,
              iconOffset: [0, -30] as any,
              iconSize: 0.6,
              iconAllowOverlap: true,
              iconIgnorePlacement: true,
            }}
          />
          {/* ── 필지 라벨: 지번 (z≥16) ── */}
          <MapLibreGL.SymbolLayer
            id="survey_polygon_label"
            aboveLayerID="survey_polygon_urgency_badge"
            minZoomLevel={POLYGON_MIN_ZOOM}
            style={{
              textField: ['get', 'jibun'] as any,
              textFont: ['Noto Sans KR Bold'] as any,
              textColor: '#212529',
              textSize: 14,
              textHaloColor: 'rgba(255,255,255,0.9)',
              textHaloWidth: 1.5,
              textAllowOverlap: false,
              textIgnorePlacement: false,
            }}
          />
        </MapLibreGL.ShapeSource>

        {/* ── Source 2: Centroid (cluster + 개별 마커) ── */}
        <MapLibreGL.ShapeSource
          id="survey_centroid_source"
          shape={centroidCollection as any}
          cluster
          clusterRadius={30}
          clusterMaxZoomLevel={CLUSTER_MAX_ZOOM - 1}
          onPress={onPress}
        >
          {/* ── 클러스터: 기본 핀 ── */}
          <MapLibreGL.SymbolLayer
            id="survey_cluster_pin"
            aboveLayerID="survey_polygon_label"
            maxZoomLevel={CLUSTER_MAX_ZOOM}
            filter={['has', 'point_count']}
            style={{
              iconImage: 'pin-not-surveyed' as any,
              iconAnchor: 'bottom' as any,
              iconSize: 0.7,
              iconAllowOverlap: true,
              iconIgnorePlacement: true,
            }}
          />
          {/* ── 클러스터: 카운트 배지 이미지 ── */}
          <MapLibreGL.SymbolLayer
            id="survey_cluster_count"
            aboveLayerID="survey_cluster_pin"
            maxZoomLevel={CLUSTER_MAX_ZOOM}
            filter={['has', 'point_count']}
            style={{
              iconImage: COUNT_IMAGE_EXPR as any,
              iconAnchor: 'center' as any,
              iconOffset: COUNT_OFFSET as any,
              iconSize: 0.8,
              iconAllowOverlap: true,
              iconIgnorePlacement: true,
            }}
          />

          {/* ── 개별 마커: 물방울 핀 (상태색, z<16에서만) ── */}
          <MapLibreGL.SymbolLayer
            id="survey_marker_pin"
            aboveLayerID="survey_cluster_count"
            minZoomLevel={CLUSTER_MAX_ZOOM}
            maxZoomLevel={POLYGON_MIN_ZOOM}
            filter={['!', ['has', 'point_count']]}
            style={{
              iconImage: PIN_IMAGE_EXPR as any,
              iconAnchor: 'bottom' as any,
              iconAllowOverlap: true,
              iconIgnorePlacement: true,
              iconSize: [
                'interpolate',
                ['linear'],
                ['zoom'],
                14,
                0.6,
                17,
                0.7,
                19,
                0.75,
              ] as any,
            }}
          />
          {/* ── 개별 마커: 긴급도 배지 (NORMAL 제외, z<16에서만) ── */}
          <MapLibreGL.SymbolLayer
            id="survey_marker_badge"
            aboveLayerID="survey_marker_pin"
            minZoomLevel={CLUSTER_MAX_ZOOM}
            maxZoomLevel={POLYGON_MIN_ZOOM}
            filter={[
              'all',
              ['!', ['has', 'point_count']],
              ['!=', ['get', 'urgencyLevel'], 'NORMAL'],
            ]}
            style={{
              iconImage: BADGE_IMAGE_EXPR as any,
              iconAnchor: 'center' as any,
              iconOffset: BADGE_OFFSET as any,
              iconAllowOverlap: true,
              iconIgnorePlacement: true,
              iconSize: 0.6,
            }}
          />
        </MapLibreGL.ShapeSource>
      </>
    );
  }
);

SurveyStatusLayer.displayName = 'SurveyStatusLayer';
