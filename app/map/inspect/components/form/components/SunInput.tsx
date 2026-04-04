import useInspectInputStore from '@/store/inspectInputStore';
import STYLE from '@/app/style/style';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function SunInput() {
  const { sunlgtEsbYn, setSunlgtEsbYn } = useInspectInputStore();
  return (
    <View style={[STYLE.box, { marginBottom: 10, backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#6b7280', marginBottom: 8 }}>
        태양광 설치 여부
      </Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable
          onPress={() => setSunlgtEsbYn('Y')}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: sunlgtEsbYn === 'Y' ? '#0ea5e9' : '#f3f4f6',
            height: 48,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: sunlgtEsbYn === 'Y' ? '#000' : 'transparent',
            shadowOffset: { width: 0, height: sunlgtEsbYn === 'Y' ? 2 : 0 },
            shadowOpacity: sunlgtEsbYn === 'Y' ? 0.1 : 0,
            shadowRadius: sunlgtEsbYn === 'Y' ? 4 : 0,
            elevation: sunlgtEsbYn === 'Y' ? 2 : 0,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ color: sunlgtEsbYn === 'Y' ? 'white' : '#6b7280', fontWeight: '800', fontSize: 14 }}>
            설치
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSunlgtEsbYn('N')}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: sunlgtEsbYn === 'N' ? '#0ea5e9' : '#f3f4f6',
            height: 48,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: sunlgtEsbYn === 'N' ? '#000' : 'transparent',
            shadowOffset: { width: 0, height: sunlgtEsbYn === 'N' ? 2 : 0 },
            shadowOpacity: sunlgtEsbYn === 'N' ? 0.1 : 0,
            shadowRadius: sunlgtEsbYn === 'N' ? 4 : 0,
            elevation: sunlgtEsbYn === 'N' ? 2 : 0,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ color: sunlgtEsbYn === 'N' ? 'white' : '#6b7280', fontWeight: '800', fontSize: 14 }}>
            미설치
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
