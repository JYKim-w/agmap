// Step 4: 시설물 확인
import FormSection, { ConditionalDivider } from '@/components/FormSection';
import FormSelect from '@/components/FormSelect';
import FormYesNo from '@/components/FormYesNo';
import { FormNumberInput } from '@/components/FormTextInput';
import useSurveyFormStore from '@/lib/store/surveyForm';
import { FACILITY_DETAIL, FACILITY_TYPE, PERMIT_STATUS } from '@/lib/survey/codes';

export default function StepFacility() {
  const facilityYn = useSurveyFormStore((s) => s.facilityYn);
  const facilityType = useSurveyFormStore((s) => s.facilityType);
  const facilityDetail = useSurveyFormStore((s) => s.facilityDetail);
  const facilityPermitted = useSurveyFormStore((s) => s.facilityPermitted);
  const facilityArea = useSurveyFormStore((s) => s.facilityArea);
  const facilityRatio = useSurveyFormStore((s) => s.facilityRatio);
  const setField = useSurveyFormStore((s) => s.setField);

  return (
    <FormSection title="4단계: 시설물 확인">
      <FormYesNo label="시설물 유무" value={facilityYn} onChange={(v) => setField('facilityYn', v)} required />

      {facilityYn === true && (
        <>
          <ConditionalDivider label="시설물 상세" />
          <FormSelect label="시설물 유형" items={FACILITY_TYPE} value={facilityType} onChange={(v) => setField('facilityType', v)} columns={3} />
          <FormSelect label="구체 유형" items={FACILITY_DETAIL} value={facilityDetail} onChange={(v) => setField('facilityDetail', v)} />
          <FormSelect label="허가 여부" items={PERMIT_STATUS} value={facilityPermitted} onChange={(v) => setField('facilityPermitted', v)} columns={3} />
          <FormNumberInput label="시설 면적" value={facilityArea} onChange={(v) => setField('facilityArea', v)} suffix="m²" />
        </>
      )}
    </FormSection>
  );
}
