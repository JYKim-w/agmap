/** 전체 주소에서 읍면동 이하 마지막 토큰만 반환 */
export function shortAddr(address: string | undefined | null): string {
  if (!address) return '';
  return address.split(' ').slice(-1)[0] ?? address;
}

/** surveyedAt이 배열([2026,4,2,0,0]) 또는 문자열일 수 있음 */
export function formatSurveyedAt(val: any): string {
  if (!val) return '';
  if (Array.isArray(val)) {
    const [y, m, d, h = 0, min = 0] = val;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')} ${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }
  return String(val).replace('T', ' ').slice(0, 16);
}
