import { useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import appStatusStore from '@/store/appStatus';
import usePermissionStore from '@/store/permissionStore';
import useAuthStore from '@/lib/store/auth';
import { useNetworkStore } from '@/lib/offline/networkStatus';
import { useSubmitQueue } from '@/lib/offline/submitQueue';
import useCodesStore from '@/lib/store/codes';
import { registerDeviceToken } from '@/lib/api/survey';
import OfflineBanner from '@/components/OfflineBanner';
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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loadStoredToken = useAuthStore((s) => s.loadStoredToken);
  const loadCodesFromCache = useCodesStore((s) => s.loadFromCache);
  const fetchCodesFromServer = useCodesStore((s) => s.fetchFromServer);
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
  // version check — expo-constants 기반 (스토어 최신 버전 조회는 추후 구현)
  const checkVersion = async () => {
    // TODO: 스토어 최신 버전 비교 로직 추후 구현
    // 현재 버전: Constants.expoConfig?.version
    return false;
  };

  useEffect(() => {
    async function prepare() {
      const timeout = new Promise<void>((resolve) => setTimeout(resolve, 5000));
      try {
        await Promise.race([
          Promise.all([
            checkPermissions(),
            checkVersion(),
            loadStoredToken(),
            useSubmitQueue.getState().loadQueue(),
            loadCodesFromCache(),
            new Promise((resolve) => setTimeout(resolve, 1000)),
          ]),
          timeout,
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  const router = useRouter();

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  // 네트워크 상태 리스너 시작
  useEffect(() => {
    const cleanup = useNetworkStore.getState().startListening();
    return cleanup;
  }, []);

  // 인증 상태 변화 감지 — 로그인 후 서버 코드 로딩, 로그아웃 시 로그인 화면 이동
  useEffect(() => {
    if (!isReady) return;
    if (isAuthenticated) {
      fetchCodesFromServer();
      // FCM 디바이스 토큰 등록 — expo-notifications 연동 시 실제 토큰으로 교체
      // registerDeviceToken(fcmToken);
    } else {
      router.replace('/login');
    }
  }, [isReady, isAuthenticated]);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <OfflineBanner />
      <Stack
        screenOptions={{
          animation: 'fade',
          headerShown: false,
          navigationBarColor: 'transparent',
          navigationBarHidden: true,
        }}
        initialRouteName={isAuthenticated ? '(tabs)' : 'login/index'}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login/index" />
        <Stack.Screen name="map/index" />
        <Stack.Screen name="survey/[id]" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
      <Toast />
    </GestureHandlerRootView>
  );
}
