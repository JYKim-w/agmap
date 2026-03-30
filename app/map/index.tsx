import MapLibreGL from '@maplibre/maplibre-react-native';
import { area, length, polygon as turfPolygon, lineString as turfLineString } from '@turf/turf';
import { Stack } from 'expo-router';
import { IconButton, View } from 'native-base';
import React, { memo, useEffect } from 'react';
import { Alert, View as RNView, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import Config from '../js/config';
import { useRefContext } from '../refContext';
import bottomStore from '@/store/bottomStore';
import inspectInputStore from '@/store/inspectInputStore';
import inspectStore from '@/store/inspectStore';
import { useMapStateStore } from '@/store/mapStateStore';
import useMeasureStore from '@/store/measureStore';
import optionStore from '@/store/optionStore';
import useSearchStore from '@/store/searchStore';
import BottomBar from '@/src/map/components/bottomBar';
import BottomView from '@/src/map/components/bottomView';
import SearchPinMarker from '@/src/map/components/SearchPinMarker';

// Sub-components & Hooks
import {
  CompassButton,
  LayersIcon,
  LocationIcon,
  UserLocationIcon,
} from '@/src/map/components/MapIcons';
import {
  GeoserverWFSLayers,
  GeoserverWMSLayers,
  MeasureLayer,
  SelectionLayer,
  VWorldBaseLayers,
  VWorldWMSLayers
} from '@/src/map/components/MapLayers';
import { useMapPersistence } from '@/src/map/hooks/useMapPersistence';
import { useUserTracking } from '@/src/map/hooks/useUserTracking';
import MeasureCrosshair from '@/src/map/components/MeasureCrosshair';
import MeasureInfoCard from '@/src/map/components/MeasureInfoCard';
import MeasureControlBar from '@/src/map/components/MeasureControlBar';

// MapLibreGL initialization
MapLibreGL.setAccessToken(null);

/**
 * Isolated Location Indicator Component
 * Smooth coordinate updates via Kalman filter (in useUserTracking).
 * Uses MarkerView for Fabric compatibility.
 */
const LocationIndicator = memo(() => {
  const userCoords = useMapStateStore((s) => s.userCoords);
  const userHeading = useMapStateStore((s) => s.userHeading);
  const trackingMode = useMapStateStore((s) => s.trackingMode);
  const isMapReady = useMapStateStore((s) => s.isMapReady);
  const mapBearing = useMapStateStore((s) => s.mapBearing);

  if (!isMapReady || !userCoords || !Array.isArray(userCoords) || userCoords.length < 2) return null;
  if (userCoords[0] === 0 || userCoords[1] === 0) return null;
  if (!isFinite(userCoords[0]) || !isFinite(userCoords[1])) return null;

  const displayHeading =
    trackingMode === 'compass' ? 0 : userHeading - mapBearing;

  return (
    <MapLibreGL.MarkerView
      coordinate={userCoords}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <UserLocationIcon heading={displayHeading} mode={trackingMode} />
    </MapLibreGL.MarkerView>
  );
});

/**
 * Isolated Map Controls (FABs)
 * Subscribes only to bearing and mode to prevent re-rendering the MapView.
 */
const MapControls = memo(
  ({ onTrackingPress, onCompassPress }: any) => {
    const mapBearing = useMapStateStore((s) => s.mapBearing);
    const trackingMode = useMapStateStore((s) => s.trackingMode);
    const setActiveMenu = bottomStore((s) => s.setActiveMenu);
    const setIndex = bottomStore((s) => s.setIndex);

    const showCompass = trackingMode === 'compass' || Math.abs(mapBearing) > 2;

    return (
      <RNView style={styles.fabContainer}>
        <IconButton
          style={styles.glassFab}
          icon={<LayersIcon />}
          onPress={() => {
            setActiveMenu('setting');
            setIndex(1);
          }}
          _pressed={{ bg: 'rgba(255, 255, 255, 0.4)' }}
        />

        <IconButton
          style={styles.glassFab}
          icon={<LocationIcon mode={trackingMode} />}
          onPress={onTrackingPress}
          _pressed={{ bg: 'rgba(255, 255, 255, 0.4)' }}
        />

        {showCompass && (
          <IconButton
            style={styles.glassFab}
            icon={<CompassButton bearing={mapBearing} />}
            onPress={onCompassPress}
            _pressed={{ bg: 'rgba(255, 255, 255, 0.4)' }}
          />
        )}
      </RNView>
    );
  }
);

/**
 * Dedicated Measurement Calculation Component
 * Defined outside MapScreen to prevent re-creation of the component on every parent render.
 */
const MeasureCalculator = memo(() => {
  const isMeasuringInner = useMeasureStore((s) => s.isMeasuring);
  const measurePointsInner = useMeasureStore((s) => s.measurePoints);
  const currentCenterInner = useMeasureStore((s) => s.currentCenter);
  const setMeasureDistance = useMeasureStore((s) => s.setMeasureDistance);
  const setStoreMeasureAreaInner = useMeasureStore((s) => s.setMeasureArea);

  useEffect(() => {
    if (!isMeasuringInner) return;
    
    try {
        let totalDist = 0;
        if (measurePointsInner.length >= 2) {
            const line = turfLineString(measurePointsInner);
            totalDist = length(line, { units: 'meters' });
        }
        
        if (measurePointsInner.length > 0 && currentCenterInner) {
            const lastPoint = measurePointsInner[measurePointsInner.length - 1];
            const guideLine = turfLineString([lastPoint, currentCenterInner]);
            totalDist += length(guideLine, { units: 'meters' });
        }
        setMeasureDistance(totalDist);

        if (measurePointsInner.length >= 3) {
            const poly = turfPolygon([[...measurePointsInner, measurePointsInner[0]]]);
            setStoreMeasureAreaInner(area(poly));
        } else {
            setStoreMeasureAreaInner(0);
        }
    } catch(e) {
      console.warn('Measure calculation error:', e);
    }
  }, [measurePointsInner, isMeasuringInner, currentCenterInner, setMeasureDistance, setStoreMeasureAreaInner]);

  return null;
});

export default function MapScreen() {
  const {
    mapRef,
    cameraRef,
    cameraState,
    setCameraState,
    selectedPnu,
    setSelectedPnu,
    triggerLayerReload,
  } = useRefContext();

  const { setFieldInfo } = inspectStore();
  const { setOwnAr } = inspectInputStore();
  const { setIndex, setActiveMenu, activeMenu } = bottomStore();
  const clearSearchSelection = useSearchStore((s) => s.clearSelection);

  // Selective Measurement Store Subscriptions (Optimization: Don't subscribe to currentCenter here!)
  const isMeasuring = useMeasureStore((s) => s.isMeasuring);
  const setIsMeasuring = useMeasureStore((s) => s.setIsMeasuring);
  const measurePoints = useMeasureStore((s) => s.measurePoints);
  const setMeasurePoints = useMeasureStore((s) => s.setMeasurePoints);
  const setCurrentCenter = useMeasureStore((s) => s.setCurrentCenter);
  const setStoreMeasureArea = useMeasureStore((s) => s.setMeasureArea);
  const resetMeasure = useMeasureStore((s) => s.reset);

  const fieldInfo = inspectStore((s) => s.fieldInfo);

  const { isExpand, setExpand } = bottomStore();

  const options = optionStore((state) => state.options);
  const setMapBearing = useMapStateStore((s) => s.setMapBearing);
  const setMapZoom = useMapStateStore((s) => s.setMapZoom);
  const setMapBbox = useMapStateStore((s) => s.setMapBbox);
  const setIsMapReady = useMapStateStore((s) => s.setIsMapReady);
  const trackingMode = useMapStateStore((s) => s.trackingMode);
  const mapZoom = useMapStateStore((s) => s.mapZoom);
  const mapBbox = useMapStateStore((s) => s.mapBbox);
  const setTrackingMode = useMapStateStore((s) => s.setTrackingMode);

  // Memoize map style to prevent re-loading on every render
  const mapStyle = React.useMemo(
    () =>
      JSON.stringify({
        version: 8,
        name: 'VWorld',
        sources: {
          'vworld-base': {
            type: 'raster',
            tiles: [
              // `https://cdn.vworld.kr/2d/vector/Base/service/{z}/{y}/{x}.png`
              // `https://api.vworld.kr/req/wmts/vector/${Config.api.vworldKey}/Base/{z}/{y}/{x}.png`,
              `https://api.vworld.kr/req/wmts/1.0.0/${Config.api.vworldKey}/Base/{z}/{y}/{x}.png`,
            ],
            tileSize: 256,
            attribution: '© VWorld',
            scheme: 'xyz',
            minzoom: 6,
            maxzoom: 19,
          },
          'vworld-satellite': {
            type: 'raster',
            tiles: [
              `https://api.vworld.kr/req/wmts/1.0.0/${Config.api.vworldKey}/Satellite/{z}/{y}/{x}.jpeg`,
            ],
            tileSize: 256,
            attribution: '© VWorld',
            scheme: 'xyz',
            minzoom: 6,
            maxzoom: 19,
          },
          'vworld-hybrid': {
            type: 'raster',
            tiles: [
              `https://api.vworld.kr/req/wmts/1.0.0/${Config.api.vworldKey}/Hybrid/{z}/{y}/{x}.png`,
            ],
            tileSize: 256,
            attribution: '© VWorld',
            scheme: 'xyz',
            minzoom: 6,
            maxzoom: 19,
          },
        },
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        layers: [],
      }),
    []
  );

  // Custom Hooks for Logic
  const { isStoreLoaded } = useMapPersistence(options);
  const { toggleTrackingMode, onUserTrackingModeChange, onLocationUpdate } =
    useUserTracking(cameraRef, setCameraState);

  // Bottom Sheet Integration: Collapse when measuring
  useEffect(() => {
    if (isMeasuring && isExpand) {
      setExpand(false);
    }
  }, [isMeasuring, isExpand, setExpand]);

  // Clean up measurement if we switch away
  useEffect(() => {
    if (isMeasuring && (activeMenu === 'search' || activeMenu === 'setting')) {
      resetMeasure();
    }
  }, [activeMenu, isMeasuring, resetMeasure]);

  // Search pin marker: clear when leaving search menu
  useEffect(() => {
    if (activeMenu !== 'search') {
      clearSearchSelection();
    }
  }, [activeMenu, clearSearchSelection]);

  const onPressCompass = async () => {
    setTrackingMode('off');
    setMapBearing(0);
    // 현재 지도 중심을 가져와서 heading만 0으로 변경
    const center = await mapRef.current?.getCenter();
    const zoom = await mapRef.current?.getZoom();
    if (center) {
      const jitter = (Math.random() - 0.5) * 0.0000001;
      setCameraState({
        centerCoordinate: [center[0] + jitter, center[1] + jitter],
        zoomLevel: zoom || undefined,
        heading: 0,
        animationDuration: 500,
      });
    }
  };

  async function onMapPress(event: any) {
    const { geometry } = event;
    const [lng, lat] = geometry.coordinates;

    // Clear search pin when tapping on map
    clearSearchSelection();

    if (isMeasuring) {
      // Removed: setMeasurePoints([...measurePoints, [lng, lat]]);
      return;
    }

    try {
      let wfsParams;
      let isInspectLayer = false;

      // Convert EPSG:4326 (lng/lat) to EPSG:3857 (Web Mercator)
      const x = (lng * 20037508.34) / 180;
      let y =
        Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
      y = (y * 20037508.34) / 180;

      // Create a small bounding box (~1m in EPSG:3857 map units) around the clicked point
      const margin = 1;
      const bboxCql = `BBOX(geom, ${x - margin}, ${y - margin}, ${x + margin}, ${y + margin}, 'EPSG:3857')`;

      if (options.inspect25) {
        // 일제정비 레이어 우선 쿼리
        wfsParams = `service=WFS&version=1.1.0&request=GetFeature&typeName=ekrgis:v_fml_lot_inspect&outputFormat=application/json&srsname=EPSG:3857&cql_filter=${encodeURIComponent(bboxCql)}`;
        isInspectLayer = true;
      } else {
        // 일반 필지 쿼리
        wfsParams = `service=WFS&version=1.1.0&request=GetFeature&typeName=ekrgis:v_fml_lot&outputFormat=application/json&srsname=EPSG:3857&cql_filter=${encodeURIComponent(bboxCql)}`;
      }

      const geoserverBase = 'http://112.218.160.197:1607/geoserver/wfs';
      // URL for the proxy script itself
      const proxyUrl = `https://farmfield.kr/proxy.jsp`;

      // The proxy expects the target 'url' to be sent as a parameter. By placing it in the POST body,
      // we ensure it correctly forwards all parameters to the Geoserver POST endpoint.
      const postBody = `url=${encodeURIComponent(geoserverBase)}&${wfsParams}`;

      let response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: postBody,
      });
      if (!response.ok) return;
      let data = await response.json();

      // 일제정비 레이어에서 결과가 없으면 일반 필지 쿼리 시도
      if (isInspectLayer && (!data.features || data.features.length === 0)) {
        wfsParams = `service=WFS&version=1.1.0&request=GetFeature&typeName=ekrgis:v_fml_lot&outputFormat=application/json&srsname=EPSG:3857&cql_filter=${encodeURIComponent(bboxCql)}`;
        const fallbackBody = `url=${encodeURIComponent(geoserverBase)}&${wfsParams}`;
        response = await fetch(proxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: fallbackBody,
        });
        if (!response.ok) return;
        data = await response.json();
        isInspectLayer = false;
      }

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const properties = feature.properties;
        const fieldInfo = {
          ...properties,
          pnu: properties.pnu,
          addr: properties.addr || properties.jibun_addr || properties.jibun, // added jibun fallback for inspect layer
          area: properties.area || properties.sm || properties.rlnd_area, // added rlnd_area fallback for inspect layer
        };

        setFieldInfo(fieldInfo);
        setSelectedPnu(properties.pnu);
        setActiveMenu('inspect'); // THIS activates the inspect panel!
        setIndex(2); // 조사 메뉴 진입 → full(90%)

        // 조사 목록 로드
        const { fetchInspectList } = inspectStore.getState();
        await fetchInspectList(properties.pnu);
      } else {
        setFieldInfo(null);
        setSelectedPnu(null);
      }
    } catch (error) {
      console.error('Failed to fetch feature info:', error);
    }
  }

  function onAddPoint() {
      const center = useMeasureStore.getState().currentCenter;
      if (!center) return;
      setMeasurePoints([...measurePoints, center]);
  }

  function onUndoPoint() {
      if (measurePoints.length > 0) {
          setMeasurePoints(measurePoints.slice(0, -1));
      }
  }

  function onResetMeasure() {
      resetMeasure();
      // 바텀시트 복귀 — 조사항목 다시 표출
      setIndex(2);
  }

  function onFinishMeasure() {
    if (measurePoints.length < 3) {
      Alert.alert('오류', '측정을 위해 최소 3개 이상의 지점을 선택해주세요.');
      return;
    }

    const points = [...measurePoints, measurePoints[0]];
    const poly = turfPolygon([points]);
    const areaInSqM = area(poly);
    const measured = Number(areaInSqM.toFixed(2));

    setStoreMeasureArea(areaInSqM);
    setOwnAr(measured);
    setIsMeasuring(false);
    resetMeasure();

    // 바텀시트 복귀 — activeMenu는 측정 진입 시 유지되므로 인덱스만 설정
    setIndex(2);

    Toast.show({
      text1: '측정 완료',
      text2: `면적: ${measured}㎡`,
      type: 'success',
    });
  }

  return (
    <View style={{ flex: 1 }}>
      <RNView style={{ flex: 1 }}>
        <Stack.Screen
          options={{
            title: 'map',
            headerShown: false,
            gestureEnabled: false,
          }}
        />

        <MapLibreGL.MapView
          ref={mapRef}
          style={{ flex: 1 }}
          logoEnabled={false}
          attributionEnabled={false}
          rotateEnabled={true}
          pitchEnabled={true}
          onPress={onMapPress}
          onRegionIsChanging={(e: any) => {
            if (e.properties && typeof e.properties.heading === 'number')
              setMapBearing(e.properties.heading);
            if (e.properties && typeof e.properties.zoomLevel === 'number')
              setMapZoom(e.properties.zoomLevel);
            
            if (isMeasuring && e.geometry && e.geometry.coordinates) {
                setCurrentCenter(e.geometry.coordinates);
            }
          }}
          onRegionDidChange={(e: any) => {
            if (e.properties && typeof e.properties.heading === 'number')
              setMapBearing(e.properties.heading);
            if (e.properties && typeof e.properties.zoomLevel === 'number')
              setMapZoom(e.properties.zoomLevel);
            if (e.properties && e.properties.visibleBounds) {
              const [[maxLng, maxLat], [minLng, minLat]] = e.properties.visibleBounds;
              setMapBbox([minLng, minLat, maxLng, maxLat]);
            }

            if (e.geometry && e.geometry.coordinates) {
                setCurrentCenter(e.geometry.coordinates);
            }
          }}
          onDidFinishLoadingStyle={() => setIsMapReady(true)}
          compassEnabled={false}
          mapStyle={mapStyle}
        >
          {/* Modularized Layers */}
          <VWorldBaseLayers mapType={options.mapType} />
          <GeoserverWMSLayers
            options={options}
            triggerLayerReload={triggerLayerReload}
          />
          <GeoserverWFSLayers options={options} mapZoom={mapZoom} mapBbox={mapBbox} />
          <VWorldWMSLayers options={options} vworldKey={Config.api.vworldKey} />
          <SelectionLayer selectedPnu={selectedPnu} />
          <SearchPinMarker />
          <MeasureLayer />

          <MapLibreGL.Camera
            ref={cameraRef}
            defaultSettings={{ centerCoordinate: [127.5, 36.5], zoomLevel: 7 }}
            minZoomLevel={6}
            maxBounds={{ ne: [132.0, 39.0], sw: [124.0, 33.0] }}
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

          <MapLibreGL.UserLocation
            visible={false}
            onUpdate={onLocationUpdate}
          />
          <LocationIndicator />
        </MapLibreGL.MapView>

        <MeasureCalculator />

        <MapControls
          onTrackingPress={toggleTrackingMode}
          onCompassPress={onPressCompass}
        />

        {isMeasuring && (
          <>
            <MeasureInfoCard />
            <MeasureCrosshair />
            <MeasureControlBar
              onAdd={onAddPoint}
              onUndo={onUndoPoint}
              onReset={onResetMeasure}
              onFinish={onFinishMeasure}
            />
          </>
        )}
      </RNView>
      <BottomView />
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    top: 50,
    right: 18,
    alignItems: 'center',
    gap: 16,
  },
  glassFab: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
