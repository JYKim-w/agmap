// Design Ref: §3 — 상태 타입 + 색상 정의

/** 필지 조사 상태 (지도 표시용) */
export type SurveyStatus =
  | 'NOT_SURVEYED'
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED';

/** PNU → 상태 + 할당 정보 매핑 */
export interface ParcelStatusEntry {
  pnu: string;
  assignmentId: number;
  status: SurveyStatus;
  address: string;
  surveyedAt: string | null;
  riskGrade: 'HIGH' | 'MEDIUM' | 'LOW';
}

/** 상태별 색상 정의 */
export const STATUS_COLORS: Record<SurveyStatus, { fill: string; stroke: string }> = {
  NOT_SURVEYED: { fill: '#E03131', stroke: '#C92A2A' },
  DRAFT:        { fill: '#FCC419', stroke: '#E67700' },
  SUBMITTED:    { fill: '#339AF0', stroke: '#1971C2' },
  APPROVED:     { fill: '#51CF66', stroke: '#2F9E44' },
  REJECTED:     { fill: '#FF922B', stroke: '#E8590C' },
};

/** 상태 한글 라벨 */
export const STATUS_LABELS: Record<SurveyStatus, string> = {
  NOT_SURVEYED: '미조사',
  DRAFT: '임시저장',
  SUBMITTED: '제출',
  APPROVED: '승인',
  REJECTED: '반려',
};
