// Step 1: 필지 기본 정보 (읽기전용)
import FormSection from '@/components/FormSection';
import StatusBadge from '@/components/StatusBadge';
import useSurveyFormStore from '@/lib/store/surveyForm';
import { StyleSheet, Text, View } from 'react-native';

export default function StepInfo() {
  const address = useSurveyFormStore((s) => s.address);
  const riskGrade = useSurveyFormStore((s) => s.riskGrade);

  return (
    <FormSection title="1단계: 필지 정보">
      <View style={s.row}>
        <Text style={s.label}>소재지</Text>
        <Text style={s.value}>{address || '-'}</Text>
      </View>
      <View style={s.row}>
        <Text style={s.label}>위험등급</Text>
        {riskGrade ? <StatusBadge type={riskGrade as any} /> : <Text style={s.value}>-</Text>}
      </View>
    </FormSection>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  label: { width: 80, fontSize: 14, color: '#868e96', flexShrink: 0 },
  value: { fontSize: 15, color: '#212529', flex: 1 },
});
