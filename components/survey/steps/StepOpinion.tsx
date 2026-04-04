// Step 6: 종합 판단
import FormSection from '@/components/FormSection';
import FormSelect from '@/components/FormSelect';
import FormTextInput from '@/components/FormTextInput';
import useSurveyFormStore from '@/lib/store/surveyForm';
import { OWNER_CONTACT, SURVEYOR_OPINION } from '@/lib/survey/codes';

export default function StepOpinion() {
  const surveyorOpinion = useSurveyFormStore((s) => s.surveyorOpinion);
  const ownerContact = useSurveyFormStore((s) => s.ownerContact);
  const memo = useSurveyFormStore((s) => s.memo);
  const setField = useSurveyFormStore((s) => s.setField);

  return (
    <FormSection title="6단계: 종합 판단">
      <FormSelect label="조사 의견" items={SURVEYOR_OPINION} value={surveyorOpinion} onChange={(v) => setField('surveyorOpinion', v)} required />
      <FormSelect label="소유자 연락" items={OWNER_CONTACT} value={ownerContact} onChange={(v) => setField('ownerContact', v)} columns={3} />
      <FormTextInput label="특이사항 메모" value={memo} onChange={(v) => setField('memo', v)} multiline placeholder="현장에서 확인한 특이사항" />
    </FormSection>
  );
}
