import { BASE_URL } from '@/lib/config';
import useAuthStore from '@/lib/store/auth';
import { Stack, useNavigation } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
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
    <ImageBackground
      resizeMode="cover"
      source={require('../../assets/images/log-in-bg.png')}
      style={{ height: '100%' }}
    >
      <Stack.Screen options={{ title: 'login', headerShown: false }} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'center' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              <View>
                <ImageBackground
                  resizeMode="contain"
                  source={require('../../assets/images/log-in-id.png')}
                  style={styles.inputBg}
                >
                  <TextInput
                    autoCapitalize="none"
                    style={styles.input}
                    placeholder="아이디"
                    placeholderTextColor="#392f31"
                    onChangeText={setLoginId}
                    value={loginId}
                    editable={!isLoading}
                  />
                </ImageBackground>
                <ImageBackground
                  resizeMode="contain"
                  source={require('../../assets/images/log-in-pw.png')}
                  style={styles.inputBg}
                >
                  <TextInput
                    autoCapitalize="none"
                    style={styles.input}
                    placeholder="비밀번호"
                    placeholderTextColor="#392f31"
                    secureTextEntry={true}
                    onChangeText={setPassword}
                    value={password}
                    onSubmitEditing={handleLogin}
                    editable={!isLoading}
                  />
                </ImageBackground>

                <TouchableOpacity
                  style={{ width: '100%', height: 60 }}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingBtn}>
                      <ActivityIndicator color="#fff" />
                    </View>
                  ) : (
                    <Image
                      resizeMode="contain"
                      style={{ width: '100%', height: '100%' }}
                      source={require('../../assets/images/log-in-login.png')}
                    />
                  )}
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity
                  onPress={async () => {
                    await WebBrowser.openBrowserAsync(
                      `${BASE_URL}/login/signup`
                    );
                  }}
                >
                  <Text style={styles.signupLink}>회원가입</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 30,
    justifyContent: 'center',
  },
  inputBg: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    marginLeft: 100,
    height: 50,
    color: 'black',
  },
  loadingBtn: {
    width: '100%',
    height: '100%',
    backgroundColor: '#228be6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupLink: {
    color: '#228be6',
    textAlign: 'center',
    padding: 10,
  },
});
