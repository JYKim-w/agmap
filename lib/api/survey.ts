// 현장조사 API
import { API } from '@/lib/config';
import { api } from './client';
import type { Assignment, Notice, NoticePageResponse, SurveyResultInput } from './types';

export async function getMyAssignments(date?: string, status?: string) {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (status) params.set('status', status);
  const query = params.toString();
  const path = query ? `${API.MY_ASSIGNMENTS}?${query}` : API.MY_ASSIGNMENTS;
  return api.get<Assignment[]>(path);
}

export async function getRejected() {
  return api.get<Assignment[]>(API.REJECTED);
}

/** 할당 상세 조회 (기존 DRAFT 결과 포함) */
export async function getAssignmentDetail(assignId: number) {
  return api.get<any>(`${API.ASSIGNMENT}/${assignId}`);
}

/** 필지 GeoJSON 조회 — EPSG:4326 GeoJSON 문자열 또는 null */
export async function getAssignmentGeom(assignId: number) {
  return api.get<string | null>(`${API.ASSIGNMENT}/${assignId}/geom`);
}

/** 임시저장 신규 생성 — POST /result/draft (M13 v1.3) */
export async function saveDraft(data: SurveyResultInput) {
  return api.post<number>(API.RESULT_DRAFT, data);
}

/** DRAFT → SUBMITTED 전환 — POST /result/{id}/submit (M14 v1.3) */
export async function submitDraft(resultId: number) {
  return api.post<void>(`${API.RESULT}/${resultId}/submit`);
}

/** 조사 결과 즉시 제출 (신규, SUBMITTED) */
export async function submitResult(data: SurveyResultInput) {
  return api.post<number>(API.RESULT, data);
}

/** 조사 결과 수정 (DRAFT 또는 SUBMITTED, v1.3~) */
export async function updateResult(resultId: number, data: SurveyResultInput) {
  return api.put<void>(`${API.RESULT}/${resultId}`, data);
}

/** 사진 업로드 (multipart) */
export async function uploadPhoto(resultId: number, photoType: string, uri: string) {
  const formData = new FormData();
  formData.append('resultId', String(resultId));
  formData.append('photoType', photoType);
  formData.append('file', {
    uri,
    name: `${photoType}_${Date.now()}.jpg`,
    type: 'image/jpeg',
  } as any);
  return api.upload<any>(API.PHOTO_UPLOAD, formData);
}

/** 재제출 */
export async function resubmitResult(resultId: number, data: SurveyResultInput) {
  return api.post<void>(`${API.RESULT}/${resultId}/resubmit`, data);
}

export interface CodeItem {
  codeId?: number;
  codeGroup?: string;
  codeValue: string;
  codeLabel: string;
  sortOrder: number;
  useYn?: boolean;
}

/** 마스터코드 조회 */
export async function getCodes(codeGroup: string) {
  return api.get<CodeItem[]>(`${API.CODES}?codeGroup=${codeGroup}`);
}

export interface MyStats {
  total_assigned: number;
  completed: number;
  rejected: number;
  pending: number;
}

/** 내 실적 집계 */
export async function getMyStats(period: 'daily' | 'weekly' | 'monthly' = 'weekly') {
  return api.get<MyStats>(`${API.MY_STATS}?period=${period}`);
}

/** 공지 목록 조회 (페이지네이션) */
export async function getNotices(page = 0, size = 20) {
  return api.get<NoticePageResponse>(`${API.NOTICES}?page=${page}&size=${size}`);
}

/** 공지 상세 조회 — id가 유효한 숫자인지 반드시 확인 후 호출할 것 (Spring 500 방지) */
export async function getNoticeDetail(id: number) {
  return api.get<Notice>(`${API.NOTICE_DETAIL}/${id}`);
}

/** FCM 디바이스 토큰 등록 */
export async function registerDeviceToken(deviceToken: string) {
  return api.put<null>(API.DEVICE_TOKEN, { deviceToken });
}
