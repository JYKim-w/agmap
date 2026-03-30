import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Config from './config';

const isEmpty = (value) => {
  return (
    value === '' ||
    value === null ||
    value === undefined ||
    (value !== null && typeof value === 'object' && !Object.keys(value).length)
  );
};

const getItemFromAsync = async (storageName) => {
  if (isEmpty(storageName)) {
    throw new Error('Storage Name is empty');
  }
  try {
    const result = await AsyncStorage.getItem(storageName);
    return JSON.parse(result);
  } catch (error) {
    console.error('getItemFromAsync error:', error);
    throw error;
  }
};

const setItemToAsync = async (storageName, item) => {
  if (isEmpty(storageName)) {
    throw new Error('Storage Name is empty');
  }
  try {
    await AsyncStorage.setItem(storageName, JSON.stringify(item));
    return '입력 성공';
  } catch (error) {
    console.error('setItemToAsync error:', error);
    throw error;
  }
};

const Login = {
  isLoginInfoValidation: (data) => {
    if (!data.userId) {
      Toast.show({ type: 'error', text1: Config.message.error.id });
      return false;
    }
    if (!data.pwd) {
      Toast.show({ type: 'error', text1: Config.message.error.pwd });
      return false;
    }

    return true;
  },

  setLoginInfo: async (data) => {
    try {
      await AsyncStorage.removeItem(Config.file.loginInfo);
      await setItemToAsync(Config.file.loginInfo, data);
    } catch (error) {
      console.error('setLoginInfo error:', error);
      Toast.show({
        type: 'error',
        text1: '로그인 정보 저장 실패.',
        text2: error.message,
      });
    }
  },

  getLoginInfo: async () => {
    try {
      return await getItemFromAsync(Config.file.loginInfo);
    } catch (error) {
      console.error('getLoginInfo error:', error);
      Toast.show({
        type: 'error',
        text1: '로그인 정보 불러오기 실패.',
        text2: error.message,
      });
      return null;
    }
  },

  chkLoginNetwork: async (info) => {
    const url = Config.url + 'login/appLogin';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...info, jobsecd: '05' }),
      });
      const responseJson = await response.json();
      // console.log('responseJson', responseJson);
      if (responseJson.result === 'true') {
        const loginInfo = {
          ...info,
          jobsecd: '05',
          userSecd: responseJson.userSecd,
          sessionId: responseJson.sessionId,
        };
        await Login.setLoginInfo(loginInfo);
        return loginInfo;
      } else {
        await AsyncStorage.removeItem(Config.file.loginInfo);
        Toast.show({ type: 'error', text1: responseJson.result });
        return null;
      }
    } catch (error) {
      console.error('chkLoginNetwork error:', error);
      Toast.show({
        type: 'error',
        text1: '로그인 실패.',
        text2: error.message,
      });
      return null;
    }
  },

  removeLogininfo: async () => {
    try {
      await AsyncStorage.removeItem(Config.file.loginInfo);
    } catch (error) {
      console.error('removeLogininfo error:', error);
      Toast.show({
        type: 'error',
        text1: '로그인 정보 삭제 실패.',
        text2: error.message,
      });
    }
  },

  logout: async () => {
    try {
      const result = await Login.getLoginInfo();
      if (!result) return;
      const url = Config.url + 'login/appLogout';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: result.userId,
          licenseCode: result.licenseCode,
          imei: result.imei,
        }),
      });
      const responseJson = await response.json();
      await Login.removeLogininfo();
      // await File.deleteOfflineFIle(); // 주석처리된 부분
      return responseJson;
    } catch (error) {
      console.error('logout error:', error);
      Toast.show({
        type: 'error',
        text1: '로그아웃 실패.',
        text2: error.message,
      });
      return null;
    }
  },

  deleteUser: async () => {
    try {
      const result = await Login.getLoginInfo();
      if (!result) return;
      const url = Config.url + 'login/appDelete';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...result, pwd: result.pwd }),
      });
      const responseJson = await response.json();
      await Login.removeLogininfo();
      // await File.deleteOfflineFIle(); // 주석처리된 부분
      return responseJson;
    } catch (error) {
      console.error('deleteUser error:', error);
      Toast.show({
        type: 'error',
        text1: '회원 탈퇴 실패.',
        text2: error.message,
      });
      return null;
    }
  },
};

export default Login;
