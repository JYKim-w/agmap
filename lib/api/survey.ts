// 현장조사 API
import { API } from '@/lib/config';
import { api } from './client';
import type { Assignment, SurveyResultInput } from './types';

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

/** 조사 결과 제출 (신규) */
export async function submitResult(data: SurveyResultInput) {
  return api.post<number>(API.RESULT, data);
}

/** 조사 결과 수정 (DRAFT) */
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
