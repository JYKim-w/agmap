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
