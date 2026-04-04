// Step 3: 휴경 확인
import FormSection, { ConditionalDivider } from '@/components/FormSection';
import FormSelect from '@/components/FormSelect';
import FormYesNo from '@/components/FormYesNo';
import useSurveyFormStore from '@/lib/store/surveyForm';
import { FALLOW_PERIOD, FALLOW_REASON, NEGLECT_LEVEL } from '@/lib/survey/codes';

export default function StepFallow() {
  const fallowYn = useSurveyFormStore((s) => s.fallowYn);
  const fallowPeriod = useSurveyFormStore((s) => s.fallowPeriod);
  const fallowReason = useSurveyFormStore((s) => s.fallowReason);
  const neglectLevel = useSurveyFormStore((s) => s.neglectLevel);
  const setField = useSurveyFormStore((s) => s.setField);

  return (
    <FormSection title="3단계: 휴경 확인">
      <FormYesNo label="휴경 여부" value={fallowYn} onChange={(v) => setField('fallowYn', v)} required />

      {fallowYn === true && (
        <>
          <ConditionalDivider label="휴경 시 추가 입력" />
          <FormSelect label="추정 기간" items={FALLOW_PERIOD} value={fallowPeriod} onChange={(v) => setField('fallowPeriod', v)} columns={3} />
          <FormSelect label="휴경 사유" items={FALLOW_REASON} value={fallowReason} onChange={(v) => setField('fallowReason', v)} />
          <FormSelect label="방치 수준" items={NEGLECT_LEVEL} value={neglectLevel} onChange={(v) => setField('neglectLevel', v)} columns={3} />
        </>
      )}
    </FormSection>
  );
}
