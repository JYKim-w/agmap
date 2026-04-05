// 조사 폼 위저드 상태 관리 + 자동 임시저장
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const DRAFT_KEY_PREFIX = 'survey_draft_';

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

  // 메타 (자동 기록)
  surveyLat: number | null;
  surveyLng: number | null;
  startedAt: number | null; // Date.now() 타임스탬프
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
  /** 로컬 임시저장 */
  saveDraft: () => Promise<void>;
  /** 로컬 임시저장 복원 — 있으면 true */
  loadDraft: (assignmentId: number) => Promise<boolean>;
  /** 로컬 임시저장 삭제 */
  clearDraft: (assignmentId: number) => Promise<void>;
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
  surveyLat: null,
  surveyLng: null,
  startedAt: null,
};

const TOTAL_STEPS = 8; // 7단계 폼 + 확인 화면

export const useSurveyFormStore = create<SurveyFormState>((set) => ({
  ...INITIAL,
  currentStep: 1,
  resultStatus: 'DRAFT',

  setField: (key, value) => {
    set({ [key]: value } as any);
    // 값 변경 시 자동 저장 (debounce 없이 즉시)
    setTimeout(() => useSurveyFormStore.getState().saveDraft(), 0);
  },
  setStep: (step) => set({ currentStep: Math.max(1, Math.min(TOTAL_STEPS, step)) }),
  nextStep: () => {
    set((s) => ({ currentStep: Math.min(TOTAL_STEPS, s.currentStep + 1) }));
    setTimeout(() => useSurveyFormStore.getState().saveDraft(), 0);
  },
  prevStep: () => {
    set((s) => ({ currentStep: Math.max(1, s.currentStep - 1) }));
    setTimeout(() => useSurveyFormStore.getState().saveDraft(), 0);
  },

  initForm: (assignmentId, address, riskGrade) =>
    set({ ...INITIAL, currentStep: 1, resultStatus: 'DRAFT', assignmentId, address, riskGrade, startedAt: Date.now() }),

  reset: () => set({ ...INITIAL, currentStep: 1, resultStatus: 'DRAFT' }),

  addPhoto: (photo) => {
    set((s) => ({ photos: [...s.photos, photo] }));
    setTimeout(() => useSurveyFormStore.getState().saveDraft(), 0);
  },
  removePhoto: (index) => {
    set((s) => ({ photos: s.photos.filter((_, i) => i !== index) }));
    setTimeout(() => useSurveyFormStore.getState().saveDraft(), 0);
  },

  saveDraft: async () => {
    const s = useSurveyFormStore.getState();
    if (!s.assignmentId) return;
    const key = `${DRAFT_KEY_PREFIX}${s.assignmentId}`;
    const data: SurveyFormData & { currentStep: number } = {
      assignmentId: s.assignmentId, address: s.address, riskGrade: s.riskGrade,
      cultivationYn: s.cultivationYn, cropType: s.cropType, cropCondition: s.cropCondition,
      cultivatorType: s.cultivatorType, leaseYn: s.leaseYn, lesseeInfo: s.lesseeInfo,
      fallowYn: s.fallowYn, fallowPeriod: s.fallowPeriod, fallowReason: s.fallowReason, neglectLevel: s.neglectLevel,
      facilityYn: s.facilityYn, facilityType: s.facilityType, facilityDetail: s.facilityDetail,
      facilityPermitted: s.facilityPermitted, facilityArea: s.facilityArea, facilityRatio: s.facilityRatio,
      conversionYn: s.conversionYn, conversionUse: s.conversionUse, conversionScale: s.conversionScale, conversionPermitted: s.conversionPermitted,
      surveyorOpinion: s.surveyorOpinion, ownerContact: s.ownerContact, memo: s.memo,
      photos: s.photos, surveyLat: s.surveyLat, surveyLng: s.surveyLng, startedAt: s.startedAt,
      currentStep: s.currentStep,
    };
    await AsyncStorage.setItem(key, JSON.stringify(data));
  },

  loadDraft: async (assignmentId) => {
    try {
      const raw = await AsyncStorage.getItem(`${DRAFT_KEY_PREFIX}${assignmentId}`);
      if (!raw) return false;
      const data = JSON.parse(raw);
      set({ ...data, resultStatus: 'DRAFT' as const });
      return true;
    } catch {
      return false;
    }
  },

  clearDraft: async (assignmentId) => {
    await AsyncStorage.removeItem(`${DRAFT_KEY_PREFIX}${assignmentId}`);
  },
}));

export default useSurveyFormStore;
