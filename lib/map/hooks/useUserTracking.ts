// Design Ref: §5.3 — GPS Kalman 필터 (src/map에서 이식)
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef } from 'react';
import { useMapStateStore } from '@/store/mapStateStore';

export const isInsideSouthKorea = (coords: { latitude: number; longitude: number }) =>
  coords.latitude >= 33 && coords.latitude <= 38.6 &&
  coords.longitude >= 124.6 && coords.longitude <= 131.9;

class KalmanFilter1D {
  private estimate: number;
  private errorEstimate: number;
  private errorMeasure: number;
  private q: number;

  constructor(initial: number, errorEst = 0.0001, errorMeas = 0.00005, q = 0.000001) {
    this.estimate = initial;
    this.errorEstimate = errorEst;
    this.errorMeasure = errorMeas;
    this.q = q;
  }

  update(measurement: number): number {
    this.errorEstimate += this.q;
    const gain = this.errorEstimate / (this.errorEstimate + this.errorMeasure);
    this.estimate += gain * (measurement - this.estimate);
    this.errorEstimate *= (1 - gain);
    return this.estimate;
  }

  reset(value: number) {
    this.estimate = value;
    this.errorEstimate = 0.0001;
  }
}

function smoothHeading(current: number, target: number, alpha: number): number {
  let diff = target - current;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return (current + alpha * diff + 360) % 360;
}

export const useUserTracking = (cameraRef: any, setCameraState?: (state: null) => void) => {
  const setTrackingMode = useMapStateStore((s) => s.setTrackingMode);
  const setUserCoords = useMapStateStore((s) => s.setUserCoords);
  const setUserHeading = useMapStateStore((s) => s.setUserHeading);

  const hasMovedToUser = useRef(false);
  const kalmanLng = useRef<KalmanFilter1D | null>(null);
  const kalmanLat = useRef<KalmanFilter1D | null>(null);
  const smoothedHeading = useRef(0);

  useEffect(() => { Location.requestForegroundPermissionsAsync(); }, []);

  const onLocationUpdate = useCallback((location: any) => {
    if (!location.coords) return;
    const { longitude, latitude, heading } = location.coords;
    if (latitude === 0 || longitude === 0) return;

    if (!kalmanLng.current) {
      kalmanLng.current = new KalmanFilter1D(longitude);
      kalmanLat.current = new KalmanFilter1D(latitude);
    }

    // GPS jump detection (~50m) → reset filters
    const current = useMapStateStore.getState().userCoords;
    if (current) {
      if (Math.abs(current[0] - longitude) > 0.0005 || Math.abs(current[1] - latitude) > 0.0005) {
        kalmanLng.current.reset(longitude);
        kalmanLat.current!.reset(latitude);
      }
    }

    const fLng = kalmanLng.current.update(longitude);
    const fLat = kalmanLat.current!.update(latitude);

    // ~2m 이내 변화 무시
    const prev = useMapStateStore.getState().userCoords;
    if (prev && Math.abs(prev[0] - fLng) < 0.00002 && Math.abs(prev[1] - fLat) < 0.00002) {
      if (heading !== null && heading >= 0) {
        smoothedHeading.current = smoothHeading(smoothedHeading.current, heading, 0.3);
        setUserHeading(smoothedHeading.current);
      }
      return;
    }

    setUserCoords([fLng, fLat]);
    if (heading !== null && heading >= 0) {
      smoothedHeading.current = smoothHeading(smoothedHeading.current, heading, 0.3);
      setUserHeading(smoothedHeading.current);
    }
  }, [setUserCoords, setUserHeading]);

  // 첫 GPS fix 시 사용자 위치로 이동
  useEffect(() => {
    const check = () => {
      const coords = useMapStateStore.getState().userCoords;
      if (coords && !hasMovedToUser.current && isInsideSouthKorea({ latitude: coords[1], longitude: coords[0] })) {
        cameraRef.current?.setCamera({ centerCoordinate: coords, zoomLevel: 14, animationDuration: 1000 });
        hasMovedToUser.current = true;
      }
    };
    const unsub = useMapStateStore.subscribe((s) => { if (s.userCoords && !hasMovedToUser.current) check(); });
    check();
    return () => unsub();
  }, [cameraRef]);

  const toggleTrackingMode = () => {
    const mode = useMapStateStore.getState().trackingMode;
    if (mode === 'off') { setCameraState?.(null); setTrackingMode('normal'); }
    else if (mode === 'normal') { setCameraState?.(null); setTrackingMode('compass'); }
    else { setTrackingMode('off'); }
  };

  const onUserTrackingModeChange = (event: any) => {
    if (!event?.nativeEvent?.payload?.followUserLocation) setTrackingMode('off');
  };

  return { toggleTrackingMode, onUserTrackingModeChange, onLocationUpdate };
};
