import { Stack, useNavigation } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Config from '../js/config.js';
import Login from '../js/login';
import userStore from '@/store/userStore';
export default function LoginScreen() {
  const [userId, setUserId] = useState('');
  const [pwd, setPwd] = useState('');

  const { setUser } = userStore();
  const navigation = useNavigation();
  /* useEffect(() => {
    async function login() {
      const info = await Login.getLoginInfo();
      if (info) {
        Login.chkLoginNetwork(info).then((loginInfo) => {
          loginSucces(loginInfo);
        });
      }
    }

    login();
    return function clenup() {
      setPwd('');
    };
  }, []); */

  //로그인 버튼
  const clickLoginEvt = () => {
    if (
      Login.isLoginInfoValidation({
        userId: userId,
        pwd: pwd,
      })
    ) {
      Login.chkLoginNetwork({
        userId: userId,
        pwd: pwd,
      }).then((loginInfo) => {
        // console.log('loginInfo', loginInfo);
        loginSucces(loginInfo);
      });
    }
  };
  const loginSucces = (loginInfo) => {
    setUser(loginInfo);
    Toast.show({
      type: 'success',
      text1: '로그인 완료',
    });
    navigation.navigate('map/index' as never);
  };
  const theme = useTheme();
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
            <View
              style={{
                // width: '100%',
                // height: '100%',

                flexGrow: 1,
                padding: 30,
                justifyContent: 'center',
                // margin: 'auto',
                // backgroundColor: 'orange',
              }}
            >
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
                    onChangeText={(id) => setUserId(id)}
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
                    onChangeText={(pwd) => setPwd(pwd)}
                  />
                </ImageBackground>

                <TouchableOpacity
                  style={{ width: '100%', height: 60 }}
                  onPress={clickLoginEvt}
                >
                  <Image
                    resizeMode="contain"
                    style={{ width: '100%', height: '100%' }}
                    source={require('../../assets/images/log-in-login.png')}
                  />
                </TouchableOpacity>
              </View>
              <View>
                <Button
                  onPress={async () => {
                    await WebBrowser.openBrowserAsync(
                      Config.url + 'login/signup'
                    );
                  }}
                >
                  회원가입
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  inputBg: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    marginLeft: 100,
    height: 50,
    color: 'black',
  },
  bottomLogo: {
    // position: 'absolute',
    height: 60,
    marginTop: 30,
    // bottom: 60,
  },
  signin: {
    // position: 'relative',
    textAlign: 'right',
  },
});
