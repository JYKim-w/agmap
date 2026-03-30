import React, { memo } from 'react';
import { View as RNView } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

export const CompassButton = memo(({ bearing }: { bearing: number }) => {
  return (
    <RNView style={{ transform: [{ rotate: `${-bearing}deg` }] }}>
      <Svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <Path d="M15 3L11 15H19L15 3Z" fill="#ff4d4d" />
        <Path d="M15 27L19 15H11L15 27Z" fill="#cccccc" />
        <Circle cx="15" cy="15" r="1.5" fill="white" />
      </Svg>
    </RNView>
  );
});

export const LayersIcon = memo(() => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L4 7L12 12L20 7L12 2Z"
        fill="#339af0"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <Path
        d="M4 12L12 17L20 12"
        stroke="#339af0"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Path
        d="M4 17L12 22L20 17"
        stroke="#339af0"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </Svg>
  );
});

export const UserLocationIcon = memo(
  ({ heading = 0, mode }: { heading?: number; mode: string }) => {
    const primaryColor = '#339af0';
    return (
      <RNView
        style={{
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width="44" height="44" viewBox="0 0 44 44">
          {/* Heading Fan (Sector) - Only visible in compass mode, fixed upward */}
          {mode === 'compass' && (
            <Path
              d="M22 22 L6 -10 A32 32 0 0 1 38 -10 L22 22 Z"
              fill={primaryColor}
              opacity={0.25}
            />
          )}
          {/* Rotation container for heading elements */}
          <G transform={`rotate(${heading}, 22, 22)`}>
            {/* Small Arrow Tip - Only visible when NOT in compass mode */}
            {mode !== 'compass' && (
              <Path
                d="M22 4 L16 14 L22 12 L28 14 Z"
                fill={primaryColor}
                stroke="white"
                strokeWidth="1"
              />
            )}
          </G>

          {/* Static Center Dot (White outer, Blue inner) */}
          {/* Outer White circle */}
          <Circle cx="22" cy="22" r="7" fill="white" />
          {/* Inner Blue circle */}
          <Circle cx="22" cy="22" r="5" fill={primaryColor} />
          {/* Subtle border to make it pop */}
          <Circle
            cx="22"
            cy="22"
            r="7"
            fill="transparent"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="0.5"
          />
        </Svg>
      </RNView>
    );
  }
);

export const LocationIcon = memo(
  ({ mode }: { mode: 'off' | 'normal' | 'compass' }) => {
    const primaryColor = '#339af0';
    const iconColor = mode === 'off' ? '#adb5bd' : primaryColor;

    if (mode === 'compass') {
      return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={primaryColor} strokeWidth="2" />
          <Path d="M12 7L10 12L12 17L14 12L12 7Z" fill={primaryColor} />
          <Path
            d="M12 2V5M12 19V22M2 12H5M19 12H22"
            stroke={primaryColor}
            strokeWidth="1"
          />
        </Svg>
      );
    }

    // Off & Normal modes use crosshair style matching Naver Map stages
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="8" stroke={iconColor} strokeWidth="2" />
        <Path
          d="M12 2V6M12 18V22M2 12H6M18 12H22"
          stroke={iconColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {mode === 'normal' && <Circle cx="12" cy="12" r="3" fill={primaryColor} />}
      </Svg>
    );
  }
);
