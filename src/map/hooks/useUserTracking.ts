import * as Location from 'expo-location';
import { useCallback, useEffect, useRef } from 'react';
import { useMapStateStore } from '@/store/mapStateStore';

export const isInsideSouthKorea = (coords: { latitude: number, longitude: number }) => {
  const { latitude, longitude } = coords;
  return (
    latitude >= 33 && latitude <= 38.6 &&
    longitude >= 124.6 && longitude <= 131.9
  );
};

/**
 * Simple 1D Kalman filter for GPS coordinate smoothing.
 * Balances between trusting GPS measurements and predicted position.
 */
class KalmanFilter1D {
  private estimate: number;
  private errorEstimate: number;
  private errorMeasure: number;
  private q: number; // process noise

  constructor(initialEstimate: number, errorEstimate = 0.0001, errorMeasure = 0.00005, q = 0.000001) {
    this.estimate = initialEstimate;
    this.errorEstimate = errorEstimate;
    this.errorMeasure = errorMeasure;
    this.q = q;
  }

  update(measurement: number): number {
    // Prediction step
    this.errorEstimate += this.q;

    // Update step
    const kalmanGain = this.errorEstimate / (this.errorEstimate + this.errorMeasure);
    this.estimate = this.estimate + kalmanGain * (measurement - this.estimate);
    this.errorEstimate = (1 - kalmanGain) * this.errorEstimate;

    return this.estimate;
  }

  reset(value: number) {
    this.estimate = value;
    this.errorEstimate = 0.0001;
  }
}

/**
 * Smooths heading values, handling the 0°/360° wraparound correctly.
 */
function smoothHeading(current: number, target: number, alpha: number): number {
  let diff = target - current;
  // Handle wraparound: choose shortest rotation path
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return (current + alpha * diff + 360) % 360;
}

export const useUserTracking = (cameraRef: any, setCameraState?: (state: null) => void) => {
  const setTrackingMode = useMapStateStore(s => s.setTrackingMode);
  const setUserCoords = useMapStateStore(s => s.setUserCoords);
  const setUserHeading = useMapStateStore(s => s.setUserHeading);

  const hasMovedToUserLocation = useRef(false);

  // Kalman filters for lng/lat
  const kalmanLng = useRef<KalmanFilter1D | null>(null);
  const kalmanLat = useRef<KalmanFilter1D | null>(null);
  // Smoothed heading
  const smoothedHeading = useRef(0);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync();
  }, []);

  const onLocationUpdate = useCallback((location: any) => {
    if (!location.coords) return;

    const { longitude, latitude, heading } = location.coords;

    // Guard against zero/invalid coordinates
    if (latitude === 0 || longitude === 0) return;

    // Initialize Kalman filters on first valid fix
    if (!kalmanLng.current) {
      kalmanLng.current = new KalmanFilter1D(longitude);
      kalmanLat.current = new KalmanFilter1D(latitude);
    }

    // Detect GPS jumps (> ~50m) and reset filters
    const current = useMapStateStore.getState().userCoords;
    if (current) {
      const dLng = Math.abs(current[0] - longitude);
      const dLat = Math.abs(current[1] - latitude);
      if (dLng > 0.0005 || dLat > 0.0005) {
        // Large jump — likely a GPS correction, reset filters
        kalmanLng.current.reset(longitude);
        kalmanLat.current!.reset(latitude);
      }
    }

    // Apply Kalman filter
    const filteredLng = kalmanLng.current.update(longitude);
    const filteredLat = kalmanLat.current!.update(latitude);

    // 미세 떨림 방지: ~2m 이내 변화는 무시
    const prev = useMapStateStore.getState().userCoords;
    if (prev) {
      const dLng2 = Math.abs(prev[0] - filteredLng);
      const dLat2 = Math.abs(prev[1] - filteredLat);
      if (dLng2 < 0.00002 && dLat2 < 0.00002) {
        // 좌표 변화 없이 heading만 업데이트
        if (heading !== null && heading >= 0) {
          smoothedHeading.current = smoothHeading(smoothedHeading.current, heading, 0.3);
          setUserHeading(smoothedHeading.current);
        }
        return;
      }
    }

    setUserCoords([filteredLng, filteredLat]);

    // Smooth heading with EMA (alpha=0.3 for responsive yet stable)
    if (heading !== null && heading >= 0) {
      smoothedHeading.current = smoothHeading(smoothedHeading.current, heading, 0.3);
      setUserHeading(smoothedHeading.current);
    }
  }, [setUserCoords, setUserHeading]);

  // Move to user location on first GPS fix
  useEffect(() => {
    const checkMovement = () => {
      const coords = useMapStateStore.getState().userCoords;
      if (coords && !hasMovedToUserLocation.current) {
        if (isInsideSouthKorea({ latitude: coords[1], longitude: coords[0] })) {
          cameraRef.current?.setCamera({
            centerCoordinate: coords,
            zoomLevel: 14,
            animationDuration: 1000,
          });
          hasMovedToUserLocation.current = true;
        }
      }
    };

    const unsubscribe = useMapStateStore.subscribe((state) => {
      if (state.userCoords && !hasMovedToUserLocation.current) {
        checkMovement();
      }
    });

    checkMovement();
    return () => unsubscribe();
  }, [cameraRef]);

  const toggleTrackingMode = () => {
    const mode = useMapStateStore.getState().trackingMode;
    if (mode === 'off') {
      // cameraState를 초기화해야 followUserLocation이 작동함
      setCameraState?.(null);
      setTrackingMode('normal');
    } else if (mode === 'normal') {
      setCameraState?.(null);
      setTrackingMode('compass');
    } else {
      setTrackingMode('off');
    }
  };

  const onUserTrackingModeChange = (event: any) => {
    if (!event?.nativeEvent?.payload?.followUserLocation) {
      setTrackingMode('off');
    }
  };

  return {
    toggleTrackingMode,
    onUserTrackingModeChange,
    onLocationUpdate,
  };
};
