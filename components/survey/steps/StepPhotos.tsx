// Step 7: 증빙 사진
// Design Ref: mockup/screens/survey-step7.html
import FormSection from '@/components/FormSection';
import useSurveyFormStore, { type PhotoEntry } from '@/lib/store/surveyForm';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

const PHOTO_TYPES: { type: PhotoEntry['photoType']; label: string; required: boolean }[] = [
  { type: 'OVERVIEW', label: '전경', required: true },
  { type: 'CLOSEUP', label: '근경', required: true },
  { type: 'FACILITY', label: '시설물', required: false },
  { type: 'VIOLATION', label: '위반', required: false },
  { type: 'ETC', label: '기타', required: false },
];

export default function StepPhotos() {
  const photos = useSurveyFormStore((s) => s.photos);
  const addPhoto = useSurveyFormStore((s) => s.addPhoto);
  const removePhoto = useSurveyFormStore((s) => s.removePhoto);
  const facilityYn = useSurveyFormStore((s) => s.facilityYn);
  const surveyorOpinion = useSurveyFormStore((s) => s.surveyorOpinion);

  const pickImage = async (photoType: PhotoEntry['photoType']) => {
    Alert.alert('사진 추가', '', [
      {
        text: '카메라',
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
          if (!result.canceled && result.assets[0]) {
            addPhoto({ uri: result.assets[0].uri, photoType });
          }
        },
      },
      {
        text: '앨범',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
          if (!result.canceled && result.assets[0]) {
            addPhoto({ uri: result.assets[0].uri, photoType });
          }
        },
      },
      { text: '취소', style: 'cancel' },
    ]);
  };

  // 필수 체크 상태
  const hasOverview = photos.some((p) => p.photoType === 'OVERVIEW');
  const hasCloseup = photos.some((p) => p.photoType === 'CLOSEUP');

  return (
    <FormSection title="7단계: 증빙 사진">
      <Text style={s.sectionLabel}>사진 촬영 <Text style={s.req}>*</Text></Text>

      {/* 사진 그리드 */}
      <View style={s.photoGrid}>
        {photos.map((photo, idx) => (
          <View key={idx} style={s.photoThumb}>
            <Image source={{ uri: photo.uri }} style={s.photoImage} />
            <Pressable style={s.photoRemove} onPress={() => removePhoto(idx)}>
              <Text style={s.removeX}>×</Text>
            </Pressable>
            <View style={s.photoLabel}>
              <Text style={s.photoLabelText}>
                {PHOTO_TYPES.find((t) => t.type === photo.photoType)?.label ?? ''}
              </Text>
            </View>
          </View>
        ))}
        <Pressable style={s.photoAdd} onPress={() => {
          // 필수 사진부터 안내
          const nextType = !hasOverview ? 'OVERVIEW' : !hasCloseup ? 'CLOSEUP' : 'ETC';
          pickImage(nextType);
        }}>
          <Text style={s.addPlus}>+</Text>
          <Text style={s.addText}>추가</Text>
        </Pressable>
      </View>

      {/* 필수 체크 표시 */}
      <View style={s.checkRow}>
        <Text style={hasOverview ? s.checkOk : s.checkMissing}>
          {hasOverview ? '✓' : '○'} 전경 (필수)
        </Text>
        <Text style={hasCloseup ? s.checkOk : s.checkMissing}>
          {hasCloseup ? '✓' : '○'} 근경 (필수)
        </Text>
      </View>

      {/* 촬영 가이드 */}
      <View style={s.guide}>
        <Text style={s.guideText}>
          <Text style={s.guideBold}>전경</Text> - 필지 전체{'\n'}
          <Text style={s.guideBold}>근경</Text> - 작물/시설 클로즈업{'\n'}
          <Text style={s.guideBold}>시설물</Text> - 시설물 있을 때{'\n'}
          <Text style={s.guideBold}>위반</Text> - 위반 판단 시 증거
        </Text>
      </View>

      {/* 개별 타입 추가 버튼 (조건부) */}
      {facilityYn === true && (
        <Pressable style={s.typeBtn} onPress={() => pickImage('FACILITY')}>
          <Ionicons name="add-circle-outline" size={18} color="#228be6" />
          <Text style={s.typeBtnText}>시설물 사진 추가</Text>
        </Pressable>
      )}
      {surveyorOpinion === 'VIOLATION' && (
        <Pressable style={s.typeBtn} onPress={() => pickImage('VIOLATION')}>
          <Ionicons name="add-circle-outline" size={18} color="#fa5252" />
          <Text style={[s.typeBtnText, { color: '#fa5252' }]}>위반 사진 추가</Text>
        </Pressable>
      )}
    </FormSection>
  );
}

const s = StyleSheet.create({
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#343a40', marginBottom: 8 },
  req: { color: '#fa5252' },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  photoThumb: { width: 100, height: 100, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f1f3f5' },
  photoImage: { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  removeX: { color: '#fff', fontSize: 12, fontWeight: '700' },
  photoLabel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 2,
  },
  photoLabelText: { color: '#fff', fontSize: 11, textAlign: 'center' },
  photoAdd: {
    width: 100, height: 100, borderRadius: 8, borderWidth: 2, borderStyle: 'dashed',
    borderColor: '#dee2e6', backgroundColor: '#f8f9fa',
    alignItems: 'center', justifyContent: 'center',
  },
  addPlus: { fontSize: 24, color: '#adb5bd' },
  addText: { fontSize: 12, color: '#adb5bd' },

  checkRow: { flexDirection: 'row', gap: 16, marginTop: 8, marginBottom: 16 },
  checkOk: { fontSize: 13, color: '#40c057' },
  checkMissing: { fontSize: 13, color: '#adb5bd' },

  guide: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f3f5' },
  guideText: { fontSize: 13, color: '#868e96', lineHeight: 22 },
  guideBold: { fontWeight: '700', color: '#495057' },

  typeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingVertical: 8 },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: '#228be6' },
});
