// 조사 폼 7단계 위저드 상태 관리
import { create } from 'zustand';

export interface SurveyFormData {
  // Step 1: 필지 정보 (읽기전용)
  assignmentId: number | null;
  address: string;
  riskGrade: string;

  // Step 2: 실경작
  cultivationYn: boolean | null;
  cropType: string | null;
  cropCondition: string | null;
  cultivatorType: string | null;
  leaseYn: boolean | null;
  lesseeInfo: string;

  // Step 3: 휴경
  fallowYn: boolean | null;
  fallowPeriod: string | null;
  fallowReason: string | null;
  neglectLevel: string | null;

  // Step 4: 시설물
  facilityYn: boolean | null;
  facilityType: string | null;
  facilityDetail: string | null;
  facilityPermitted: string | null;
  facilityArea: string;
  facilityRatio: string;

  // Step 5: 불법 전용
  conversionYn: boolean | null;
  conversionUse: string | null;
  conversionScale: string | null;
  conversionPermitted: string | null;

  // Step 6: 종합 판단
  surveyorOpinion: string | null;
  ownerContact: string | null;
  memo: string;

  // Step 7: 사진
  photos: PhotoEntry[];
}

export interface PhotoEntry {
  uri: string;
  photoType: 'OVERVIEW' | 'CLOSEUP' | 'FACILITY' | 'VIOLATION' | 'ETC';
}

interface SurveyFormState extends SurveyFormData {
  currentStep: number;
  resultStatus: 'DRAFT' | 'SUBMITTED';

  setField: <K extends keyof SurveyFormData>(key: K, value: SurveyFormData[K]) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  initForm: (assignmentId: number, address: string, riskGrade: string) => void;
  reset: () => void;
  addPhoto: (photo: PhotoEntry) => void;
  removePhoto: (index: number) => void;
}

const INITIAL: SurveyFormData = {
  assignmentId: null,
  address: '',
  riskGrade: '',
  cultivationYn: null,
  cropType: null,
  cropCondition: null,
  cultivatorType: null,
  leaseYn: null,
  lesseeInfo: '',
  fallowYn: null,
  fallowPeriod: null,
  fallowReason: null,
  neglectLevel: null,
  facilityYn: null,
  facilityType: null,
  facilityDetail: null,
  facilityPermitted: null,
  facilityArea: '',
  facilityRatio: '',
  conversionYn: null,
  conversionUse: null,
  conversionScale: null,
  conversionPermitted: null,
  surveyorOpinion: null,
  ownerContact: null,
  memo: '',
  photos: [],
};

const TOTAL_STEPS = 7;

export const useSurveyFormStore = create<SurveyFormState>((set) => ({
  ...INITIAL,
  currentStep: 1,
  resultStatus: 'DRAFT',

  setField: (key, value) => set({ [key]: value } as any),
  setStep: (step) => set({ currentStep: Math.max(1, Math.min(TOTAL_STEPS, step)) }),
  nextStep: () => set((s) => ({ currentStep: Math.min(TOTAL_STEPS, s.currentStep + 1) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(1, s.currentStep - 1) })),

  initForm: (assignmentId, address, riskGrade) =>
    set({ ...INITIAL, currentStep: 1, resultStatus: 'DRAFT', assignmentId, address, riskGrade }),

  reset: () => set({ ...INITIAL, currentStep: 1, resultStatus: 'DRAFT' }),

  addPhoto: (photo) => set((s) => ({ photos: [...s.photos, photo] })),
  removePhoto: (index) => set((s) => ({ photos: s.photos.filter((_, i) => i !== index) })),
}));

export default useSurveyFormStore;
