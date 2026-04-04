// 마스터코드 — 서버 DB (tb_survey_code) 기준
// 추후 GET /mobile/api/survey/codes API로 동적 로딩 전환

type CodeItem = { value: string; label: string };

export const CROP_TYPE: CodeItem[] = [
  { value: 'RICE', label: '벼' },
  { value: 'FIELD_CROP', label: '밭작물' },
  { value: 'FRUIT', label: '과수' },
  { value: 'VEGETABLE', label: '채소' },
  { value: 'FLOWER', label: '화훼' },
  { value: 'SPECIAL', label: '특용작물' },
  { value: 'ETC', label: '기타' },
];

export const CROP_CONDITION: CodeItem[] = [
  { value: 'GOOD', label: '양호' },
  { value: 'NORMAL', label: '보통' },
  { value: 'POOR', label: '불량' },
];

export const CULTIVATOR_TYPE: CodeItem[] = [
  { value: 'OWNER', label: '소유자 본인' },
  { value: 'ENTRUST', label: '위탁' },
  { value: 'LEASE', label: '임대차' },
  { value: 'UNKNOWN', label: '확인불가' },
];

export const FACILITY_TYPE: CodeItem[] = [
  { value: 'AGRICULTURE', label: '농업시설' },
  { value: 'NON_AGRICULTURE', label: '비농업시설' },
  { value: 'MIXED', label: '혼합' },
];

export const FACILITY_DETAIL: CodeItem[] = [
  { value: 'GREENHOUSE', label: '비닐하우스' },
  { value: 'WAREHOUSE', label: '창고' },
  { value: 'HOUSE', label: '주택' },
  { value: 'FACTORY', label: '공장' },
  { value: 'SOLAR', label: '태양광' },
  { value: 'ETC', label: '기타' },
];

export const FALLOW_PERIOD: CodeItem[] = [
  { value: 'UNDER_1Y', label: '1년 미만' },
  { value: '1_TO_3Y', label: '1~3년' },
  { value: 'OVER_3Y', label: '3년 이상' },
];

export const FALLOW_REASON: CodeItem[] = [
  { value: 'ELDERLY', label: '고령' },
  { value: 'ABSENT', label: '부재' },
  { value: 'ECONOMIC', label: '경제적 사유' },
  { value: 'ETC', label: '기타' },
];

export const NEGLECT_LEVEL: CodeItem[] = [
  { value: 'MILD', label: '경미' },
  { value: 'SEVERE', label: '심각' },
  { value: 'TOTAL', label: '완전 방치' },
];

export const CONVERSION_USE: CodeItem[] = [
  { value: 'RESIDENTIAL', label: '주거' },
  { value: 'COMMERCIAL', label: '상업' },
  { value: 'INDUSTRIAL', label: '공업' },
  { value: 'PARKING', label: '주차장' },
  { value: 'STORAGE_YARD', label: '야적장' },
  { value: 'ETC', label: '기타' },
];

export const CONVERSION_SCALE: CodeItem[] = [
  { value: 'PARTIAL', label: '부분' },
  { value: 'FULL', label: '전체' },
];

export const PERMIT_STATUS: CodeItem[] = [
  { value: 'PERMITTED', label: '허가' },
  { value: 'UNPERMITTED', label: '무허가' },
  { value: 'UNKNOWN', label: '확인불가' },
];

export const OWNER_CONTACT: CodeItem[] = [
  { value: 'CONTACTED', label: '접촉함' },
  { value: 'ABSENT', label: '부재' },
  { value: 'REFUSED', label: '거부' },
];

export const SURVEYOR_OPINION: CodeItem[] = [
  { value: 'NORMAL', label: '정상' },
  { value: 'MINOR_VIOLATION', label: '경미 위반(계도)' },
  { value: 'VIOLATION', label: '위반(처분 필요)' },
];
