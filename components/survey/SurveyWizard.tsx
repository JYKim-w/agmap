// Design Ref: mockup/screens/survey-step*.html
// 조사 위저드 — 7단계 폼
import useSurveyFormStore from '@/lib/store/surveyForm';
import { submitResult, uploadPhoto } from '@/lib/api/survey';
import useAssignmentStore from '@/lib/store/assignments';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import ValidationModal from '@/components/ValidationModal';
import { validateSurveyForm, hasBlockingWarnings, type ValidationWarning } from '@/lib/survey/validation';
import StepInfo from './steps/StepInfo';
import StepCultivation from './steps/StepCultivation';
import StepFallow from './steps/StepFallow';
import StepFacility from './steps/StepFacility';
import StepConversion from './steps/StepConversion';
import StepOpinion from './steps/StepOpinion';
import StepPhotos from './steps/StepPhotos';

const STEP_TITLES = ['필지 정보', '실경작 확인', '휴경 확인', '시설물 확인', '불법 전용', '종합 판단', '증빙 사진'];
const TOTAL_STEPS = 7;

export default function SurveyWizard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const currentStep = useSurveyFormStore((s) => s.currentStep);
  const initForm = useSurveyFormStore((s) => s.initForm);
  const nextStep = useSurveyFormStore((s) => s.nextStep);
  const prevStep = useSurveyFormStore((s) => s.prevStep);
  const formState = useSurveyFormStore();
  const assignments = useAssignmentStore((s) => s.assignments);
  const fetchMyAssignments = useAssignmentStore((s) => s.fetchMyAssignments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [formStartTime] = useState(Date.now());

  const handleTrySubmit = () => {
    const w = validateSurveyForm(formState, { startTime: formStartTime });
    if (w.length === 0) {
      handleSubmit('SUBMITTED');
      return;
    }
    setWarnings(w);
    if (hasBlockingWarnings(w)) {
      Toast.show({ type: 'error', text1: '필수 항목 누락', text2: w.filter((x) => x.blocking).map((x) => x.message).join(', ') });
      return;
    }
    setShowValidation(true);
  };

  const handleSubmit = async (status: 'DRAFT' | 'SUBMITTED') => {
    setShowValidation(false);
    setIsSubmitting(true);
    try {
      const body = {
        assignmentId: formState.assignmentId,
        cultivationYn: formState.cultivationYn,
        cropType: formState.cropType,
        cropCondition: formState.cropCondition,
        cultivatorType: formState.cultivatorType,
        leaseYn: formState.leaseYn,
        lesseeInfo: formState.lesseeInfo || null,
        fallowYn: formState.fallowYn,
        fallowPeriod: formState.fallowPeriod,
        fallowReason: formState.fallowReason,
        neglectLevel: formState.neglectLevel,
        facilityYn: formState.facilityYn,
        facilityType: formState.facilityType,
        facilityDetail: formState.facilityDetail,
        facilityPermitted: formState.facilityPermitted,
        facilityArea: formState.facilityArea ? Number(formState.facilityArea) : null,
        facilityRatio: formState.facilityRatio ? Number(formState.facilityRatio) : null,
        conversionYn: formState.conversionYn,
        conversionUse: formState.conversionUse,
        conversionScale: formState.conversionScale,
        conversionPermitted: formState.conversionPermitted,
        surveyorOpinion: formState.surveyorOpinion,
        ownerContact: formState.ownerContact,
        memo: formState.memo || null,
        resultStatus: status,
      };

      const res = await submitResult(body);
      if (!res.success) {
        Toast.show({ type: 'error', text1: '제출 실패', text2: res.message });
        return;
      }

      const resultId = res.data;

      // 사진 업로드
      for (const photo of formState.photos) {
        try {
          await uploadPhoto(resultId, photo.photoType, photo.uri);
        } catch (e) {
          console.warn('Photo upload failed:', photo.photoType, e);
        }
      }

      Toast.show({
        type: 'success',
        text1: status === 'SUBMITTED' ? '제출 완료' : '임시저장 완료',
      });

      fetchMyAssignments();
      formState.reset();
      router.back();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: '서버 연결 실패', text2: e?.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const assignmentId = Number(id);
    const assignment = assignments.find((a) => a.assignmentId === assignmentId);
    if (assignment) {
      initForm(assignmentId, assignment.address, assignment.riskGrade);
    }
  }, [id]);

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepInfo />;
      case 2: return <StepCultivation />;
      case 3: return <StepFallow />;
      case 4: return <StepFacility />;
      case 5: return <StepConversion />;
      case 6: return <StepOpinion />;
      case 7: return <StepPhotos />;
      default: return null;
    }
  };

  /** Step별 필수값 검증 — 통과 시 true */
  const validateCurrentStep = (): boolean => {
    const warn = (msg: string) => {
      Toast.show({ type: 'error', text1: msg });
      return false;
    };
    switch (currentStep) {
      case 1: return true;
      case 2:
        if (formState.cultivationYn === null) return warn('경작 여부를 선택해주세요');
        return true;
      case 3:
        if (formState.fallowYn === null) return warn('휴경 여부를 선택해주세요');
        return true;
      case 4:
        if (formState.facilityYn === null) return warn('시설물 유무를 선택해주세요');
        return true;
      case 5: return true;
      case 6:
        if (!formState.surveyorOpinion) return warn('조사원 의견을 선택해주세요');
        return true;
      case 7: return true;
      default: return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep();
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* 헤더 */}
      <View style={s.header}>
        <Pressable onPress={() => currentStep === 1 ? router.back() : prevStep()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#212529" />
        </Pressable>
        <Text style={s.headerTitle}>{currentStep}/{TOTAL_STEPS} {STEP_TITLES[currentStep - 1]}</Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={24} color="#868e96" />
        </Pressable>
      </View>

      {/* 진행률 바 */}
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: `${(currentStep / TOTAL_STEPS) * 100}%` }]} />
      </View>

      {/* 폼 콘텐츠 */}
      <ScrollView style={s.content} contentContainerStyle={s.contentInner} keyboardShouldPersistTaps="handled">
        {renderStep()}
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={s.footer}>
        {currentStep > 1 && (
          <Pressable style={s.prevBtn} onPress={prevStep} disabled={isSubmitting}>
            <Text style={s.prevBtnText}>이전</Text>
          </Pressable>
        )}
        {currentStep < TOTAL_STEPS ? (
          <Pressable style={[s.nextBtn, currentStep === 1 && { flex: 1 }]} onPress={handleNext}>
            <Text style={s.nextBtnText}>다음</Text>
          </Pressable>
        ) : (
          <>
            <Pressable style={s.draftBtn} onPress={() => handleSubmit('DRAFT')} disabled={isSubmitting}>
              <Text style={s.draftBtnText}>임시저장</Text>
            </Pressable>
            <Pressable style={s.nextBtn} onPress={handleTrySubmit} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={s.nextBtnText}>제출</Text>}
            </Pressable>
          </>
        )}
      </View>
      <ValidationModal
        visible={showValidation}
        warnings={warnings}
        onCancel={() => setShowValidation(false)}
        onSubmit={() => handleSubmit('SUBMITTED')}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#212529' },
  progressBar: { height: 4, backgroundColor: '#e9ecef', marginHorizontal: 16, borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: '#228be6', borderRadius: 2 },
  content: { flex: 1 },
  contentInner: { padding: 16, paddingBottom: 32 },
  footer: { flexDirection: 'row', gap: 8, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e9ecef' },
  prevBtn: { flex: 1, height: 52, borderRadius: 10, borderWidth: 1.5, borderColor: '#dee2e6', alignItems: 'center', justifyContent: 'center' },
  prevBtnText: { fontSize: 16, fontWeight: '600', color: '#495057' },
  nextBtn: { flex: 2, height: 52, borderRadius: 10, backgroundColor: '#228be6', alignItems: 'center', justifyContent: 'center' },
  nextBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  draftBtn: { flex: 1, height: 52, borderRadius: 10, borderWidth: 1.5, borderColor: '#dee2e6', alignItems: 'center', justifyContent: 'center' },
  draftBtnText: { fontSize: 16, fontWeight: '600', color: '#495057' },
});
