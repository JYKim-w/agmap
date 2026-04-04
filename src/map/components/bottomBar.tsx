import React from 'react';

import useAppTheme from '@/app/theme/theme';

import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomBarButton from './bottomBarButton';
export default function BottomBar() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.fixedContainer,
        Platform.OS === 'android' ? styles.android : { paddingBottom: insets.bottom },
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
    </View>
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
