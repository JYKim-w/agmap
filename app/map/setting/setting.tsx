import Login from '@/app/js/login';
import bottomStore from '@/store/bottomStore';
import codeStore from '@/store/codeStore';
import inspectStore from '@/store/inspectStore';
import measureStore from '@/store/measureStore';
import optionStore from '@/store/optionStore';
import searchStore from '@/store/searchStore';
import shelterStore from '@/store/shelterStore';
import userStore from '@/store/userStore';

import { router } from 'expo-router';
import {
  Button,
  HStack,
  Image,
  Text,
  View,
  VStack
} from 'native-base';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

export default function SettingView() {
  const options = optionStore((state) => state.options);

  const onLogoutPress = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        {
          text: 'OK',
          onPress: async () => {
            const result = await Login.logout();
            resetAllStore();
            router.replace('/login');
          },
        },
        { text: 'Cancel' },
      ],
      { cancelable: false, userInterfaceStyle: 'light' }
    );
  };

  const onUserDeletePress = () => {
    Alert.alert(
      '계정을 삭제 하시겠습니까?',
      '계정 삭제시 자동으로 로그아웃 됩니다.',
      [
        {
          text: 'Ok',
          onPress: async () => {
            const result = await Login.deleteUser();
            resetAllStore();
            router.replace('/login');
            Alert.alert('계정 삭제 완료', '계정 복구는 관리자에게 문의하세요.');
          },
        },
        {
          text: 'Cancel',
          onPress: () => {},
        },
      ]
    );
  };

  const resetAllStore = () => {
    codeStore.getState().reset();
    bottomStore.getState().reset();
    userStore.getState().reset();
    optionStore.getState().reset();
    inspectStore.getState().reset();
    searchStore.getState().reset();
    shelterStore.getState().reset();
    measureStore.getState().reset();
  };


  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <VStack flex={1} p={4} space={6}>
            <View>
              <Text bold fontSize="lg" mb={3}>배경지도</Text>
              <HStack space={4} justifyContent="center">
                {[
                  { id: 'base', label: '일반', image: require('../../../assets/images/map_bg_sel01.png') },
                  { id: 'satellite', label: '위성', image: require('../../../assets/images/map_bg_sel02.png') },
                  { id: 'hybrid', label: '하이브리드', image: require('../../../assets/images/map_bg_sel03.png') },
                ].map((type) => (
                  <Button
                    key={type.id}
                    variant="unstyled"
                    onPress={() => optionStore.getState().setOptions({ ...options, mapType: type.id as any })}
                    alignItems="center"
                    flex={1}
                  >
                    <VStack alignItems="center">
                      <View
                        borderRadius="xl"
                        bg="gray.100"
                        borderWidth={2}
                        borderColor={options.mapType === type.id ? 'primary.500' : 'transparent'}
                        style={{ width: '100%', aspectRatio: 1, overflow: 'hidden' }}
                        alignItems="center"
                      >
                        <Image
                          source={type.image}
                          alt={type.label}
                          width="100%"
                          height="100%"
                          resizeMode="cover"
                        />
                      </View>
                      <Text mt={1} fontSize="xs" fontWeight={options.mapType === type.id ? 'bold' : 'normal'} color={options.mapType === type.id ? 'primary.600' : 'gray.600'}>
                        {type.label}
                      </Text>
                    </VStack>
                  </Button>
                ))}
              </HStack>
            </View>

            <View>
              <Text bold fontSize="lg" mb={3}>레이어</Text>
              <HStack space={4} flexWrap="wrap" justifyContent="flex-start">
                {[
                  { id: 'jijuk', label: '연속지적도', icon: (color: string) => <JijukIcon color={color} /> },
                  { id: 'road', label: '도로경계', icon: (color: string) => <RoadIcon color={color} /> },
                  { id: 'sgg', label: '시군구경계', icon: (color: string) => <SGGBoundaryIcon color={color} /> },
                  { id: 'emd', label: '읍면동경계', icon: (color: string) => <EMDBoundaryIcon color={color} /> },
                  { id: 'ri', label: '리경계', icon: (color: string) => <RiBoundaryIcon color={color} /> },
                  { id: 'farmMap', label: '팜맵', icon: (color: string) => <FarmIcon color={color} /> },
                  { id: 'lxMap', label: 'LX맵', icon: (color: string) => <LXIcon color={color} /> },
                  { id: 'inspect25', label: '일제정비(\'25)', icon: (color: string) => <InspectIcon color={color} /> },
                  { id: 'use25', label: '이용실태(\'25)', icon: (color: string) => <UsageIcon color={color} /> },
                  { id: 'unregistered25', label: '미등재필지(\'25)', icon: (color: string) => <UnregisteredIcon color={color} /> },
                  { id: 'fieldMap25', label: '농지도(\'25)', icon: (color: string) => <FieldMapIcon color={color} /> },
                  { id: 'shelter25', label: '체류형쉼터(\'25)', icon: (color: string) => <ShelterIcon color={color} /> },
                ].map((layer) => (
                  <LayerButton
                    key={layer.id}
                    label={layer.label}
                    icon={layer.icon(options[layer.id] ? 'white' : '#666')}
                    isActive={options[layer.id]}
                    onPress={() => optionStore.getState().setOptions({ ...options, [layer.id]: !options[layer.id] })}
                  />
                ))}
              </HStack>
            </View>

            <View mt={4} pt={4} borderTopWidth={1} borderTopColor="gray.200">
              <Button
                size="md"
                width="100%"
                height={50}
                colorScheme="error"
                variant="solid"
                onPress={onLogoutPress}
                mb={2}
              >
                로그아웃
              </Button>
              {Platform.OS === 'ios' ? (
                <Button
                  size="md"
                  width="100%"
                  colorScheme="error"
                  variant="link"
                  height={50}
                  onPress={onUserDeletePress}
                >
                  회원탈퇴
                </Button>
              ) : null}
            </View>
          </VStack>
        </BottomSheetScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}


const LayerButton = ({ label, icon, isActive, onPress }: { label: string, icon: any, isActive: boolean, onPress: () => void }) => {
  return (
    <Button
      variant="unstyled"
      onPress={onPress}
      p={0}
      m={0}
      mb={4}
      width="20%"
      alignItems="center"
    >
      <VStack alignItems="center" space={1}>
        <View
          p={3}
          borderRadius="full"
          bg={isActive ? 'primary.500' : 'gray.100'}
          mb={1}
          alignItems="center"
          justifyContent="center"
          width={50}
          height={50}
        >
          {icon}
        </View>
        <Text fontSize="2xs" fontWeight={isActive ? 'bold' : 'normal'} color={isActive ? 'primary.600' : 'gray.600'} textAlign="center">
          {label}
        </Text>
      </VStack>
    </Button>
  );
};

// SVG Icons for Layers

const JijukIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M3 21L21 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M3 14H21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M3 7H21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M7 3V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M14 3V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M21 3V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M7 14L14 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
  </Svg>
);

const RoadIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M4 22L8 2" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <Path d="M20 22L16 2" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <Path d="M12 4V7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray="1 3" />
    <Path d="M12 11V14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray="1 3" />
    <Path d="M12 18V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray="1 3" />
  </Svg>
);

const SGGBoundaryIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M4 10V20H10V10H4Z" stroke={color} strokeWidth="2" />
    <Path d="M14 8V20H20V8H14Z" stroke={color} strokeWidth="2" />
    <Path d="M3 20H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M12 4V7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M7 10V4H17V8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EMDBoundaryIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M4 6H10V12H4V6Z" stroke={color} strokeWidth="1.5" />
    <Path d="M14 6H20V12H14V6Z" stroke={color} strokeWidth="1.5" />
    <Path d="M4 14H10V20H4V14Z" stroke={color} strokeWidth="1.5" />
    <Path d="M14 14H20V20H14V14Z" stroke={color} strokeWidth="1.5" />
    <Path d="M10 9H14M7 12V14M17 12V14" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
  </Svg>
);

const RiBoundaryIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M8 4C8 4 10 12 4 14" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <Path d="M16 4C16 4 14 12 20 14" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <Path d="M4 18C4 18 12 16 12 21" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <Path d="M20 18C20 18 12 16 12 21" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </Svg>
);

const FarmIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M3 6L11 4L14 10L6 12L3 6Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <Path d="M11 4L21 6L18 13L14 10" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <Path d="M6 12L14 10L16 20L8 21L6 12Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <Path d="M14 10L18 13L21 20L16 20" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
  </Svg>
);

const LXIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    {/* L */}
    <Path d="M6 7V17H11" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* X */}
    <Path d="M13 7L19 17" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <Path d="M19 7L13 17" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

const InspectIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M16 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4H8" stroke={color} strokeWidth="1.5" />
    <Path d="M12 2C10.8954 2 10 2.89543 10 4V6C10 7.10457 10.8954 8 12 8C13.1046 8 14 7.10457 14 6V4C14 2.89543 13.1046 2 12 2Z" stroke={color} strokeWidth="1.5" />
    <Path d="M7 13H17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M7 17H13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const UsageIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.5" />
    <Path d="M20 20L16 16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M8 11H14" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <Path d="M11 8V14" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
  </Svg>
);

const UnregisteredIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M4 10V4H10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M20 14V20H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 8V16M8 12H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M4 4L20 20" stroke={color} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
  </Svg>
);

const FieldMapIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M3 6L9 3L15 6L21 3V18L15 21L9 18L3 21V6Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 3V18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 6V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ShelterIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 21V15H15V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 3V5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

