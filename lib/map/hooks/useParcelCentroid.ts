// Plan SC: SC-2, SC-4 — PNU → WFS centroid 조회 + 캐싱
import { useCallback, useRef } from 'react';

const PROXY_URL = 'https://farmfield.kr/proxy.jsp';
const GEOSERVER_WFS = 'http://112.218.160.197:1607/geoserver/wfs';

/**
 * PNU로 필지 중심 좌표를 WFS에서 조회하고 캐싱합니다.
 * 동일 PNU 재조회 시 캐시에서 즉시 반환.
 */
export function useParcelCentroid() {
  const cache = useRef<Map<string, [number, number]>>(new Map());

  const getCentroid = useCallback(async (pnu: string): Promise<[number, number] | null> => {
    // 캐시 확인
    if (cache.current.has(pnu)) return cache.current.get(pnu)!;

    try {
      const cql = `pnu='${pnu}'`;
      // EPSG:3857로 요청 (Geoserver 기본), 응답 좌표를 4326으로 변환
      const params = `service=WFS&version=1.1.0&request=GetFeature&typeName=ekrgis:v_fml_lot&outputFormat=application/json&srsname=EPSG:3857&cql_filter=${encodeURIComponent(cql)}&propertyName=geom,pnu`;
      const body = `url=${encodeURIComponent(GEOSERVER_WFS)}&${params}`;

      const res = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      if (!res.ok) return null;
      const data = await res.json();

      if (!data.features?.length) return null;

      const geometry = data.features[0].geometry;
      const raw = calculateCentroid(geometry);
      if (!raw) return null;

      // EPSG:3857 → EPSG:4326 변환
      const centroid = mercatorToWgs84(raw);
      cache.current.set(pnu, centroid);
      return centroid;
    } catch (e) {
      if (__DEV__) console.warn('[useParcelCentroid] WFS error:', e);
      return null;
    }
  }, []);

  return { getCentroid };
}

/** EPSG:3857 → EPSG:4326 */
function mercatorToWgs84([x, y]: [number, number]): [number, number] {
  const lng = (x * 180) / 20037508.34;
  const lat = (Math.atan(Math.exp((y * Math.PI) / 20037508.34)) * 360) / Math.PI - 90;
  return [lng, lat];
}

/** 간단한 중심점 계산 (폴리곤 좌표 평균) */
function calculateCentroid(geometry: any): [number, number] | null {
  if (!geometry?.coordinates) return null;

  let coords: number[][] = [];

  if (geometry.type === 'Polygon') {
    coords = geometry.coordinates[0];
  } else if (geometry.type === 'MultiPolygon') {
    // 첫 번째 폴리곤의 외곽 링
    coords = geometry.coordinates[0][0];
  } else {
    return null;
  }

  if (coords.length === 0) return null;

  let sumLng = 0, sumLat = 0;
  for (const [lng, lat] of coords) {
    sumLng += lng;
    sumLat += lat;
  }

  return [sumLng / coords.length, sumLat / coords.length];
}
