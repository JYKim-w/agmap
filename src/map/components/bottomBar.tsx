import React from 'react';

import useAppTheme from '@/app/theme/theme';
import { HStack } from 'native-base';

import { Platform, StyleSheet } from 'react-native';
import BottomBarButton from './bottomBarButton';
export default function BottomBar() {
  const { colors } = useAppTheme();

  return (
    <HStack
      safeAreaBottom
      space={2}
      alignItems="center"
      style={[
        styles.fixedContainer,
        Platform.OS === 'android' ? styles.android : {},
      ]}
    >
      <BottomBarButton
        menu="search"
        text="검색"
        activeIcon="search"
        inActiveIcon="search-outline"
      />
      <BottomBarButton
        menu="inspect"
        text="조사"
        activeIcon="location"
        inActiveIcon="location-outline"
      />
      <BottomBarButton
        menu="setting"
        text="설정"
        activeIcon="settings"
        inActiveIcon="settings-outline"
      />
    </HStack>
  );
}

const styles = StyleSheet.create({
  fixedContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 16,
    paddingTop: 4,
    flexDirection: 'row',
  },
  android: {
    height: 70,
    paddingBottom: 10,
  },
});
