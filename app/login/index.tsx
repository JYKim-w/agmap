// Design Ref: mockup/screens/login.html
import { BASE_URL } from '@/lib/config';
import useAuthStore from '@/lib/store/auth';
import { Stack, useNavigation } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!loginId.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: '아이디와 비밀번호를 입력하세요' });
      return;
    }

    Keyboard.dismiss();
    const result = await login(loginId.trim(), password);

    if (result.success) {
      Toast.show({ type: 'success', text1: '로그인 완료' });
      navigation.navigate('map/index' as never);
    } else {
      Toast.show({ type: 'error', text1: '로그인 실패', text2: result.message });
    }
  };

  return (
    <View style={s.screen}>
      <Stack.Screen options={{ title: 'login', headerShown: false }} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'center' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={s.container}>
              {/* 로고 */}
              <View style={s.logoWrap}>
                <View style={s.logoIcon}>
                  <Text style={s.logoIconText}>AG</Text>
                </View>
                <Text style={s.logoTitle}>농지현장조사</Text>
                <Text style={s.logoSub}>현장 조사원 전용 앱</Text>
              </View>

              {/* 폼 */}
              <View style={s.form}>
                <TextInput
                  autoCapitalize="none"
                  style={s.input}
                  placeholder="아이디"
                  placeholderTextColor="#ced4da"
                  onChangeText={setLoginId}
                  value={loginId}
                  editable={!isLoading}
                />
                <TextInput
                  autoCapitalize="none"
                  style={s.input}
                  placeholder="비밀번호"
                  placeholderTextColor="#ced4da"
                  secureTextEntry
                  onChangeText={setPassword}
                  value={password}
                  onSubmitEditing={handleLogin}
                  editable={!isLoading}
                />
                <Pressable
                  style={({ pressed }) => [s.btn, pressed && { opacity: 0.85 }]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={s.btnText}>로그인</Text>
                  )}
                </Pressable>
              </View>

              {/* 회원가입 */}
              <Pressable
                style={s.signupWrap}
                onPress={() => WebBrowser.openBrowserAsync(`${BASE_URL}/auth/signup`)}
              >
                <Text style={s.signupText}>회원가입</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  // 로고
  logoWrap: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#228be6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoIconText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
  },
  logoSub: {
    fontSize: 14,
    color: '#868e96',
    marginTop: 4,
  },
  // 폼
  form: {
    gap: 16,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#212529',
    backgroundColor: '#fff',
  },
  btn: {
    height: 56,
    borderRadius: 10,
    backgroundColor: '#228be6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // 회원가입
  signupWrap: {
    marginTop: 16,
    alignItems: 'center',
    padding: 10,
  },
  signupText: {
    fontSize: 14,
    color: '#228be6',
  },
});
