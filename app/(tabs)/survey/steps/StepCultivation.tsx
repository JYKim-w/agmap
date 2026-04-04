// Step 2: 실경작 확인
import FormSection, { ConditionalDivider } from '@/components/FormSection';
import FormSelect from '@/components/FormSelect';
import FormYesNo from '@/components/FormYesNo';
import FormTextInput from '@/components/FormTextInput';
import useSurveyFormStore from '@/lib/store/surveyForm';
import { CROP_CONDITION, CROP_TYPE, CULTIVATOR_TYPE } from '@/lib/survey/codes';

export default function StepCultivation() {
  const cultivationYn = useSurveyFormStore((s) => s.cultivationYn);
  const cropType = useSurveyFormStore((s) => s.cropType);
  const cropCondition = useSurveyFormStore((s) => s.cropCondition);
  const cultivatorType = useSurveyFormStore((s) => s.cultivatorType);
  const leaseYn = useSurveyFormStore((s) => s.leaseYn);
  const lesseeInfo = useSurveyFormStore((s) => s.lesseeInfo);
  const setField = useSurveyFormStore((s) => s.setField);

  return (
    <FormSection title="2단계: 실경작 확인">
      <FormYesNo label="경작 여부" value={cultivationYn} onChange={(v) => setField('cultivationYn', v)} required />

      {cultivationYn === true && (
        <>
          <ConditionalDivider label="경작 시 추가 입력" />
          <FormSelect label="작물 종류" items={CROP_TYPE} value={cropType} onChange={(v) => setField('cropType', v)} />
          <FormSelect label="작물 상태" items={CROP_CONDITION} value={cropCondition} onChange={(v) => setField('cropCondition', v)} columns={3} />
          <FormSelect label="경작자" items={CULTIVATOR_TYPE} value={cultivatorType} onChange={(v) => setField('cultivatorType', v)} />

          {cultivatorType === 'LEASE' && (
            <>
              <FormYesNo label="임대차 여부" value={leaseYn} onChange={(v) => setField('leaseYn', v)} />
              {leaseYn === true && (
                <FormTextInput label="임차인 정보" value={lesseeInfo} onChange={(v) => setField('lesseeInfo', v)} placeholder="임차인 이름/연락처" />
              )}
            </>
          )}
        </>
      )}
    </FormSection>
  );
}
