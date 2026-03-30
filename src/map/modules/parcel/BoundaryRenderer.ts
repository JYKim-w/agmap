import * as THREE from 'three';
import { gpsToLocal } from '../gis/transform';

export class BoundaryRenderer {
  /**
   * Converts GeoJSON Polygon to a Three.js LineLoop
   */
  static createBoundaryLine(origin: [number, number], coordinates: number[][][], color: string = '#00ff00'): THREE.Group {
    const group = new THREE.Group();
    
    // coordinates[0] is the exterior ring
    const exteriorRing = coordinates[0];
    const points: THREE.Vector3[] = [];
    
    exteriorRing.forEach(([lng, lat]) => {
      const [x, z] = gpsToLocal(origin, [lng, lat]);
      // Y = 0 for ground level, but we might want to lift it slightly or adjust per frame
      points.push(new THREE.Vector3(x, 0, z));
    });
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color, linewidth: 3 });
    const line = new THREE.LineLoop(geometry, material);
    
    group.add(line);
    
    return group;
  }

  /**
   * Helper to update positions if needed (e.g. height adjustment)
   */
  static updateHeight(group: THREE.Group, height: number) {
    group.position.y = height;
  }
}
