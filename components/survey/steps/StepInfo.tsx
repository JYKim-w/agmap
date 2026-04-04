// Step 1: 필지 기본 정보 (읽기전용)
// Design Ref: mockup/screens/survey-step1.html
import FormSection from '@/components/FormSection';
import StatusBadge from '@/components/StatusBadge';
import useSurveyFormStore from '@/lib/store/surveyForm';
import useAuthStore from '@/lib/store/auth';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function StepInfo() {
  const address = useSurveyFormStore((s) => s.address);
  const riskGrade = useSurveyFormStore((s) => s.riskGrade);
  const user = useAuthStore((s) => s.user);

  return (
    <FormSection title="1단계: 필지 기본 정보">
      <Text style={s.hint}>자동으로 불러온 정보입니다. 확인 후 다음으로 진행하세요.</Text>

      <View style={s.row}>
        <Text style={s.label}>소재지</Text>
        <Text style={s.value}>{address || '-'}</Text>
      </View>
      <View style={s.row}>
        <Text style={s.label}>위험도</Text>
        {riskGrade ? <StatusBadge type={riskGrade as any} /> : <Text style={s.value}>-</Text>}
      </View>
      <View style={s.row}>
        <Text style={s.label}>조사원</Text>
        <Text style={s.value}>{user?.userName ?? '-'}</Text>
      </View>
      <View style={[s.row, { borderBottomWidth: 0 }]}>
        <Text style={s.label}>구역</Text>
        <Text style={s.value}>{address?.split(' ').slice(0, 3).join(' ') || '-'}</Text>
      </View>

      <View style={s.gpsBanner}>
        <Ionicons name="information-circle" size={16} color="#1864ab" />
        <Text style={s.gpsText}>현재 GPS 위치를 확인합니다.</Text>
      </View>
    </FormSection>
  );
}

const s = StyleSheet.create({
  hint: { fontSize: 13, color: '#adb5bd', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  label: { width: 80, fontSize: 14, color: '#adb5bd', flexShrink: 0 },
  value: { fontSize: 15, color: '#212529', fontWeight: '500', flex: 1 },
  gpsBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#e7f5ff', borderRadius: 8, padding: 12, marginTop: 12 },
  gpsText: { fontSize: 13, color: '#1864ab' },
});
