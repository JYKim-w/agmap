import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface PermissionState {
  location: boolean;
  camera: boolean;
  setPermissions: (location: boolean, camera: boolean) => void;
}

const createStore = (set) => ({
  location: false,
  camera: false,
  setPermissions: (location, camera) => set({ location, camera }),
});

export default create<PermissionState>()(
  process.env.NODE_ENV === 'development'
    ? devtools(createStore, { name: 'Permission Store' })
    : createStore
);
