// Step 5: 불법 전용 확인
import FormSection, { ConditionalDivider } from '@/components/FormSection';
import FormSelect from '@/components/FormSelect';
import FormYesNo from '@/components/FormYesNo';
import useSurveyFormStore from '@/lib/store/surveyForm';
import { CONVERSION_SCALE, CONVERSION_USE, PERMIT_STATUS } from '@/lib/survey/codes';

export default function StepConversion() {
  const conversionYn = useSurveyFormStore((s) => s.conversionYn);
  const conversionUse = useSurveyFormStore((s) => s.conversionUse);
  const conversionScale = useSurveyFormStore((s) => s.conversionScale);
  const conversionPermitted = useSurveyFormStore((s) => s.conversionPermitted);
  const setField = useSurveyFormStore((s) => s.setField);

  return (
    <FormSection title="5단계: 불법 전용 확인">
      <FormYesNo label="불법 전용 여부" value={conversionYn} onChange={(v) => setField('conversionYn', v)} />

      {conversionYn === true && (
        <>
          <ConditionalDivider label="전용 상세" />
          <FormSelect label="전용 용도" items={CONVERSION_USE} value={conversionUse} onChange={(v) => setField('conversionUse', v)} />
          <FormSelect label="전용 규모" items={CONVERSION_SCALE} value={conversionScale} onChange={(v) => setField('conversionScale', v)} columns={3} />
          <FormSelect label="허가 여부" items={PERMIT_STATUS} value={conversionPermitted} onChange={(v) => setField('conversionPermitted', v)} columns={3} />
        </>
      )}
    </FormSection>
  );
}
