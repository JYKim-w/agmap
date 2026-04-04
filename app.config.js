import packageJson from './package.json';
module.exports = ({ config }) => {
  const appVersion = packageJson.version;
  const easBuildNumber = process.env.EAS_BUILD_NUMBER || '1';
  const androidVersionCode = Number(easBuildNumber || 1);
  const iosBuildNumber = easBuildNumber;
  return {
    expo: {
      name: '농지전수조사',
      slug: 'agmap',
      version: appVersion,
      runtimeVersion: appVersion,
      orientation: 'portrait',
      icon: './assets/images/icon2.png',
      scheme: 'agmap',
      userInterfaceStyle: 'automatic',
      newArchEnabled: true,
      updates: {
        url: 'https://u.expo.dev/9035f032-7b82-42ff-a3c8-b301476835b0',
      },
      ios: {
        supportsTablet: false,
        bundleIdentifier: 'com.mgis.agmap',
        buildNumber: iosBuildNumber,
        infoPlist: {
          ITSAppUsesNonExemptEncryption: false,
          NSLocationWhenInUseUsageDescription:
            '지도에서 현재 위치를 표시하고 필지 조사 시 정확한 위치 정보를 제공하기 위해 위치 정보가 필요합니다.',
          NSLocationAlwaysUsageDescription:
            '지도에서 현재 위치를 표시하고 필지 조사 시 정확한 위치 정보를 제공하기 위해 위치 정보가 필요합니다.',
          NSPhotoLibraryUsageDescription:
            '필지 조사 시 현장 사진을 업로드하기 위해 갤러리 접근이 필요합니다.',
          NSCameraUsageDescription:
            '필지 조사 시 현장 사진을 촬영하기 위해 카메라 사용이 필요합니다.',
          NSPhotoLibraryAddUsageDescription:
            '필지 조사 시 현장 사진을 업로드하기 위해 갤러리 접근이 필요합니다.',
          NSAppTransportSecurity: {
            NSAllowsArbitraryLoads: true,
          },
        },
      },
      android: {
        versionCode: androidVersionCode,
        package: 'com.mgis.agmap',
        adaptiveIcon: {
          foregroundImage: './assets/images/icon2.png',
          backgroundColor: '#ffffff',
        },
        permissions: [
          'android.permission.READ_EXTERNAL_STORAGE',
          'android.permission.WRITE_EXTERNAL_STORAGE',
          'android.permission.READ_MEDIA_IMAGES',
          'android.permission.ACCESS_FINE_LOCATION',
          'android.permission.ACCESS_COARSE_LOCATION',
        ],
      },
      web: {
        bundler: 'metro',
        output: 'static',
        favicon: './assets/images/icon2.png',
      },
      plugins: [
        'expo-router',
        [
          'expo-splash-screen',
          {
            image: './assets/images/icon2.png',
            dark: {
              image: './assets/images/icon2.png',
              backgroundColor: '#000000',
            },
            resizeMode: 'contain',
            backgroundColor: '#ffffff',
          },
        ],
        [
          'expo-image-picker',
          {
            photosPermission:
              '필지 조사 시 현장 사진을 업로드하기 위해 갤러리 접근이 필요합니다.',
            cameraPermission:
              '필지 조사 시 현장 사진을 촬영하기 위해 카메라 사용이 필요합니다.',
          },
        ],
        [
          'expo-location',
          {
            locationAlwaysAndWhenInUsePermission:
              '지도에서 현재 위치를 표시하고 필지 조사 시 정확한 위치 정보를 제공하기 위해 위치 정보가 필요합니다.',
            locationAlwaysPermission:
              '지도에서 현재 위치를 표시하고 필지 조사 시 정확한 위치 정보를 제공하기 위해 위치 정보가 필요합니다.',
            locationWhenInUsePermission:
              '지도에서 현재 위치를 표시하고 필지 조사 시 정확한 위치 정보를 제공하기 위해 위치 정보가 필요합니다.',
          },
        ],
        [
          'expo-camera',
          {
            cameraPermission:
              '필지 조사 시 현장 사진을 촬영하기 위해 카메라 사용이 필요합니다.',
          },
        ],
        'expo-font',
        [
          'expo-web-browser',
          {
            experimentalLauncherActivity: true,
          },
        ],
        [
          '@maplibre/maplibre-react-native',
          {
            locationWhenInUsePermission: '지도에서 현재 위치를 표시하기 위해 권한이 필요합니다.',
          }
        ],
        [
          'expo-build-properties',
          {
            ios: {
              useFrameworks: 'static',
            },
          },
        ],
      ],
      experiments: {
        typedRoutes: true,
      },
      extra: {
        eas: {
          projectId: '9035f032-7b82-42ff-a3c8-b301476835b0',
        },
      },
      owner: 'juyoungkim',
    },
  };
};
