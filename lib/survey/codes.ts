// 마스터코드 하드코딩 (C-1: /admin/ 경로라 SURVEYOR 접근 불가)
// 추후 GET /mobile/api/survey/codes API 구현되면 교체

type CodeItem = { value: string; label: string };

export const CROP_TYPE: CodeItem[] = [
  { value: 'RICE', label: '벼' },
  { value: 'FIELD', label: '밭작물' },
  { value: 'FRUIT', label: '과수' },
  { value: 'VEGETABLE', label: '채소' },
  { value: 'FLOWER', label: '화훼' },
  { value: 'SPECIAL', label: '특용작물' },
  { value: 'ETC', label: '기타' },
];

export const CROP_CONDITION: CodeItem[] = [
  { value: 'GOOD', label: '양호' },
  { value: 'NORMAL', label: '보통' },
  { value: 'BAD', label: '불량' },
];

export const CULTIVATOR_TYPE: CodeItem[] = [
  { value: 'OWNER', label: '소유자 본인' },
  { value: 'ENTRUST', label: '위탁' },
  { value: 'LEASE', label: '임대차' },
  { value: 'UNKNOWN', label: '확인불가' },
];

export const FALLOW_PERIOD: CodeItem[] = [
  { value: 'UNDER_1Y', label: '1년 미만' },
  { value: '1_3Y', label: '1~3년' },
  { value: '3_5Y', label: '3~5년' },
  { value: 'OVER_5Y', label: '5년 이상' },
];

export const FALLOW_REASON: CodeItem[] = [
  { value: 'LABOR', label: '노동력 부족' },
  { value: 'PROFIT', label: '수익성 낮음' },
  { value: 'WATER', label: '용수 부족' },
  { value: 'SOIL', label: '토양 불량' },
  { value: 'ETC', label: '기타' },
];

export const NEGLECT_LEVEL: CodeItem[] = [
  { value: 'LIGHT', label: '경미' },
  { value: 'MODERATE', label: '보통' },
  { value: 'SEVERE', label: '심각' },
  { value: 'COMPLETE', label: '완전 방치' },
];

export const FACILITY_TYPE: CodeItem[] = [
  { value: 'GREENHOUSE', label: '비닐하우스' },
  { value: 'FIXED_GREENHOUSE', label: '고정식온실' },
  { value: 'MUSHROOM', label: '버섯재배사' },
  { value: 'FARM_HUT', label: '농막' },
  { value: 'LIVESTOCK', label: '축사' },
  { value: 'WAREHOUSE', label: '창고' },
  { value: 'ETC', label: '기타' },
];

export const FACILITY_DETAIL: CodeItem[] = [
  { value: 'CULTIVATION', label: '재배용' },
  { value: 'STORAGE', label: '저장용' },
  { value: 'PROCESSING', label: '가공용' },
  { value: 'RESIDENTIAL', label: '거주용' },
  { value: 'ETC', label: '기타' },
];

export const PERMIT_STATUS: CodeItem[] = [
  { value: 'PERMITTED', label: '허가' },
  { value: 'NOT_PERMITTED', label: '미허가' },
  { value: 'UNKNOWN', label: '확인불가' },
];

export const CONVERSION_USE: CodeItem[] = [
  { value: 'BUILDING', label: '건축물' },
  { value: 'PARKING', label: '주차장' },
  { value: 'ROAD', label: '도로' },
  { value: 'YARD', label: '야적장' },
  { value: 'ETC', label: '기타' },
];

export const CONVERSION_SCALE: CodeItem[] = [
  { value: 'PARTIAL', label: '일부' },
  { value: 'MOST', label: '대부분' },
  { value: 'ALL', label: '전체' },
];

export const SURVEYOR_OPINION: CodeItem[] = [
  { value: 'NORMAL', label: '정상' },
  { value: 'FALLOW', label: '휴경' },
  { value: 'FACILITY', label: '시설물' },
  { value: 'VIOLATION', label: '불법전용' },
  { value: 'ETC', label: '기타' },
];

export const OWNER_CONTACT: CodeItem[] = [
  { value: 'CONTACTED', label: '연락됨' },
  { value: 'NOT_CONTACTED', label: '연락안됨' },
  { value: 'NOT_NEEDED', label: '불필요' },
];
