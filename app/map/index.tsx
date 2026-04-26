// Design Ref: field-survey-map-ux.design.md §2.1 — 조사원 전용 지도 화면 (v2.0)
// Plan SC: FR-01~FR-09 전체 커버
import MapLibreGL from '@maplibre/maplibre-react-native';
import { area, length, polygon as turfPolygon, lineString as turfLineString } from '@turf/turf';
import { Stack, useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, StyleSheet, Text, View } from 'react-native';
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
import { SearchBar } from '@/lib/map/components/SearchBar';
import { useParcelStyle } from '@/lib/map/hooks/useParcelStyle';
import { usePolygonGeoms } from '@/lib/map/hooks/usePolygonGeoms';
import { useUserTracking } from '@/lib/map/hooks/useUserTracking';
import { setupMapGlyphs } from '@/lib/map/utils/glyphsSetup';
import { DEFAULT_CENTER, DEFAULT_ZOOM, KOREA_BOUNDS, VWORLD_KEY } from '@/lib/map/constants';
import type { SurveyStatus } from '@/lib/map/types';
import useAssignmentStore from '@/lib/store/assignments';
import { useMapStateStore } from '@/store/mapStateStore';
import useMeasureStore from '@/store/measureStore';
import inspectInputStore from '@/store/inspectInputStore';

MapLibreGL.setAccessToken(null);

// 모듈 레벨 캐시 — 앱 세션 내 재렌더링 시 즉시 사용
let _cachedGlyphsUrl: string | undefined;

// --- Measure calculator ---
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

// --- Map style factory ---
function buildMapStyle(glyphsUrl: string) {
  return JSON.stringify({
    version: 8,
    name: 'VWorld',
    glyphs: glyphsUrl,
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
  layers: [],
  });
}

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const [cameraState, setCameraState] = useState<any>(null);

  // 조사 탭에서 공유된 선택 상태
  const selectedAssignmentId = useAssignmentStore((s) => s.selectedAssignmentId);
  const setSelectedAssignment = useAssignmentStore((s) => s.setSelectedAssignment);
  const assignments = useAssignmentStore((s) => s.assignments);

  // UI state
  const [mapType, setMapType] = useState<'base' | 'satellite'>('base');
  const [activeFilters, setActiveFilters] = useState<Set<SurveyStatus>>(new Set());
  const [selectedPnu, setSelectedPnu] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // polygon fetch 래치: z≥14 최초 진입 시 true, 이후 영구 유지 (zoom-out 재요청 방지)
  const [geomPrefetchEnabled, setGeomPrefetchEnabled] = useState(DEFAULT_ZOOM >= 14);

  // 새 hook: useParcelStyle — centroid + urgency + style 통합 (0 API)
  const { statusMap, centroidCollection } = useParcelStyle(activeFilters);

  // 새 hook: usePolygonGeoms — z≥14 진입 시 백그라운드 prefetch, 표시는 z≥16
  const polygonCollection = usePolygonGeoms(statusMap, geomPrefetchEnabled, activeFilters);

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

  const [glyphsUrl, setGlyphsUrl] = useState<string | undefined>(_cachedGlyphsUrl);
  useEffect(() => {
    if (_cachedGlyphsUrl) return;
    setupMapGlyphs().then((url) => { _cachedGlyphsUrl = url; setGlyphsUrl(url); });
  }, []);

  const { toggleTrackingMode, onUserTrackingModeChange, onLocationUpdate } =
    useUserTracking(cameraRef, setCameraState);

  // lon/lat 직접 조회 (geom API 대체) — Plan SC: FR-05
  const getLonLat = useCallback((assignmentId: number): [number, number] | null => {
    const a = assignments.find((a) => a.assignmentId === assignmentId);
    if (a?.lon != null && a?.lat != null) return [a.lon, a.lat];
    return null;
  }, [assignments]);

  // Plan SC-7: 조사 탭 지도버튼 → selectedAssignmentId → cameraRef 포커스
  useEffect(() => {
    if (!selectedAssignmentId) return;
    const coord = getLonLat(selectedAssignmentId);
    if (coord) {
      setTrackingMode('off');
      setCameraState({ centerCoordinate: coord, zoomLevel: 16, animationDuration: 800 });
    }
  }, [selectedAssignmentId]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Handlers ---
  const handleParcelPress = useCallback((pnu: string) => {
    if (statusMap.has(pnu)) setSelectedPnu(pnu);
  }, [statusMap]);

  const handleClusterPress = useCallback((coords: [number, number], currentZoom: number) => {
    setTrackingMode('off');
    setCameraState({ centerCoordinate: coords, zoomLevel: currentZoom + 2, animationDuration: 400 });
  }, [setTrackingMode]);

  const handleSearchSelect = useCallback(async (pnu: string) => {
    setTrackingMode('off');
    const entry = statusMap.get(pnu);
    if (!entry) return;
    const coord = getLonLat(entry.assignmentId);
    if (coord) {
      setCameraState({ centerCoordinate: coord, zoomLevel: 16, animationDuration: 800 });
      setTimeout(() => setSelectedPnu(pnu), 900);
    }
  }, [getLonLat, statusMap, setTrackingMode]);

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
    if (isMeasuring) return;
    setSelectedPnu(null);
    Keyboard.dismiss();
  }, [isMeasuring]);

  if (!glyphsUrl) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <Stack.Screen options={{ title: 'map', headerShown: false, gestureEnabled: false }} />
        <ActivityIndicator size="large" color="#4dabf7" />
      </View>
    );
  }

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
        mapStyle={buildMapStyle(glyphsUrl)}
        onPress={onMapPress}
        onRegionIsChanging={(e: any) => {
          // Fix #2: isHighZoom 업데이트 제외 — onRegionIsChanging은 매 프레임 발화
          if (e.properties?.heading != null) setMapBearing(e.properties.heading);
          if (isMeasuring && e.geometry?.coordinates) setCurrentCenter(e.geometry.coordinates);
        }}
        onRegionDidChange={(e: any) => {
          const zoom = e.properties?.zoomLevel;
          if (zoom != null) {
            setMapZoom(zoom);
            // 래치: 한 번 true가 되면 유지 — z≥14에서 polygon geom 백그라운드 prefetch 시작
            if (zoom >= 14) setGeomPrefetchEnabled(true);
          }
          if (e.properties?.heading != null) setMapBearing(e.properties.heading);
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
          centroidCollection={centroidCollection}
          polygonCollection={polygonCollection}
          onParcelPress={handleParcelPress}
          onClusterPress={handleClusterPress}
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
        <SearchBar statusMap={statusMap} onSelect={handleSearchSelect} />
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
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#495057', marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: '#868e96' },
});
