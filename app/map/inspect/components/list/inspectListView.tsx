import codeStore from '@/store/codeStore';
import inspectStore from '@/store/inspectStore';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BtBody from '@/src/map/components/btBody';
import InspectHeader from './InspectHeader';
import InspectListContent from './InspectListContent';

export default function InspectListView() {
  const pnu = inspectStore((s) => s.fieldInfo?.pnu);
  const fieldInfo = inspectStore((s) => s.fieldInfo);
  const fetchInspectList = inspectStore((s) => s.fetchInspectList);
  const fetchFiles = inspectStore((s) => s.fetchFiles);
  const fetchJimkCodeList = codeStore((s) => s.fetchJimkCodeList);
  const router = useRouter();

  const handleRefresh = useCallback(() => {
    if (pnu) {
      fetchInspectList(pnu);
      fetchFiles(pnu);
    }
    fetchJimkCodeList();
  }, [pnu, fetchInspectList, fetchFiles, fetchJimkCodeList]);

  return (
    <View style={{ flex: 1 }}>
      <InspectHeader />
      {/* 조사 시작 버튼 */}
      {fieldInfo && (
        <Pressable
          style={ss.surveyBtn}
          onPress={() => router.push(`/survey/${fieldInfo.pnu}`)}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={ss.surveyBtnText}>조사 시작</Text>
        </Pressable>
      )}
      <BtBody>
        <InspectListContent onRefresh={handleRefresh} />
      </BtBody>
    </View>
  );
}

const ss = StyleSheet.create({
  surveyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginVertical: 8,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#228be6',
  },
  surveyBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
