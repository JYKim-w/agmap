// Design Ref: §8.1 — BottomSheet (gorhom 대체)
// 네이버 지도 스타일 바텀시트
//
// 제스처 동작:
//   peek/half (not full):
//     - 콘텐츠 위로 드래그 → 시트 확장
//     - 콘텐츠 아래로 드래그 → 시트 축소/닫기
//     - 스크롤 disabled
//   full:
//     - 스크롤 정상 동작
//     - 스크롤 최상단 + 아래 드래그 → 시트 축소
//     - 그 외 → 스크롤
//   핸들: 항상 시트 드래그
//
// 구현:
//   contentPanGesture (manualActivation) + Gesture.Native (scroll)
//   scroll.requireExternalGestureToFail(pan) → pan이 판정할 때까지 scroll 대기
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewStyle,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  ScrollView as GHScrollView,
  FlatList as GHFlatList,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type WithSpringConfig,
} from 'react-native-reanimated';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BottomSheetRef {
  snapToIndex: (index: number) => void;
  snapToPosition: (position: number) => void;
  expand: () => void;
  collapse: () => void;
  close: () => void;
  forceClose: () => void;
}

export interface BottomSheetProps {
  snapPoints: (number | string)[];
  index?: number;
  onChange?: (index: number) => void;
  onClose?: () => void;
  enablePanDownToClose?: boolean;
  enableOverDrag?: boolean;
  overDragResistanceFactor?: number;
  enableContentPanningGesture?: boolean;
  enableHandlePanningGesture?: boolean;
  enableDynamicSizing?: boolean;
  animateOnMount?: boolean;
  handleComponent?: React.ComponentType<any>;
  backgroundStyle?: ViewStyle;
  style?: ViewStyle;
  animationConfigs?: WithSpringConfig;
  keyboardBehavior?: string;
  keyboardBlurBehavior?: string;
  android_keyboardInputMode?: string;
  topInset?: number;
  bottomInset?: number;
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface BottomSheetContextValue {
  scrollAtTop: Animated.SharedValue<boolean>;
  /** SheetScrollView/FlatList가 waitFor로 참조 — pan 판정까지 scroll 대기 */
  contentPanRef: React.RefObject<any>;
}

const BottomSheetContext = createContext<BottomSheetContextValue | null>(null);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DEFAULT_SPRING: WithSpringConfig = {
  damping: 25,
  stiffness: 180,
  mass: 0.8,
  overshootClamping: true,
  restDisplacementThreshold: 0.5,
  restSpeedThreshold: 0.5,
};
const CLOSE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 2000;
const HANDLE_HEIGHT = 26;
const ACTIVATION_DELTA = 5;
const SNAP_CROSS_RATIO = 0.25;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveSnapPoints(
  snapPoints: (number | string)[],
  containerHeight: number,
): number[] {
  return snapPoints.map((sp) => {
    if (typeof sp === 'number') return sp;
    const pct = parseFloat(sp) / 100;
    return Math.round(containerHeight * pct);
  });
}

function resolveTargetSnap(
  currentHeight: number,
  startIdx: number,
  resolved: number[],
): number {
  'worklet';
  if (startIdx < 0) startIdx = 0;
  if (startIdx >= resolved.length) startIdx = resolved.length - 1;

  const startHeight = resolved[startIdx];
  const delta = currentHeight - startHeight;

  if (delta > 0 && startIdx < resolved.length - 1) {
    const gap = resolved[startIdx + 1] - startHeight;
    if (delta > gap * SNAP_CROSS_RATIO) return startIdx + 1;
  } else if (delta < 0 && startIdx > 0) {
    const gap = startHeight - resolved[startIdx - 1];
    if (-delta > gap * SNAP_CROSS_RATIO) return startIdx - 1;
  }

  return startIdx;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const BottomSheet = React.forwardRef(
  (props: BottomSheetProps, ref: React.Ref<BottomSheetRef>) => {
    const {
      snapPoints,
      index: initialIndex = 0,
      onChange,
      onClose,
      enablePanDownToClose = false,
      enableOverDrag = true,
      overDragResistanceFactor = 2.5,
      handleComponent: HandleComponent,
      backgroundStyle,
      style,
      animationConfigs,
      topInset = 0,
      bottomInset = 0,
      children,
    } = props;

    const springConfig = animationConfigs ?? DEFAULT_SPRING;

    const sheetHeight = useSharedValue(0);
    const containerHeight = useSharedValue(SCREEN_HEIGHT - topInset - bottomInset);
    const currentIndex = useSharedValue(initialIndex);
    const gestureStartY = useSharedValue(0);
    const isFullSnap = useSharedValue(false);
    const scrollAtTop = useSharedValue(true);
    const touchStartAbsY = useSharedValue(0);
    const contentGestureActivated = useSharedValue(false);
    const contentPanRef = React.useRef(null);

    const resolvedSnaps = useMemo(
      () => resolveSnapPoints(snapPoints, containerHeight.value),
      [snapPoints, containerHeight.value],
    );

    const maxSnapIdx = resolvedSnaps.length - 1;
    const contentHeight = resolvedSnaps[maxSnapIdx] - HANDLE_HEIGHT - bottomInset;

    const notifyChange = useCallback(
      (idx: number) => {
        onChange?.(idx);
        if (idx === -1) onClose?.();
      },
      [onChange, onClose],
    );

    // -----------------------------------------------------------------------
    // Imperative API
    // -----------------------------------------------------------------------

    useImperativeHandle(ref, () => ({
      snapToIndex: (idx: number) => {
        if (idx < 0 || idx >= resolvedSnaps.length) return;
        sheetHeight.value = withSpring(resolvedSnaps[idx], springConfig);
        currentIndex.value = idx;
        isFullSnap.value = idx === maxSnapIdx;
        notifyChange(idx);
      },
      snapToPosition: (pos: number) => {
        sheetHeight.value = withSpring(pos, springConfig);
      },
      expand: () => {
        sheetHeight.value = withSpring(resolvedSnaps[maxSnapIdx], springConfig);
        currentIndex.value = maxSnapIdx;
        isFullSnap.value = true;
        notifyChange(maxSnapIdx);
      },
      collapse: () => {
        sheetHeight.value = withSpring(resolvedSnaps[0], springConfig);
        currentIndex.value = 0;
        isFullSnap.value = false;
        notifyChange(0);
      },
      close: () => {
        sheetHeight.value = withSpring(0, springConfig);
        currentIndex.value = -1;
        isFullSnap.value = false;
        notifyChange(-1);
      },
      forceClose: () => {
        sheetHeight.value = withSpring(0, springConfig);
        currentIndex.value = -1;
        isFullSnap.value = false;
        notifyChange(-1);
      },
    }));

    // -----------------------------------------------------------------------
    // Initial position
    // -----------------------------------------------------------------------

    useEffect(() => {
      if (initialIndex >= 0 && initialIndex < resolvedSnaps.length) {
        sheetHeight.value = withSpring(resolvedSnaps[initialIndex], springConfig);
        isFullSnap.value = initialIndex === maxSnapIdx;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // -----------------------------------------------------------------------
    // Pan logic (worklet)
    // -----------------------------------------------------------------------

    const panUpdate = (translationY: number) => {
      'worklet';
      let newHeight = gestureStartY.value - translationY;
      const maxHeight = resolvedSnaps[maxSnapIdx];

      if (enableOverDrag) {
        if (newHeight > maxHeight) {
          newHeight = maxHeight + (newHeight - maxHeight) / overDragResistanceFactor;
        }
        if (newHeight < 0) {
          newHeight = -(0 - newHeight) / overDragResistanceFactor;
        }
      } else {
        newHeight = Math.max(0, Math.min(maxHeight, newHeight));
      }

      sheetHeight.value = newHeight;
    };

    const panEnd = (velocityY: number) => {
      'worklet';
      const velocity = -velocityY;
      const current = sheetHeight.value;

      if (enablePanDownToClose && current < resolvedSnaps[0] - CLOSE_THRESHOLD) {
        sheetHeight.value = withSpring(0, springConfig);
        currentIndex.value = -1;
        isFullSnap.value = false;
        runOnJS(notifyChange)(-1);
        return;
      }

      const startIdx = currentIndex.value >= 0 ? currentIndex.value : 0;
      let targetIdx = resolveTargetSnap(current, startIdx, resolvedSnaps);

      if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
        if (velocity > 0 && startIdx < maxSnapIdx) {
          targetIdx = startIdx + 1;
        } else if (velocity < 0) {
          if (startIdx > 0) {
            targetIdx = startIdx - 1;
          } else if (enablePanDownToClose) {
            sheetHeight.value = withSpring(0, springConfig);
            currentIndex.value = -1;
            isFullSnap.value = false;
            runOnJS(notifyChange)(-1);
            return;
          }
        }
      }

      sheetHeight.value = withSpring(resolvedSnaps[targetIdx], springConfig);
      currentIndex.value = targetIdx;
      isFullSnap.value = targetIdx === maxSnapIdx;
      runOnJS(notifyChange)(targetIdx);
    };

    // -----------------------------------------------------------------------
    // Handle pan gesture
    // -----------------------------------------------------------------------

    const handlePanGesture = Gesture.Pan()
      .activeOffsetY([-12, 12])
      .onStart(() => {
        'worklet';
        gestureStartY.value = sheetHeight.value;
      })
      .onUpdate((e) => {
        'worklet';
        panUpdate(e.translationY);
      })
      .onEnd((e) => {
        'worklet';
        panEnd(e.velocityY);
      });

    // -----------------------------------------------------------------------
    // Content pan gesture (manualActivation)
    // -----------------------------------------------------------------------
    // scroll의 requireExternalGestureToFail이 이 gesture를 참조.
    // → 이 gesture가 판정(activate/fail)할 때까지 scroll 대기.
    //
    // not full → 모든 방향 activate → 시트 이동
    // full + scrollTop + 아래 → activate → 시트 축소
    // full + 그 외 → fail → scroll 동작

    const contentPanGesture = Gesture.Pan()
      .withRef(contentPanRef)
      .manualActivation(true)
      .onTouchesDown((e) => {
        'worklet';
        if (e.numberOfTouches === 1) {
          touchStartAbsY.value = e.allTouches[0].absoluteY;
          contentGestureActivated.value = false;
        }
      })
      .onTouchesMove((e, mgr) => {
        'worklet';
        if (contentGestureActivated.value) return;
        if (e.numberOfTouches !== 1) return;
        const dy = e.allTouches[0].absoluteY - touchStartAbsY.value;

        if (!isFullSnap.value) {
          if (Math.abs(dy) > ACTIVATION_DELTA) {
            gestureStartY.value = sheetHeight.value;
            contentGestureActivated.value = true;
            mgr.activate();
          }
        } else if (scrollAtTop.value && dy > ACTIVATION_DELTA) {
          gestureStartY.value = sheetHeight.value;
          contentGestureActivated.value = true;
          mgr.activate();
        } else if (Math.abs(dy) > ACTIVATION_DELTA) {
          mgr.fail();
        }
      })
      .onUpdate((e) => {
        'worklet';
        panUpdate(e.translationY);
      })
      .onEnd((e) => {
        'worklet';
        panEnd(e.velocityY);
      });

    // -----------------------------------------------------------------------
    // Animated styles
    // -----------------------------------------------------------------------

    const animatedSheetStyle = useAnimatedStyle(() => {
      const h = Math.max(0, sheetHeight.value);
      return {
        height: h,
        opacity: h < 1 ? 0 : 1,
        pointerEvents: h < 1 ? 'none' : 'auto',
      };
    });

    // -----------------------------------------------------------------------
    // Context
    // -----------------------------------------------------------------------

    const ctxValue = useMemo(
      () => ({ scrollAtTop, contentPanRef }),
      [scrollAtTop, contentPanRef],
    );

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
      <BottomSheetContext.Provider value={ctxValue}>
        <Animated.View
          style={[styles.container, style, backgroundStyle, animatedSheetStyle]}
        >
          {/* 핸들 — 항상 드래그 */}
          <GestureDetector gesture={handlePanGesture}>
            <View style={styles.handleArea}>
              {HandleComponent ? <HandleComponent /> : <DefaultHandle />}
            </View>
          </GestureDetector>

          {/* 콘텐츠 — contentPanGesture로 감싸서 scroll과 연동 */}
          <GestureDetector gesture={contentPanGesture}>
            <View style={{ height: contentHeight, flex: 1 }}>
              {children}
            </View>
          </GestureDetector>
        </Animated.View>
      </BottomSheetContext.Provider>
    );
  },
);

BottomSheet.displayName = 'BottomSheet';
export default BottomSheet;

// ---------------------------------------------------------------------------
// Default handle
// ---------------------------------------------------------------------------

function DefaultHandle() {
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handleBar} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Scroll sub-components
// ---------------------------------------------------------------------------
// RNGH의 ScrollView/FlatList 사용 + requireExternalGestureToFail
// → contentPanGesture가 판정할 때까지 scroll 대기
// → pan activate → scroll 취소 (시트 이동)
// → pan fail → scroll 동작

const SheetScrollView = React.forwardRef<any, any>((props, ref) => {
  const { onScroll: userOnScroll, scrollEventThrottle, ...rest } = props;
  const ctx = useContext(BottomSheetContext);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      userOnScroll?.(e);
      if (ctx) {
        const y = e.nativeEvent.contentOffset.y;
        ctx.scrollAtTop.value = y <= 1;
      }
    },
    [ctx, userOnScroll],
  );

  return (
    <GHScrollView
      ref={ref}
      {...rest}
      waitFor={ctx?.contentPanRef}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle ?? 16}
      bounces={false}
      overScrollMode="never"
    />
  );
});
SheetScrollView.displayName = 'SheetScrollView';

const SheetFlatList = React.forwardRef<any, any>((props, ref) => {
  const { onScroll: userOnScroll, scrollEventThrottle, ...rest } = props;
  const ctx = useContext(BottomSheetContext);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      userOnScroll?.(e);
      if (ctx) {
        const y = e.nativeEvent.contentOffset.y;
        ctx.scrollAtTop.value = y <= 1;
      }
    },
    [ctx, userOnScroll],
  );

  return (
    <GHFlatList
      ref={ref}
      {...rest}
      waitFor={ctx?.contentPanRef}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle ?? 16}
      bounces={false}
      overScrollMode="never"
    />
  );
}) as any;
SheetFlatList.displayName = 'SheetFlatList';

// ---------------------------------------------------------------------------
// Exports (gorhom API 호환)
// ---------------------------------------------------------------------------

export const BottomSheetView = View;
export const BottomSheetFlatList = SheetFlatList;
export const BottomSheetScrollView = SheetScrollView;
export const BottomSheetTextInput = TextInput;

export const BottomSheetModalProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export function useBottomSheetSpringConfigs(config: WithSpringConfig): WithSpringConfig {
  return config;
}

export { TouchableOpacity };

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  handleArea: {
    zIndex: 1,
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
