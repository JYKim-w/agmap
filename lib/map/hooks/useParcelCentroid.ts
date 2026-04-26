// 필지 centroid 조회 — GET /mobile/api/survey/assignment/{assignId}/geom
// farmfield.kr WFS 대체 (EPSG:4326 직반환, 좌표 변환 불필요)
import { useCallback, useRef } from 'react';
import { getAssignmentGeom } from '@/lib/api/survey';

export function useParcelCentroid() {
  const cache = useRef<Map<number, [number, number]>>(new Map());

  const getCentroid = useCallback(async (assignmentId: number): Promise<[number, number] | null> => {
    if (cache.current.has(assignmentId)) return cache.current.get(assignmentId)!;

    try {
      const res = await getAssignmentGeom(assignmentId);
      if (!res.success || !res.data) return null;

      const geojson = JSON.parse(res.data);
      const centroid = calcCentroid(geojson);
      if (!centroid) return null;

      cache.current.set(assignmentId, centroid);
      return centroid;
    } catch (e) {
      if (__DEV__) console.warn('[useParcelCentroid] geom error:', e);
      return null;
    }
  }, []);

  return { getCentroid };
}

function calcCentroid(geometry: any): [number, number] | null {
  if (!geometry?.coordinates) return null;

  let coords: number[][] = [];
  if (geometry.type === 'Polygon') {
    coords = geometry.coordinates[0];
  } else if (geometry.type === 'MultiPolygon') {
    coords = geometry.coordinates[0][0];
  } else {
    return null;
  }

  if (!coords.length) return null;

  let sumLng = 0, sumLat = 0;
  for (const [lng, lat] of coords) {
    sumLng += lng;
    sumLat += lat;
  }
  return [sumLng / coords.length, sumLat / coords.length];
}
