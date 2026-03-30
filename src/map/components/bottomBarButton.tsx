import bottomStore from '@/store/bottomStore';
import inspectStore from '@/store/inspectStore';
import useAppTheme from '@/app/theme/theme';
import { Pressable, StyleSheet, Text as RNText, View as RNView } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Toast from 'react-native-toast-message';
import { Center, Text } from 'native-base';

export default function BottomBarButton({
  menu,
  text,
  activeIcon,
  inActiveIcon,
}) {
  const KEY = menu;
  const btStore = bottomStore();
  const { colors } = useAppTheme();
  const { fieldInfo } = inspectStore();
  const onPress = () => {
    if (btStore.activeMenu === KEY) {
      // 같은 메뉴 반복 탭: peek(0) → mid(1) → full(2) → close(-1)
      let i = btStore.index + 1;
      if (i > 2) {
        btStore.setActiveMenu(null);
        btStore.setIndex(-1);
        return;
      }
      btStore.setIndex(i);
    } else {
      if (KEY === 'inspect' && !fieldInfo) {
        Toast.show({
          text1: '선택된 조사 대상지가 없습니다.',
          type: 'error',
        });
        btStore.setActiveMenu(null);
        btStore.setIndex(-1);
        return;
      }

      btStore.setActiveMenu(menu);
      // 새 메뉴 열 때 mid(1)에서 시작
      btStore.setIndex(1);
    }
  };
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Center>
        <NavIcon menu={menu} isActive={btStore.activeMenu === KEY} />
        <Text 
          color={btStore.activeMenu === KEY ? '#339af0' : '#8e8e93'} 
          fontSize="11px" 
          fontWeight={btStore.activeMenu === KEY ? '700' : '500'}
          mt={1}
        >
          {text}
        </Text>
      </Center>
    </Pressable>
  );
}
const NavIcon = ({ menu, isActive }: { menu: string; isActive: boolean }) => {
  const color = isActive ? '#339af0' : '#8e8e93';
  
  if (menu === 'search') {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2.5" />
        <Path d="M20 20L16 16" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </Svg>
    );
  }
  
  if (menu === 'inspect') {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path 
          d="M12 2C8.13401 2 5 5.13401 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13401 15.866 2 12 2Z" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinejoin="round" 
        />
        <Circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth="2" />
        <Path d="M10 21H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      </Svg>
    );
  }
  
  if (menu === 'setting') {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path 
          d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" 
          stroke={color} 
          strokeWidth="2" 
        />
        <Path 
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinejoin="round" 
        />
      </Svg>
    );
  }
  
  return null;
};
