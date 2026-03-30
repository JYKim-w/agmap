import { create } from 'zustand';

interface MapState {
  mapBearing: number;
  userCoords: [number, number] | null;
  userHeading: number;
  trackingMode: 'off' | 'normal' | 'compass';
  isMapReady: boolean;
  mapZoom: number;
  mapBbox: [number, number, number, number] | null;
  
  setMapBearing: (bearing: number) => void;
  setMapZoom: (zoom: number) => void;
  setMapBbox: (bbox: [number, number, number, number] | null) => void;
  setUserCoords: (coords: [number, number] | null) => void;
  setUserHeading: (heading: number) => void;
  setTrackingMode: (mode: 'off' | 'normal' | 'compass') => void;
  setIsMapReady: (ready: boolean) => void;
}

export const useMapStateStore = create<MapState>((set) => ({
  mapBearing: 0,
  userCoords: null,
  userHeading: 0,
  trackingMode: 'off',
  isMapReady: false,
  mapZoom: 7,
  mapBbox: null,

  setMapBearing: (mapBearing) => set({ mapBearing }),
  setMapZoom: (mapZoom) => set({ mapZoom }),
  setMapBbox: (mapBbox) => set({ mapBbox }),
  setUserCoords: (userCoords) => set({ userCoords }),
  setUserHeading: (userHeading) => set({ userHeading }),
  setTrackingMode: (trackingMode) => set({ trackingMode }),
  setIsMapReady: (isMapReady) => set({ isMapReady }),
}));
