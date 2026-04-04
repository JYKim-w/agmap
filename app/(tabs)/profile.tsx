// 내정보 탭 — Phase 5에서 구현. 임시 placeholder.
import useAuthStore from '@/lib/store/auth';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <View style={s.card}>
          <Text style={s.name}>{user?.userName ?? '-'}</Text>
          <Text style={s.role}>{user?.role} / {user?.companyName}</Text>
          <Text style={s.id}>{user?.loginId}</Text>
        </View>
        <Pressable
          style={s.logoutBtn}
          onPress={async () => {
            await logout();
            router.replace('/login');
          }}
        >
          <Text style={s.logoutText}>로그아웃</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, alignItems: 'center' },
  name: { fontSize: 22, fontWeight: '700', color: '#212529' },
  role: { fontSize: 14, color: '#868e96', marginTop: 4 },
  id: { fontSize: 13, color: '#adb5bd', marginTop: 2 },
  logoutBtn: { height: 50, borderRadius: 10, backgroundColor: '#fa5252', alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
