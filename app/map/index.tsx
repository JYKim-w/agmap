// Design Ref: §10.4 — Clean Slate 조사원 전용 지도 화면
// Plan SC: SC-1~SC-7 전체 커버
import MapLibreGL from '@maplibre/maplibre-react-native';
import { area, length, polygon as turfPolygon, lineString as turfLineString } from '@turf/turf';
import { Stack, useRouter } from 'expo-router';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { SurveyStatusLayer } from '@/lib/map/components/SurveyStatusLayer';
import { StatusPopup } from '@/lib/map/components/StatusPopup';
import { StatusFilter } from '@/lib/map/components/StatusFilter';
import { StatusLegend } from '@/lib/map/components/StatusLegend';
import { VWorldBaseLayers } from '@/lib/map/components/VWorldBaseLayers';
import { MapControls } from '@/lib/map/components/MapControls';
import { LocationIndicator } from '@/lib/map/components/LocationIndicator';
import { MeasureLayer } from '@/lib/map/components/MeasureLayer';
import { MeasureCrosshair } from '@/lib/map/components/MeasureCrosshair';
import { MeasureInfoCard } from '@/lib/map/components/MeasureInfoCard';
import { MeasureControlBar } from '@/lib/map/components/MeasureControlBar';
import { useSurveyStatusMap } from '@/lib/map/hooks/useSurveyStatusMap';
import { useUserTracking } from '@/lib/map/hooks/useUserTracking';
import { DEFAULT_CENTER, DEFAULT_ZOOM, KOREA_BOUNDS, VWORLD_KEY } from '@/lib/map/constants';
import type { SurveyStatus } from '@/lib/map/types';
import { useMapStateStore } from '@/store/mapStateStore';
import useMeasureStore from '@/store/measureStore';
import inspectInputStore from '@/store/inspectInputStore';

MapLibreGL.setAccessToken(null);

// --- Measure calculator (recomputes area/distance on point change) ---
const MeasureCalculator = memo(() => {
  const isMeasuring = useMeasureStore((s) => s.isMeasuring);
  const points = useMeasureStore((s) => s.measurePoints);
  const center = useMeasureStore((s) => s.currentCenter);
  const setDist = useMeasureStore((s) => s.setMeasureDistance);
  const setArea = useMeasureStore((s) => s.setMeasureArea);

  useEffect(() => {
    if (!isMeasuring) return;
    try {
      let totalDist = 0;
      if (points.length >= 2) totalDist = length(turfLineString(points), { units: 'meters' });
      if (points.length > 0 && center) {
        totalDist += length(turfLineString([points[points.length - 1], center]), { units: 'meters' });
      }
      setDist(totalDist);
      if (points.length >= 3) {
        setArea(area(turfPolygon([[...points, points[0]]])));
      } else {
        setArea(0);
      }
    } catch {}
  }, [points, isMeasuring, center, setDist, setArea]);

  return null;
});

// --- Map style (VWorld raster sources) ---
const mapStyle = JSON.stringify({
  version: 8,
  name: 'VWorld',
  sources: {
    'vworld-base': {
      type: 'raster',
      tiles: [`https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}/Base/{z}/{y}/{x}.png`],
      tileSize: 256, scheme: 'xyz', minzoom: 6, maxzoom: 19,
    },
    'vworld-satellite': {
      type: 'raster',
      tiles: [`https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}/Satellite/{z}/{y}/{x}.jpeg`],
      tileSize: 256, scheme: 'xyz', minzoom: 6, maxzoom: 19,
    },
    'vworld-hybrid': {
      type: 'raster',
      tiles: [`https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}/Hybrid/{z}/{y}/{x}.png`],
      tileSize: 256, scheme: 'xyz', minzoom: 6, maxzoom: 19,
    },
  },
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  layers: [],
});

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const [cameraState, setCameraState] = useState<any>(null);

  // UI state
  const [mapType, setMapType] = useState<'base' | 'satellite'>('base');
  const [activeFilters, setActiveFilters] = useState<Set<SurveyStatus>>(new Set());
  const [selectedPnu, setSelectedPnu] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // Status layer
  const { statusMap, fillColorExpr, lineColorExpr } = useSurveyStatusMap(activeFilters);

  // Map state
  const trackingMode = useMapStateStore((s) => s.trackingMode);
  const setMapBearing = useMapStateStore((s) => s.setMapBearing);
  const setMapZoom = useMapStateStore((s) => s.setMapZoom);
  const setMapBbox = useMapStateStore((s) => s.setMapBbox);
  const setIsMapReady = useMapStateStore((s) => s.setIsMapReady);
  const setTrackingMode = useMapStateStore((s) => s.setTrackingMode);

  // Measure state
  const isMeasuring = useMeasureStore((s) => s.isMeasuring);
  const setIsMeasuring = useMeasureStore((s) => s.setIsMeasuring);
  const measurePoints = useMeasureStore((s) => s.measurePoints);
  const setMeasurePoints = useMeasureStore((s) => s.setMeasurePoints);
  const setCurrentCenter = useMeasureStore((s) => s.setCurrentCenter);
  const resetMeasure = useMeasureStore((s) => s.reset);
  const { setOwnAr } = inspectInputStore();

  // GPS tracking
  const { toggleTrackingMode, onUserTrackingModeChange, onLocationUpdate } =
    useUserTracking(cameraRef, setCameraState);

  // --- Handlers ---
  const handleParcelPress = useCallback((pnu: string) => {
    if (statusMap.has(pnu)) setSelectedPnu(pnu);
  }, [statusMap]);

  const handleStartSurvey = useCallback((assignmentId: number) => {
    setSelectedPnu(null);
    router.push(`/(tabs)/survey/${assignmentId}` as any);
  }, [router]);

  const onPressCompass = useCallback(async () => {
    setTrackingMode('off');
    setMapBearing(0);
    const center = await mapRef.current?.getCenter();
    const zoom = await mapRef.current?.getZoom();
    if (center) {
      setCameraState({
        centerCoordinate: [center[0] + (Math.random() - 0.5) * 0.0000001, center[1]],
        zoomLevel: zoom || undefined,
        heading: 0,
        animationDuration: 500,
      });
    }
  }, [setTrackingMode, setMapBearing]);

  // Measure handlers
  const onAddPoint = useCallback(() => {
    const center = useMeasureStore.getState().currentCenter;
    if (center) setMeasurePoints([...measurePoints, center]);
  }, [measurePoints, setMeasurePoints]);

  const onUndoPoint = useCallback(() => {
    if (measurePoints.length > 0) setMeasurePoints(measurePoints.slice(0, -1));
  }, [measurePoints, setMeasurePoints]);

  const onResetMeasure = useCallback(() => { resetMeasure(); }, [resetMeasure]);

  const onFinishMeasure = useCallback(() => {
    if (measurePoints.length < 3) {
      Alert.alert('오류', '측정을 위해 최소 3개 이상의 지점을 선택해주세요.');
      return;
    }
    const poly = turfPolygon([[...measurePoints, measurePoints[0]]]);
    const measured = Number(area(poly).toFixed(2));
    setOwnAr(measured);
    setIsMeasuring(false);
    resetMeasure();
    Toast.show({ text1: '측정 완료', text2: `면적: ${measured}㎡`, type: 'success' });
  }, [measurePoints, setOwnAr, setIsMeasuring, resetMeasure]);

  const onMapPress = useCallback((event: any) => {
    if (isMeasuring) return; // 측정 모드에서는 탭 무시
    setSelectedPnu(null); // 빈 곳 탭 시 팝업 닫기
  }, [isMeasuring]);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'map', headerShown: false, gestureEnabled: false }} />

      <MapLibreGL.MapView
        ref={mapRef}
        style={{ flex: 1 }}
        logoEnabled={false}
        attributionEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        compassEnabled={false}
        mapStyle={mapStyle}
        onPress={onMapPress}
        onRegionIsChanging={(e: any) => {
          if (e.properties?.heading != null) setMapBearing(e.properties.heading);
          if (e.properties?.zoomLevel != null) setMapZoom(e.properties.zoomLevel);
          if (isMeasuring && e.geometry?.coordinates) setCurrentCenter(e.geometry.coordinates);
        }}
        onRegionDidChange={(e: any) => {
          if (e.properties?.heading != null) setMapBearing(e.properties.heading);
          if (e.properties?.zoomLevel != null) setMapZoom(e.properties.zoomLevel);
          if (e.properties?.visibleBounds) {
            const [[maxLng, maxLat], [minLng, minLat]] = e.properties.visibleBounds;
            setMapBbox([minLng, minLat, maxLng, maxLat]);
          }
          if (e.geometry?.coordinates) setCurrentCenter(e.geometry.coordinates);
        }}
        onDidFinishLoadingStyle={() => setIsMapReady(true)}
      >
        <VWorldBaseLayers mapType={mapType} />
        <SurveyStatusLayer
          fillColorExpr={fillColorExpr}
          lineColorExpr={lineColorExpr}
          onParcelPress={handleParcelPress}
        />
        <MeasureLayer />

        <MapLibreGL.Camera
          ref={cameraRef}
          defaultSettings={{ centerCoordinate: DEFAULT_CENTER, zoomLevel: DEFAULT_ZOOM }}
          minZoomLevel={6}
          maxBounds={{ ne: KOREA_BOUNDS.ne as [number, number], sw: KOREA_BOUNDS.sw as [number, number] }}
          animationDuration={trackingMode !== 'off' ? 0 : (cameraState?.animationDuration || 0)}
          centerCoordinate={trackingMode !== 'off' ? undefined : cameraState?.centerCoordinate}
          zoomLevel={trackingMode !== 'off' ? undefined : cameraState?.zoomLevel}
          heading={trackingMode !== 'off' ? undefined : cameraState?.heading}
          followUserLocation={trackingMode !== 'off'}
          followUserMode={
            trackingMode === 'compass'
              ? MapLibreGL.UserTrackingMode.FollowWithHeading
              : MapLibreGL.UserTrackingMode.Follow
          }
          onUserTrackingModeChange={onUserTrackingModeChange}
        />

        <MapLibreGL.UserLocation visible={false} onUpdate={onLocationUpdate} />
        <LocationIndicator />
      </MapLibreGL.MapView>

      <MeasureCalculator />

      {/* --- Overlays --- */}
      {selectedPnu && statusMap.has(selectedPnu) && (
        <StatusPopup
          entry={statusMap.get(selectedPnu)!}
          onStartSurvey={handleStartSurvey}
          onClose={() => setSelectedPnu(null)}
        />
      )}

      {!isMeasuring && (
        <>
          <MapControls
            mapType={mapType}
            onToggleMapType={() => setMapType((m) => (m === 'base' ? 'satellite' : 'base'))}
            onTrackingPress={toggleTrackingMode}
            onCompassPress={onPressCompass}
          />
          {statusMap.size > 0 ? (
            <>
              <StatusFilter activeFilters={activeFilters} onChange={setActiveFilters} />
              {showLegend && <StatusLegend onClose={() => setShowLegend(false)} />}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>할당된 필지가 없습니다</Text>
              <Text style={styles.emptyDesc}>홈 탭에서 할당 목록을 확인해주세요</Text>
            </View>
          )}
        </>
      )}

      {isMeasuring && (
        <>
          <MeasureInfoCard />
          <MeasureCrosshair mapType={mapType} />
          <MeasureControlBar
            onAdd={onAddPoint}
            onUndo={onUndoPoint}
            onReset={onResetMeasure}
            onFinish={onFinishMeasure}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#868e96',
  },
});
