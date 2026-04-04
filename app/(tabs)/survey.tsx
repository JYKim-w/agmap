// 조사 탭 — 할당 목록에서 선택해야 조사 시작 가능
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SurveyTab() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Ionicons name="clipboard-outline" size={48} color="#ced4da" />
        <Text style={s.title}>조사 대상을 선택하세요</Text>
        <Text style={s.sub}>홈 탭에서 할당 목록을 확인하고{'\n'}조사할 필지를 선택해주세요</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 17, fontWeight: '600', color: '#495057', marginTop: 16 },
  sub: { fontSize: 14, color: '#adb5bd', textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
