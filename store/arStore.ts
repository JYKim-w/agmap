import { create } from 'zustand';

export interface ARVertex {
  gps: [number, number]; // GPS coordinates [lng, lat]
  local: [number, number]; // Local coordinates [x, z]
  distance: number; // Distance from origin in meters
  bearing: number; // Bearing from origin in degrees
}

interface ARStore {
  isARActive: boolean;
  origin: [number, number] | null;
  vertices: ARVertex[]; // detailed vertex information
  points: [number, number][]; // GPS coordinates (for compatibility)
  area: number;

  setIsARActive: (active: boolean) => void;
  setOrigin: (origin: [number, number]) => void;
  addVertex: (vertex: ARVertex) => void;
  setArea: (area: number) => void;
  resetAR: () => void;
}

const useARStore = create<ARStore>((set) => ({
  isARActive: false,
  origin: null,
  vertices: [],
  points: [],
  area: 0,

  setIsARActive: (active) => set({ isARActive: active }),
  setOrigin: (origin) => set({ origin }),
  addVertex: (vertex) =>
    set((state) => ({
      vertices: [...state.vertices, vertex],
      points: [...state.points, vertex.gps],
    })),
  setArea: (area) => set({ area }),
  resetAR: () => set({ origin: null, vertices: [], points: [], area: 0 }),
}));

export default useARStore;
