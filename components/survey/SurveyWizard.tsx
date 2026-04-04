// Design Ref: mockup/screens/survey-step*.html
// 조사 위저드 — 7단계 폼
import useSurveyFormStore from '@/lib/store/surveyForm';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAssignmentStore from '@/lib/store/assignments';
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
  const assignments = useAssignmentStore((s) => s.assignments);

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
          <Pressable style={s.prevBtn} onPress={prevStep}>
            <Text style={s.prevBtnText}>이전</Text>
          </Pressable>
        )}
        <Pressable
          style={[s.nextBtn, currentStep === 1 && { flex: 1 }]}
          onPress={currentStep < TOTAL_STEPS ? nextStep : undefined}
        >
          <Text style={s.nextBtnText}>
            {currentStep < TOTAL_STEPS ? '다음' : '제출'}
          </Text>
        </Pressable>
      </View>
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
});
