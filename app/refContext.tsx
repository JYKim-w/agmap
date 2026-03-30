import { createContext, useContext, useRef, useState } from 'react';

import { CameraRef, MapViewRef } from '@maplibre/maplibre-react-native';

interface MapCameraState {
  centerCoordinate?: number[];
  zoomLevel?: number;
  heading?: number;
  animationDuration?: number;
  type?: 'move' | 'flyTo';
}

interface RefContextType {
  mapRef: React.RefObject<MapViewRef>;
  cameraRef: React.RefObject<CameraRef>;
  cameraState: MapCameraState | null;
  setCameraState: React.Dispatch<React.SetStateAction<MapCameraState | null>>;
  triggerLayerReload: number;
  reloadFeatureData: () => void;
  clearSelection: () => void;
  selectedPnu: string | null;
  setSelectedPnu: React.Dispatch<React.SetStateAction<string | null>>;
}

const RefContext = createContext<RefContextType | null>(null);

export const useRefContext = () => {
  const context = useContext(RefContext);
  if (!context) {
    throw new Error('useRefContext must be used within a RefProvider');
  }
  return context;
};

export const RefProvider = ({ children }) => {
  const mapRef = useRef<MapViewRef>(null);
  const cameraRef = useRef<CameraRef>(null);
  const [cameraState, setCameraState] = useState<MapCameraState | null>(null);
  
  // States used to manually trigger useEffect re-renders for WMS refresh
  const [triggerLayerReload, setTriggerLayerReload] = useState(0);
  const [selectedPnu, setSelectedPnu] = useState<string | null>(null);

  const reloadFeatureData = () => {
    setTriggerLayerReload((prev) => prev + 1);
  };

  const clearSelection = () => {
    setSelectedPnu(null);
  };

  const refs: RefContextType = {
    mapRef,
    cameraRef,
    cameraState,
    setCameraState,
    triggerLayerReload,
    reloadFeatureData,
    clearSelection,
    selectedPnu,
    setSelectedPnu,
  };

  return <RefContext.Provider value={refs}>{children}</RefContext.Provider>;
};

export default RefProvider;
