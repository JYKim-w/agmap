// API 요청/응답 공통 타입

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  userId: number;
  loginId: string;
  userName: string;
  role: 'SURVEYOR' | 'MANAGER' | 'ADMIN';
  companyName: string;
  regionCode: string | null;
}

export interface AuthUser {
  userId: number;
  loginId: string;
  userName: string;
  role: 'SURVEYOR' | 'MANAGER' | 'ADMIN';
  companyName: string;
  regionCode: string | null;
}

// 할당 + 조사결과 (my-assignments, rejected 공통)
export interface Assignment {
  resultId: number | null;
  assignmentId: number;
  pnu: string;
  address: string;
  riskGrade: string;
  assignStatus: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'RETURNED' | string;
  resultStatus: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | null;
  priority: number;
  dueDate: string;
  lon: number | null;
  lat: number | null;
  surveyorName: string;
  surveyedAt: string | null;
  // 반려 목록 전용
  rejectCode?: string | null;
  rejectComment?: string | null;
  rejectCount?: number;
  validationWarnings?: string | null;
  updatedAt?: string;
  // 레거시 (서버 미반환, UI 호환용)
  surveyorOpinion?: string | null;
  cropType?: string | null;
  cropCondition?: string | null;
  reviewComment?: string | null;
}

// 공지사항 (v1.4)
export interface Notice {
  id: number;
  title: string;
  content: string;
  noticeType: 'GENERAL' | 'URGENT' | 'GUIDE';
  scope: 'GLOBAL' | 'MANAGER';
  pinned: boolean;
  authorId: number;
  authorName: string;
  ownerManagerId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoticePageResponse {
  list: Notice[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
}

// 조사 결과 제출 입력
export interface SurveyResultInput {
  assignmentId: number | null;
  cultivationYn: boolean;
  cropType: string | null;
  cropCondition: string | null;
  cultivatorType: string | null;
  leaseYn: boolean;
  lesseeInfo: string | null;
  fallowYn: boolean;
  fallowPeriod: string | null;
  fallowReason: string | null;
  neglectLevel: string | null;
  facilityYn: boolean;
  facilityType: string | null;
  facilityDetail: string | null;
  facilityPermitted: string | null;
  facilityArea: number | null;
  facilityRatio: number | null;
  conversionYn: boolean;
  conversionUse: string | null;
  conversionScale: string | null;
  conversionPermitted: string | null;
  surveyorOpinion: string | null;
  ownerContact: string | null;
  memo: string | null;
  surveyLocation: string;
  surveyLat: number | null;
  surveyLng: number | null;
  surveyedAt: string;
}
