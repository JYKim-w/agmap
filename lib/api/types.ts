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
}

export interface AuthUser {
  userId: number;
  loginId: string;
  userName: string;
  role: 'SURVEYOR' | 'MANAGER' | 'ADMIN';
  companyName: string;
}

// 할당 + 조사결과 (my-assignments, rejected 공통)
export interface Assignment {
  resultId: number | null;
  assignmentId: number;
  pnu: string;
  address: string;
  riskGrade: 'HIGH' | 'MEDIUM' | 'LOW';
  resultStatus: string | null;
  surveyedAt: string | number[] | null;
  surveyorOpinion: string | null;
  cropType: string | null;
  cropCondition: string | null;
  reviewComment?: string;
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
  facilityArea: number;
  facilityRatio: number;
  conversionYn: boolean;
  conversionUse: string | null;
  conversionScale: string | null;
  conversionPermitted: string | null;
  surveyorOpinion: string | null;
  ownerContact: string | null;
  memo: string | null;
  surveyLat: number | null;
  surveyLng: number | null;
  surveyedAt: string;
  validationWarnings: string | null;
  resultStatus: 'DRAFT' | 'SUBMITTED';
}
