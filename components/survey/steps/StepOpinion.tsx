// Step 6: 종합 판단
// Design Ref: mockup/screens/survey-step6.html — 의견은 1열 + 색상 dot
import FormSection from '@/components/FormSection';
import FormSelect from '@/components/FormSelect';
import FormTextInput from '@/components/FormTextInput';
import useSurveyFormStore from '@/lib/store/surveyForm';
import { OWNER_CONTACT } from '@/lib/survey/codes';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const OPINION_OPTIONS = [
  { value: 'NORMAL', label: '정상', color: '#40c057' },
  { value: 'MINOR_VIOLATION', label: '경미 위반 (계도)', color: '#fd7e14' },
  { value: 'VIOLATION', label: '위반 (처분 필요)', color: '#fa5252' },
];

export default function StepOpinion() {
  const surveyorOpinion = useSurveyFormStore((s) => s.surveyorOpinion);
  const ownerContact = useSurveyFormStore((s) => s.ownerContact);
  const memo = useSurveyFormStore((s) => s.memo);
  const setField = useSurveyFormStore((s) => s.setField);

  return (
    <FormSection title="6단계: 종합 판단">
      {/* 조사원 의견 — 1열 큰 버튼 + 색상 dot */}
      <View style={s.group}>
        <Text style={s.label}>조사원 의견 <Text style={s.req}>*</Text></Text>
        <View style={s.opinionList}>
          {OPINION_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[s.opinionBtn, surveyorOpinion === opt.value && s.opinionBtnSelected]}
              onPress={() => setField('surveyorOpinion', opt.value)}
            >
              <View style={[s.dot, { backgroundColor: opt.color }]} />
              <Text style={[s.opinionText, surveyorOpinion === opt.value && s.opinionTextSelected]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FormSelect label="소유자 접촉" items={OWNER_CONTACT} value={ownerContact} onChange={(v) => setField('ownerContact', v)} columns={3} />
      <FormTextInput label="특이사항 메모" value={memo} onChange={(v) => setField('memo', v)} multiline placeholder="현장에서 확인한 특이사항" />
    </FormSection>
  );
}

const s = StyleSheet.create({
  group: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#343a40', marginBottom: 8 },
  req: { color: '#fa5252' },
  opinionList: { gap: 8 },
  opinionBtn: {
    height: 56, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, borderWidth: 1.5, borderColor: '#dee2e6',
    borderRadius: 10, backgroundColor: '#fff',
  },
  opinionBtnSelected: { borderColor: '#228be6', backgroundColor: '#e7f5ff' },
  dot: { width: 12, height: 12, borderRadius: 6 },
  opinionText: { fontSize: 16, fontWeight: '600', color: '#495057' },
  opinionTextSelected: { color: '#228be6' },
});
