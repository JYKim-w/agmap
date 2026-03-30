import { useAppTheme } from '@/app/theme/theme';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { NativeBaseProvider } from 'native-base';
import { useEffect, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import VersionCheck from 'react-native-version-check';
import Login from './js/login';
import { RefProvider } from './refContext';
import appStatusStore from '@/store/appStatus';
import usePermissionStore from '@/store/permissionStore';
import userStore from '@/store/userStore';
// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

//개발용 리액트론
if (__DEV__) {
  // require('../ReactotronConfig');
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const { setPermissions } = usePermissionStore();
  const { userId, setUser } = userStore();
  const { setInsets, reset } = appStatusStore();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (Platform.OS === 'android') {
      setInsets(insets);
    }
    return reset();
  }, [insets]);

  // 권한 체크 함수
  const checkPermissions = async () => {
    try {
      // 위치 권한 체크
      const locationStatus = await Location.requestForegroundPermissionsAsync();

      // 카메라 권한 체크
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }

      const permissions = {
        location: locationStatus.status === 'granted',
        camera: cameraPermission?.granted || false,
      };

      // 권한 상태 저장
      setPermissions(permissions.location, permissions.camera);

      return permissions;
    } catch (error) {
      console.error('권한 체크 중 오류 발생:', error);
      return {
        location: false,
        camera: false,
      };
    }
  };
  //version check
  function updateVersionCheck(storeVersion, currentVersion) {
    let result = false;

    if (typeof storeVersion != 'undefined') {
      let sv = storeVersion.split('.');
      let cv = currentVersion.split('.');

      let cnt = Math.max(sv.length, cv.length);

      for (let i = 0; i < cnt; i++) {
        let v1 = sv[i] ? parseInt(sv[i]) : 0;
        let v2 = cv[i] ? parseInt(cv[i]) : 0;

        if (v1 > v2) {
          result = true;
          break;
        }
      }
    }

    return result;
  }
  const versionStoreNm = Platform.select({
    ios: 'appStore',
    android: 'playStore',
  });
  const checkVersion = async () => {
    try {
      const latestVersion = await VersionCheck.getLatestVersion({
        provider: versionStoreNm,
      });
      const currentVersion = VersionCheck.getCurrentVersion();

      if (!updateVersionCheck(latestVersion, currentVersion)) {
        return false; // 업데이트 불필요
      }

      return new Promise((resolve) => {
        Alert.alert(
          '업데이트',
          '최신 버전으로 업데이트 하시겠습니까?',
          [
            {
              text: 'OK',
              onPress: async () => {
                const appURL =
                  Platform.OS === 'ios'
                    ? 'https://apps.apple.com/kr/app/id6496601839'
                    : 'https://play.google.com/store/apps/details?id=com.agmap';

                try {
                  await Linking.openURL(appURL);
                  resolve(true); // 업데이트 버튼 클릭 후 완료
                } catch (error) {
                  console.warn('Failed to open URL:', error);
                  resolve(false); // URL 열기 실패
                }
              },
            },
            {
              text: 'Cancel',
              onPress: () => {
                resolve(false); // 취소 버튼 클릭 후 완료
              },
            },
          ],
          { cancelable: false }
        );
      });
    } catch (error) {
      console.warn('Version check failed:', error);
      return false; // 버전 확인 실패
    }
  };

  useEffect(() => {
    async function prepare() {
      try {
        await Promise.all([
          checkPermissions(),
          checkVersion(),
          new Promise((resolve) => setTimeout(resolve, 1000)),
        ]);
        const info = await Login.getLoginInfo();
        if (info) {
          const loginInfo = await Login.chkLoginNetwork(info);
          if (loginInfo) {
            setUser(loginInfo);
          }
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  const theme = useAppTheme();

  // 준비 완료 전까지 스플래시 화면 유지
  if (!isReady) {
    return null;
  }

  return (
    <RefProvider>
      <NativeBaseProvider theme={theme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <StatusBar style="dark" translucent backgroundColor="transparent" />
            <Stack
              screenOptions={{
                animation: 'fade',
                headerShown: false,
                navigationBarColor: 'transparent',
                navigationBarHidden: true,
              }}
              initialRouteName={userId ? 'map/index' : 'login/index'}
            >
              <Stack.Screen name="map/index" />
              <Stack.Screen name="login/index" />
            </Stack>
            <Toast />
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </NativeBaseProvider>
    </RefProvider>
  );
}
