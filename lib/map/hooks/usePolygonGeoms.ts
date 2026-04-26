// Design Ref: field-survey-map-ux.design.md §3.4 — polygon geom lazy 로딩
// Plan SC: FR-06 (z≥13 진입 시만 fetch), FR-03/FR-04 (urgency props 포함)
import { useEffect, useRef, useState } from 'react';
import { getAssignmentGeom } from '@/lib/api/survey';
import { useAssignmentStore } from '@/lib/store/assignments';
import { STATUS_COLORS, type ParcelStatusEntry, type SurveyStatus } from '../types';

interface PolygonFeature {
  type: 'Feature';
  geometry: object;
  properties: {
    pnu: string;
    jibun: string;
    assignmentId: number;
    status: SurveyStatus;
    urgencyLevel: string;
    fillColor: string;
    statusStroke: string;
  };
}

// PNU(19자리) → 지번 문자열 (예: "123", "산 45-6")
function pnuToJibun(pnu: string): string {
  if (pnu.length < 19) return pnu;
  const isMountain = pnu[10] === '1';
  const mainNum = parseInt(pnu.substring(11, 15), 10);
  const subNum = parseInt(pnu.substring(15, 19), 10);
  const prefix = isMountain ? '산 ' : '';
  return subNum > 0 ? `${prefix}${mainNum}-${subNum}` : `${prefix}${mainNum}`;
}

interface PolygonCollection {
  type: 'FeatureCollection';
  features: PolygonFeature[];
}

const EMPTY: PolygonCollection = { type: 'FeatureCollection', features: [] };

export function usePolygonGeoms(
  statusMap: Map<string, ParcelStatusEntry>,
  enabled: boolean,               // z≥14 최초 진입 시 true (래치) — 표시는 z≥16
  activeFilters: Set<SurveyStatus>, // centroid와 동일 필터
): PolygonCollection {
  const assignments = useAssignmentStore((s) => s.assignments);
  const rejected = useAssignmentStore((s) => s.rejected);
  const [geomCollection, setGeomCollection] = useState<PolygonCollection>(EMPTY);
  const cache = useRef<Map<number, object | null>>(new Map());
  const prevKeyRef = useRef('');

  useEffect(() => {
    if (!enabled) return;

    const all = [...assignments, ...rejected];
    if (!all.length) {
      setGeomCollection(EMPTY);
      return;
    }

    const key = all.map((a) => a.assignmentId).sort().join(',');
    if (key === prevKeyRef.current) return;
    prevKeyRef.current = key;

    let cancelled = false;

    async function fetchAll() {
      const features: PolygonFeature[] = [];

      await Promise.all(
        all.map(async (a) => {
          if (!a.pnu) return;

          const entry = statusMap.get(a.pnu);
          const status: SurveyStatus = entry?.status ?? 'NOT_SURVEYED';

          // Fix #4: activeFilters 동기화 — centroid와 동일
          if (activeFilters.size > 0 && !activeFilters.has(status)) return;

          let geometry = cache.current.get(a.assignmentId);
          if (geometry === undefined) {
            try {
              const res = await getAssignmentGeom(a.assignmentId);
              if (res.success && res.data) {
                geometry = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
              } else {
                geometry = null;
              }
            } catch {
              geometry = null;
            }
            cache.current.set(a.assignmentId, geometry);
          }

          if (!geometry) return;

          const sc = STATUS_COLORS[status];

          features.push({
            type: 'Feature',
            geometry,
            properties: {
              pnu: a.pnu,
              jibun: pnuToJibun(a.pnu),
              assignmentId: a.assignmentId,
              status,
              urgencyLevel: entry?.urgencyLevel ?? 'NORMAL',
              fillColor: sc.fill,
              statusStroke: sc.stroke,
            },
          });
        }),
      );

      if (!cancelled) setGeomCollection({ type: 'FeatureCollection', features });
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [assignments, rejected, statusMap, enabled, activeFilters]);

  return geomCollection;
}
