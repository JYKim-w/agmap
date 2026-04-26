// Design Ref: field-survey-map-ux.design.md §2.1, §3.2 — centroid + urgency + style 통합 hook
// Plan SC: FR-01~FR-06 (centroid 0-API preferred, geom API fallback for null lon/lat)
import { useEffect, useMemo, useRef, useState } from 'react';
import { getAssignmentGeom } from '@/lib/api/survey';
import { useAssignmentStore } from '@/lib/store/assignments';
import {
  INCOMPLETE_STATUSES,
  STATUS_COLORS,
  URGENCY_STYLES,
  type ParcelStatusEntry,
  type ParcelStyleProperties,
  type SurveyStatus,
  type UrgencyLevel,
} from '../types';
import type { Assignment } from '@/lib/api/types';

function computeStatus(a: Assignment): SurveyStatus {
  if (!a.resultId) return 'NOT_SURVEYED';
  if (a.resultStatus === 'DRAFT') return 'DRAFT';
  if (a.resultStatus === 'APPROVED') return 'APPROVED';
  if (a.resultStatus === 'REJECTED') return 'REJECTED';
  return 'SUBMITTED';
}

function computeUrgency(dueDate: string, status: SurveyStatus): {
  level: UrgencyLevel; priority: number; dDayLabel: string;
} {
  if (!INCOMPLETE_STATUSES.includes(status)) {
    return { level: 'NORMAL', priority: 0, dDayLabel: '' };
  }
  try {
    const diffDays = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
    if (diffDays < 0)  return { level: 'OVERDUE',  priority: 3, dDayLabel: '기한초과' };
    if (diffDays <= 3) return { level: 'CRITICAL', priority: 2, dDayLabel: `D-${diffDays}` };
    if (diffDays <= 7) return { level: 'WARNING',  priority: 1, dDayLabel: `D-${diffDays}` };
  } catch {}
  return { level: 'NORMAL', priority: 0, dDayLabel: '' };
}

// lon/lat null fallback: polygon geom에서 centroid 계산
function calcCentroid(geom: any): [number, number] | null {
  if (!geom?.coordinates) return null;
  let coords: number[][] = [];
  if (geom.type === 'Polygon') coords = geom.coordinates[0];
  else if (geom.type === 'MultiPolygon') coords = geom.coordinates[0][0];
  else return null;
  if (!coords.length) return null;
  let sumLng = 0, sumLat = 0;
  for (const [lng, lat] of coords) { sumLng += lng; sumLat += lat; }
  return [sumLng / coords.length, sumLat / coords.length];
}

export function useParcelStyle(activeFilters: Set<SurveyStatus>) {
  const assignments = useAssignmentStore((s) => s.assignments);
  const rejected = useAssignmentStore((s) => s.rejected);

  // geom API fallback cache: assignmentId → [lon, lat] | null
  const centroidCache = useRef<Map<number, [number, number] | null>>(new Map());
  const [centroidVersion, setCentroidVersion] = useState(0);

  // statusMap: 전체 (필터 무관) — 항상 동기적으로 계산
  const statusMap = useMemo(() => {
    const map = new Map<string, ParcelStatusEntry>();
    for (const a of [...assignments, ...rejected]) {
      if (!a.pnu) continue;
      const status = computeStatus(a);
      const { level, dDayLabel } = computeUrgency(a.dueDate ?? '', status);
      map.set(a.pnu, {
        pnu: a.pnu,
        assignmentId: a.assignmentId,
        status,
        address: a.address,
        surveyedAt: typeof a.surveyedAt === 'string' ? a.surveyedAt : null,
        riskGrade: (a.riskGrade ?? 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW',
        dueDate: a.dueDate ?? '',
        urgencyLevel: level,
        dDayLabel,
        rejectCount: a.rejectCount,
        validationWarnings: a.validationWarnings,
      });
    }
    return map;
  }, [assignments, rejected]);

  // lon/lat null인 항목만 geom API fallback 비동기 fetch
  useEffect(() => {
    const all = [...assignments, ...rejected];
    const missing = all.filter(
      (a) => a.pnu && (a.lon == null || a.lat == null) && !centroidCache.current.has(a.assignmentId),
    );
    if (missing.length === 0) return;

    let active = true;
    Promise.all(
      missing.map(async (a) => {
        try {
          const res = await getAssignmentGeom(a.assignmentId);
          if (res.success && res.data) {
            const geom = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
            centroidCache.current.set(a.assignmentId, calcCentroid(geom));
          } else {
            centroidCache.current.set(a.assignmentId, null);
          }
        } catch {
          centroidCache.current.set(a.assignmentId, null);
        }
      }),
    ).then(() => {
      if (active) setCentroidVersion((v) => v + 1);
    });

    return () => { active = false; };
  }, [assignments, rejected]);

  // centroidCollection: lon/lat 우선, null이면 cache fallback
  const centroidCollection = useMemo(() => {
    const features: Array<{
      type: 'Feature';
      geometry: { type: 'Point'; coordinates: [number, number] };
      properties: ParcelStyleProperties;
    }> = [];

    for (const a of [...assignments, ...rejected]) {
      if (!a.pnu) continue;

      const status = computeStatus(a);
      if (activeFilters.size > 0 && !activeFilters.has(status)) continue;

      let coords: [number, number];
      if (a.lon != null && a.lat != null) {
        coords = [a.lon, a.lat];
      } else {
        const fallback = centroidCache.current.get(a.assignmentId);
        if (!fallback) continue;
        coords = fallback;
      }

      const { level, priority: urgencyPriority, dDayLabel } = computeUrgency(a.dueDate ?? '', status);
      const sc = STATUS_COLORS[status];
      const uc = URGENCY_STYLES[level];

      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: coords },
        properties: {
          pnu: a.pnu,
          assignmentId: a.assignmentId,
          status,
          statusFill: sc.fill,
          statusStroke: sc.stroke,
          urgencyLevel: level,
          urgencyPriority,
          urgencyColor: uc.ringColor,
          urgencyStroke: uc.strokeColor,
          urgencyWidth: uc.strokeWidth,
          urgencyOpacity: uc.strokeOpacity,
          urgencyTextColor: uc.textColor,
          dDayLabel,
          priority: a.priority ?? 0,
        },
      });
    }

    return { type: 'FeatureCollection' as const, features };
  // centroidVersion 포함 — cache 업데이트 시 재계산
  }, [assignments, rejected, activeFilters, centroidVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  return { statusMap, centroidCollection };
}
