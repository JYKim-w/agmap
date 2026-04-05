// Step 8: 확인 화면 (요약 + 제출 전 최종 검토)
// Design Ref: mockup/screens/survey-confirm.html
import FormSection from '@/components/FormSection';
import StatusBadge from '@/components/StatusBadge';
import useSurveyFormStore from '@/lib/store/surveyForm';
import {
  CROP_TYPE, CROP_CONDITION, CULTIVATOR_TYPE,
  FALLOW_PERIOD, FALLOW_REASON, NEGLECT_LEVEL,
  FACILITY_TYPE, FACILITY_DETAIL, PERMIT_STATUS,
  CONVERSION_USE, CONVERSION_SCALE,
  SURVEYOR_OPINION, OWNER_CONTACT,
} from '@/lib/survey/codes';
import { Image, StyleSheet, Text, View } from 'react-native';

/** 코드값 → 라벨 변환 */
function codeLabel(codes: { value: string; label: string }[], value: string | null): string {
  if (!value) return '';
  return codes.find((c) => c.value === value)?.label ?? value;
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, color ? { color, fontWeight: '600' } : null]}>{value}</Text>
    </View>
  );
}

export default function StepConfirm() {
  const form = useSurveyFormStore();

  const opinionLabel = SURVEYOR_OPINION.find((o) => o.value === form.surveyorOpinion)?.label ?? '-';
  const opinionColor = form.surveyorOpinion === 'NORMAL' ? '#40c057'
    : form.surveyorOpinion === 'MINOR_VIOLATION' ? '#fd7e14' : '#fa5252';

  const elapsed = form.startedAt ? Math.round((Date.now() - form.startedAt) / 1000) : null;
  const elapsedText = elapsed !== null
    ? elapsed >= 60 ? `${Math.floor(elapsed / 60)}분 ${elapsed % 60}초` : `${elapsed}초`
    : '-';

  return (
    <>
      <FormSection title="입력 확인">
        <Text style={s.hint}>입력 내용을 확인하고 제출해주세요.</Text>

        {/* 필지 정보 */}
        <Text style={s.sectionTitle}>필지 정보</Text>
        <Row label="주소" value={form.address?.split(' ').slice(-1)[0] ?? '-'} />
        <Row label="위험도" value={form.riskGrade || '-'} />

        {/* 조사 내용 */}
        <Text style={s.sectionTitle}>조사 내용</Text>
        <Row
          label="실경작"
          value={form.cultivationYn === true
            ? `예 (${[codeLabel(CROP_TYPE, form.cropType), codeLabel(CROP_CONDITION, form.cropCondition), codeLabel(CULTIVATOR_TYPE, form.cultivatorType)].filter(Boolean).join(' / ')})`
            : form.cultivationYn === false ? '아니오' : '-'}
        />
        <Row label="휴경" value={form.fallowYn === true ? `예 (${codeLabel(FALLOW_PERIOD, form.fallowPeriod)})` : form.fallowYn === false ? '아니오' : '-'} />
        <Row label="시설물" value={form.facilityYn === true ? `예 (${codeLabel(FACILITY_TYPE, form.facilityType)})` : form.facilityYn === false ? '아니오' : '-'} />
        <Row label="불법전용" value={form.conversionYn === true ? `예 (${codeLabel(CONVERSION_USE, form.conversionUse)})` : form.conversionYn === false ? '아니오' : '-'} />
        <Row label="종합의견" value={opinionLabel} color={opinionColor} />
        {form.memo ? <Row label="메모" value={form.memo} /> : null}

        {/* 사진 */}
        <Text style={s.sectionTitle}>증빙 사진 ({form.photos.length}장)</Text>
        {form.photos.length > 0 ? (
          <View style={s.photoGrid}>
            {form.photos.map((p, i) => (
              <View key={i} style={s.photoThumb}>
                <Image source={{ uri: p.uri }} style={s.photoImage} />
                <View style={s.photoLabel}>
                  <Text style={s.photoLabelText}>{p.photoType === 'OVERVIEW' ? '전경' : p.photoType === 'CLOSEUP' ? '근경' : p.photoType}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={s.noPhoto}>사진 없음</Text>
        )}

        {/* 메타 정보 */}
        <Text style={s.sectionTitle}>조사 정보</Text>
        <Row label="소요시간" value={elapsedText} />
        <Row label="GPS" value={form.surveyLat ? `${form.surveyLat.toFixed(5)}, ${form.surveyLng?.toFixed(5)}` : '미기록'} />
      </FormSection>
    </>
  );
}

const s = StyleSheet.create({
  hint: { fontSize: 13, color: '#adb5bd', marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#868e96', letterSpacing: 0.5, marginTop: 20, marginBottom: 8, textTransform: 'uppercase' },
  row: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  rowLabel: { width: 80, fontSize: 14, color: '#868e96', flexShrink: 0 },
  rowValue: { flex: 1, fontSize: 15, color: '#212529', fontWeight: '500' },
  photoGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  photoThumb: { width: 80, height: 80, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f1f3f5' },
  photoImage: { width: '100%', height: '100%' },
  photoLabel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 2 },
  photoLabelText: { color: '#fff', fontSize: 11, textAlign: 'center' },
  noPhoto: { fontSize: 13, color: '#adb5bd' },
});
