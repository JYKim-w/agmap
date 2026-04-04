import BottomSheet, { useBottomSheetSpringConfigs } from '@/components/BottomSheet';

import InspectView from '@/app/map/inspect/inspect';
import SearchView from '@/app/map/search/search';
import SettingView from '@/app/map/setting/setting';
import bottomStore from '@/store/bottomStore';
import useMeasureStore from '@/store/measureStore';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function HandleBar() {
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handleBar} />
    </View>
  );
}

export default function BottomView() {
  const bottomSheetRef = useRef(null);
  const prevIndexRef = useRef(-1);
  const { isExpand, activeMenu, index, setActiveMenu, setIndex } =
    bottomStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (prevIndexRef.current !== index) {
      if (index === -1) {
        bottomSheetRef.current?.close();
      } else {
        bottomSheetRef.current?.snapToIndex(index);
      }
    }
    prevIndexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (isExpand) {
      bottomSheetRef.current?.expand();
    }
    // isExpand가 false가 되어도 현재 snap을 유지 — 제스처/버튼이 snap을 제어
  }, [isExpand]);

  // 3단계 스냅: peek(80px) → mid(45%) → full(90%)
  const snapPoints = useMemo(() => [80, '45%', '90%'], []);

  // 스프링 물리 애니메이션 — 부드러운 스냅, overshoot 방지
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 25,
    overshootClamping: true,
    restDisplacementThreshold: 0.5,
    restSpeedThreshold: 0.5,
    stiffness: 180,
    mass: 0.8,
  });

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (i: number) => {
      setIndex(i);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      if (i === -1 && !useMeasureStore.getState().isMeasuring) {
        // Reanimated 워클릿이 scroll 이벤트 처리를 완료할 때까지 unmount 지연
        closeTimerRef.current = setTimeout(() => setActiveMenu(null), 300);
      }
    },
    [setIndex, setActiveMenu]
  );

  return (
    <BottomSheet
      style={styles.sheet}
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={-1}
      topInset={Platform.OS === 'android' ? 0 : insets.top}
      bottomInset={Platform.OS === 'android' ? 70 : insets.bottom + 45}
      keyboardBehavior={'interactive'}
      keyboardBlurBehavior={'restore'}
      android_keyboardInputMode={'adjustResize'}
      enableDynamicSizing={false}
      enableOverDrag={true}
      enablePanDownToClose={true}
      overDragResistanceFactor={2.5}
      enableContentPanningGesture={true}
      enableHandlePanningGesture={true}
      animateOnMount={true}
      animationConfigs={animationConfigs}
      handleComponent={HandleBar}
      backgroundStyle={styles.background}
      onChange={handleChange}
    >
      <View style={{ flex: 1 }}>
        {activeMenu === 'search' ? <SearchView /> : null}
        {activeMenu === 'inspect' ? <InspectView /> : null}
        {activeMenu === 'setting' ? <SettingView /> : null}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 12,
  },
  background: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#ffffff',
  },
  handleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
});
