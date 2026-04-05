// Design Ref: §10.1 — assignment → PNU 매핑 + MapLibre 스타일 표현식 생성
import { useMemo } from 'react';
import { useAssignmentStore } from '@/lib/store/assignments';
import { STATUS_COLORS, type SurveyStatus, type ParcelStatusEntry } from '../types';

export function useSurveyStatusMap(activeFilters: Set<SurveyStatus>) {
  const assignments = useAssignmentStore((s) => s.assignments);
  const rejected = useAssignmentStore((s) => s.rejected);

  return useMemo(() => {
    const statusMap = new Map<string, ParcelStatusEntry>();

    // Plan SC: SC-1 — 할당 필지 상태 매핑
    for (const a of assignments) {
      if (!a.pnu) continue;
      const status: SurveyStatus =
        !a.resultId ? 'NOT_SURVEYED'
        : a.resultStatus === 'DRAFT' ? 'DRAFT'
        : a.resultStatus === 'APPROVED' ? 'APPROVED'
        : 'SUBMITTED'; // SUBMITTED, REVIEWING 등
      statusMap.set(a.pnu, {
        pnu: a.pnu,
        assignmentId: a.assignmentId,
        status,
        address: a.address,
        riskGrade: a.riskGrade,
        surveyedAt: typeof a.surveyedAt === 'string' ? a.surveyedAt : null,
      });
    }

    // rejected 목록은 REJECTED 상태로 덮어쓰기
    for (const r of rejected) {
      if (!r.pnu) continue;
      statusMap.set(r.pnu, {
        pnu: r.pnu,
        assignmentId: r.assignmentId,
        status: 'REJECTED',
        address: r.address,
        riskGrade: r.riskGrade,
        surveyedAt: typeof r.surveyedAt === 'string' ? r.surveyedAt : null,
      });
    }

    // Plan SC: SC-2 — 필터 적용 + MapLibre match 표현식 생성
    const showAll = activeFilters.size === 0;
    const fillPairs: string[] = [];
    const linePairs: string[] = [];

    for (const [pnu, entry] of statusMap) {
      if (!showAll && !activeFilters.has(entry.status)) continue;
      fillPairs.push(pnu, STATUS_COLORS[entry.status].fill);
      linePairs.push(pnu, STATUS_COLORS[entry.status].stroke);
    }

    // ['match', ['get', 'pnu'], pnu1, color1, pnu2, color2, ..., fallback]
    const fillColorExpr: any = fillPairs.length > 0
      ? ['match', ['get', 'pnu'], ...fillPairs, 'rgba(0,0,0,0)']
      : 'rgba(0,0,0,0)';

    const lineColorExpr: any = linePairs.length > 0
      ? ['match', ['get', 'pnu'], ...linePairs, 'rgba(0,0,0,0)']
      : 'rgba(0,0,0,0)';

    return { statusMap, fillColorExpr, lineColorExpr };
  }, [assignments, rejected, activeFilters]);
}
