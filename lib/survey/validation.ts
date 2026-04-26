// 조사 폼 검증 로직
// Design Ref: known-gaps.md M-3, M-4, D-4, D-5
import type { SurveyFormData } from '@/lib/store/surveyForm';

export interface ValidationWarning {
  type: 'required' | 'photo' | 'gps' | 'time' | 'logic';
  message: string;
  /** true면 제출 차단, false면 경고만 (무시 가능) */
  blocking: boolean;
}

/** 필수항목 검증 */
function validateRequired(form: SurveyFormData): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (form.cultivationYn === null) {
    warnings.push({ type: 'required', message: '경작 여부를 선택해주세요', blocking: true });
  }
  if (form.fallowYn === null) {
    warnings.push({ type: 'required', message: '휴경 여부를 선택해주세요', blocking: true });
  }
  if (form.facilityYn === null) {
    warnings.push({ type: 'required', message: '시설물 여부를 선택해주세요', blocking: true });
  }
  if (!form.surveyorOpinion) {
    warnings.push({ type: 'required', message: '조사 의견을 선택해주세요', blocking: true });
  }

  return warnings;
}

/** 사진 검증 — OVERVIEW + CLOSEUP 최소 2장 */
function validatePhotos(form: SurveyFormData): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const hasOverview = form.photos.some((p) => p.photoType === 'PANORAMA');
  const hasCloseup = form.photos.some((p) => p.photoType === 'CLOSEUP');

  if (!hasOverview) {
    warnings.push({ type: 'photo', message: '전경 사진이 필요합니다', blocking: true });
  }
  if (!hasCloseup) {
    warnings.push({ type: 'photo', message: '근접 사진이 필요합니다', blocking: true });
  }

  // 조건부 필수 사진
  if (form.facilityYn === true && !form.photos.some((p) => p.photoType === 'FACILITY')) {
    warnings.push({ type: 'photo', message: '시설물 사진이 필요합니다', blocking: false });
  }
  if (form.surveyorOpinion === 'VIOLATION' && !form.photos.some((p) => p.photoType === 'SIGNBOARD')) {
    warnings.push({ type: 'photo', message: '위반 증거 사진이 필요합니다', blocking: false });
  }

  return warnings;
}

/** GPS 거리 검증 — 필지에서 500m 이상이면 경고 */
export function validateGpsDistance(
  userLat: number | null,
  userLng: number | null,
  parcelLat?: number,
  parcelLng?: number,
): ValidationWarning | null {
  if (!userLat || !userLng || !parcelLat || !parcelLng) return null;

  const R = 6371000; // 지구 반경 (m)
  const dLat = ((parcelLat - userLat) * Math.PI) / 180;
  const dLng = ((parcelLng - userLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((userLat * Math.PI) / 180) * Math.cos((parcelLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  if (distance > 500) {
    return {
      type: 'gps',
      message: `필지에서 ${Math.round(distance)}m 떨어져 있습니다`,
      blocking: false,
    };
  }
  return null;
}

/** 소요시간 검증 — 30초 미만이면 경고 */
export function validateDuration(startTime: number | null): ValidationWarning | null {
  if (!startTime) return null;
  const elapsed = (Date.now() - startTime) / 1000;
  if (elapsed < 30) {
    return {
      type: 'time',
      message: `조사 시작부터 ${Math.round(elapsed)}초 경과`,
      blocking: false,
    };
  }
  return null;
}

/** 논리 모순 검증 */
function validateLogic(form: SurveyFormData): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // 경작중인데 완전 방치
  if (form.cultivationYn === true && form.neglectLevel === 'TOTAL') {
    warnings.push({ type: 'logic', message: '경작중이면서 완전 방치는 모순입니다', blocking: false });
  }

  // 경작 아니오인데 작물 정보 있음
  if (form.cultivationYn === false && form.cropType) {
    warnings.push({ type: 'logic', message: '비경작이면서 작물 정보가 입력되어 있습니다', blocking: false });
  }

  // 종합의견이 정상인데 불법전용 있음
  if (form.surveyorOpinion === 'NORMAL' && form.conversionYn === true) {
    warnings.push({ type: 'logic', message: '정상 의견인데 불법 전용이 있습니다', blocking: false });
  }

  return warnings;
}

/** 전체 검증 실행 */
export function validateSurveyForm(
  form: SurveyFormData,
  opts?: {
    userLat?: number | null;
    userLng?: number | null;
    parcelLat?: number;
    parcelLng?: number;
    startTime?: number | null;
  },
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [
    ...validateRequired(form),
    ...validatePhotos(form),
    ...validateLogic(form),
  ];

  if (opts) {
    const gps = validateGpsDistance(opts.userLat ?? null, opts.userLng ?? null, opts.parcelLat, opts.parcelLng);
    if (gps) warnings.push(gps);

    const time = validateDuration(opts.startTime ?? null);
    if (time) warnings.push(time);
  }

  return warnings;
}

export function hasBlockingWarnings(warnings: ValidationWarning[]): boolean {
  return warnings.some((w) => w.blocking);
}
