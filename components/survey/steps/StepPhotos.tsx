// Step 7: 증빙 사진
import FormSection from '@/components/FormSection';
import useSurveyFormStore, { type PhotoEntry } from '@/lib/store/surveyForm';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const PHOTO_TYPES: { type: PhotoEntry['photoType']; label: string; required: boolean }[] = [
  { type: 'OVERVIEW', label: '전경', required: true },
  { type: 'CLOSEUP', label: '근접', required: true },
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

  return (
    <FormSection title="7단계: 증빙 사진">
      {PHOTO_TYPES.map((pt) => {
        // 조건부 표시
        if (pt.type === 'FACILITY' && !facilityYn) return null;
        if (pt.type === 'VIOLATION' && surveyorOpinion !== 'VIOLATION') return null;

        const typePhotos = photos.filter((p) => p.photoType === pt.type);
        const isRequired = pt.required || (pt.type === 'FACILITY' && facilityYn) || (pt.type === 'VIOLATION' && surveyorOpinion === 'VIOLATION');

        return (
          <View key={pt.type} style={s.photoGroup}>
            <View style={s.photoHeader}>
              <Text style={s.photoLabel}>
                {pt.label}{isRequired && <Text style={s.req}> *</Text>}
              </Text>
              <Text style={s.photoCount}>{typePhotos.length}장</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.photoRow}>
              {typePhotos.map((photo, idx) => {
                const globalIdx = photos.indexOf(photo);
                return (
                  <View key={idx} style={s.photoThumb}>
                    <Image source={{ uri: photo.uri }} style={s.photoImage} />
                    <Pressable style={s.photoRemove} onPress={() => removePhoto(globalIdx)}>
                      <Ionicons name="close-circle" size={20} color="#fa5252" />
                    </Pressable>
                  </View>
                );
              })}
              <Pressable style={s.photoAdd} onPress={() => pickImage(pt.type)}>
                <Ionicons name="camera-outline" size={24} color="#868e96" />
                <Text style={s.photoAddText}>추가</Text>
              </Pressable>
            </ScrollView>
          </View>
        );
      })}
    </FormSection>
  );
}

const s = StyleSheet.create({
  photoGroup: { marginBottom: 24 },
  photoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  photoLabel: { fontSize: 14, fontWeight: '600', color: '#343a40' },
  req: { color: '#fa5252' },
  photoCount: { fontSize: 13, color: '#adb5bd' },
  photoRow: { flexDirection: 'row' },
  photoThumb: { width: 80, height: 80, borderRadius: 8, marginRight: 8, overflow: 'hidden' },
  photoImage: { width: '100%', height: '100%' },
  photoRemove: { position: 'absolute', top: 2, right: 2 },
  photoAdd: { width: 80, height: 80, borderRadius: 8, borderWidth: 1.5, borderColor: '#dee2e6', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' },
  photoAddText: { fontSize: 11, color: '#868e96', marginTop: 2 },
});
