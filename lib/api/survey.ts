// 현장조사 API
import { API } from '@/lib/config';
import { api } from './client';
import type { Assignment } from './types';

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
