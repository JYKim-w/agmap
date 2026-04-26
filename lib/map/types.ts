// Design Ref: field-survey-map-ux.design.md §3 — 타입 + 색상 정의 v0.2

/** 필지 조사 상태 (지도 표시용) */
export type SurveyStatus =
  | 'NOT_SURVEYED'
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED';

/** 기한 긴급도 4단계 */
export type UrgencyLevel = 'OVERDUE' | 'CRITICAL' | 'WARNING' | 'NORMAL';

/** 미완료 상태 — 긴급도 적용 대상 */
export const INCOMPLETE_STATUSES: SurveyStatus[] = ['NOT_SURVEYED', 'DRAFT', 'REJECTED'];

/** 야외 가독성 최적화 색상 시스템 (high-saturation, 위성지도 대비) */
export const STATUS_COLORS: Record<SurveyStatus, { fill: string; stroke: string }> = {
  NOT_SURVEYED: { fill: '#FF4D4D', stroke: '#CC0000' },
  DRAFT:        { fill: '#FFD43B', stroke: '#CC8800' },
  SUBMITTED:    { fill: '#4DABF7', stroke: '#1971C2' },
  APPROVED:     { fill: '#69DB7C', stroke: '#2F9E44' },
  REJECTED:     { fill: '#FFA94D', stroke: '#C94400' },
};

/** 상태 한글 라벨 */
export const STATUS_LABELS: Record<SurveyStatus, string> = {
  NOT_SURVEYED: '미조사',
  DRAFT: '임시저장',
  SUBMITTED: '제출',
  APPROVED: '승인',
  REJECTED: '반려',
};

/** 긴급도별 시각 속성 */
export const URGENCY_STYLES: Record<UrgencyLevel, {
  strokeColor: string;
  strokeWidth: number;
  strokeOpacity: number;
  ringColor: string;
  textColor: string;
  priority: number;  // 클러스터 max 집계용 숫자 (OVERDUE=3 최고)
}> = {
  OVERDUE:  { strokeColor: '#FA5252', strokeWidth: 5, strokeOpacity: 1.0, ringColor: '#FA5252', textColor: '#FA5252', priority: 3 },
  CRITICAL: { strokeColor: '#FD7E14', strokeWidth: 4, strokeOpacity: 0.9, ringColor: '#FD7E14', textColor: '#FD7E14', priority: 2 },
  WARNING:  { strokeColor: '#FAB005', strokeWidth: 3, strokeOpacity: 0.7, ringColor: '#FAB005', textColor: '#E67700', priority: 1 },
  NORMAL:   { strokeColor: 'transparent', strokeWidth: 2, strokeOpacity: 0, ringColor: 'transparent', textColor: 'transparent', priority: 0 },
};

/** centroid GeoJSON feature properties (MapLibre 표현식에서 ['get', '...']로 접근) */
export interface ParcelStyleProperties {
  pnu: string;
  assignmentId: number;
  status: SurveyStatus;
  // Axis 1 — 조사 상태
  statusFill: string;
  statusStroke: string;
  // Axis 2 — 기한 긴급도
  urgencyLevel: UrgencyLevel;
  urgencyPriority: number;    // 클러스터 집계용 (clusterProperties max)
  urgencyColor: string;       // ring/cluster 색상
  urgencyStroke: string;      // polygon 외곽 stroke 색상
  urgencyWidth: number;       // 2–5px
  urgencyOpacity: number;     // 0–1
  urgencyTextColor: string;   // D-Day 텍스트 색상
  // D-Day
  dDayLabel: string;          // '기한초과', 'D-3', '' (여유)
  // 기타
  priority: number;           // Assignment.priority
}

/** PNU → 상태 + 메타 (StatusPopup 전달용) */
export interface ParcelStatusEntry {
  pnu: string;
  assignmentId: number;
  status: SurveyStatus;
  address: string;
  surveyedAt: string | null;
  riskGrade: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: string;
  urgencyLevel: UrgencyLevel;
  dDayLabel: string;
  rejectCount?: number;
  validationWarnings?: string | null;
}
