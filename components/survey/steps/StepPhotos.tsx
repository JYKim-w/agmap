// Step 7: 증빙 사진 — 종류별 세로 배치
// Design Ref: mockup/screens/survey-step7.html
import FormSection from '@/components/FormSection';
import useSurveyFormStore, { type PhotoEntry } from '@/lib/store/surveyForm';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const PHOTO_TYPES: { type: PhotoEntry['photoType']; label: string; desc: string; required: boolean }[] = [
  { type: 'OVERVIEW', label: '전경', desc: '필지 전체가 보이도록 촬영', required: true },
  { type: 'CLOSEUP', label: '근경', desc: '작물/시설 클로즈업', required: true },
  { type: 'FACILITY', label: '시설물', desc: '시설물 있을 때 촬영', required: false },
  { type: 'VIOLATION', label: '위반', desc: '위반 판단 시 증거', required: false },
  { type: 'ETC', label: '기타', desc: '기타 참고 사진', required: false },
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

  return (
    <FormSection title="7단계: 증빙 사진">
      {PHOTO_TYPES.map((pt) => {
        // 조건부 표시
        if (pt.type === 'FACILITY' && !facilityYn) return null;
        if (pt.type === 'VIOLATION' && surveyorOpinion !== 'VIOLATION') return null;

        const typePhotos = photos.filter((p) => p.photoType === pt.type);
        const isRequired = pt.required || (pt.type === 'FACILITY' && facilityYn) || (pt.type === 'VIOLATION' && surveyorOpinion === 'VIOLATION');
        const hasPhoto = typePhotos.length > 0;

        return (
          <View key={pt.type} style={s.section}>
            {/* 헤더 — 라벨 + 필수 + 체크 */}
            <View style={s.header}>
              <View style={s.headerLeft}>
                <Text style={s.label}>{pt.label}</Text>
                {isRequired && <Text style={s.req}> *</Text>}
              </View>
              {hasPhoto ? (
                <Text style={s.checkOk}>✓ {typePhotos.length}장</Text>
              ) : isRequired ? (
                <Text style={s.checkMissing}>미촬영</Text>
              ) : (
                <Text style={s.checkOptional}>선택</Text>
              )}
            </View>

            {/* 설명 */}
            <Text style={s.desc}>{pt.desc}</Text>

            {/* 사진 목록 + 추가 버튼 */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.photoRow}>
              {typePhotos.map((photo, idx) => {
                const globalIdx = photos.indexOf(photo);
                return (
                  <View key={idx} style={s.thumb}>
                    <Image source={{ uri: photo.uri }} style={s.thumbImage} />
                    <Pressable style={s.thumbRemove} onPress={() => removePhoto(globalIdx)}>
                      <Text style={s.removeX}>×</Text>
                    </Pressable>
                  </View>
                );
              })}
              <Pressable style={s.addBtn} onPress={() => pickImage(pt.type)}>
                <Ionicons name="camera-outline" size={22} color="#868e96" />
                <Text style={s.addText}>촬영</Text>
              </Pressable>
            </ScrollView>
          </View>
        );
      })}
    </FormSection>
  );
}

const s = StyleSheet.create({
  section: {
    paddingBottom: 20, marginBottom: 20,
    borderBottomWidth: 1, borderBottomColor: '#f1f3f5',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 15, fontWeight: '700', color: '#212529' },
  req: { fontSize: 14, color: '#fa5252', fontWeight: '600' },
  checkOk: { fontSize: 13, fontWeight: '600', color: '#40c057' },
  checkMissing: { fontSize: 13, fontWeight: '600', color: '#fa5252' },
  checkOptional: { fontSize: 13, color: '#adb5bd' },
  desc: { fontSize: 13, color: '#868e96', marginBottom: 10 },

  photoRow: { flexDirection: 'row' },
  thumb: { width: 100, height: 100, borderRadius: 8, marginRight: 8, overflow: 'hidden', backgroundColor: '#f1f3f5' },
  thumbImage: { width: '100%', height: '100%' },
  thumbRemove: {
    position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  removeX: { color: '#fff', fontSize: 13, fontWeight: '700' },

  addBtn: {
    width: 100, height: 100, borderRadius: 8, borderWidth: 2, borderStyle: 'dashed',
    borderColor: '#dee2e6', backgroundColor: '#f8f9fa',
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  addText: { fontSize: 12, color: '#868e96' },
});
