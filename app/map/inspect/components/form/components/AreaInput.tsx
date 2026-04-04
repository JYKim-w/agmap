import React from 'react';
import { Pressable, Text, View } from 'react-native';

import TextInput from '@/src/map/components/inputs/input';
import STYLE from '@/app/style/style';
interface AreaInputProps {
  value: number;
  remainArea?: number;
  availableArea?: number;
  onChangeText: (text: string) => void;
  onPressMeasure?: (v: any) => void;
  title?: string;
  left?: string;
  options?: {
    measure?: boolean;
    remain?: boolean;
    box?: boolean;
  };
}
export default function AreaInput({
  value,
  remainArea,
  availableArea,
  onChangeText,
  onPressMeasure,
  title = '면적',
  left,
  options = {},
}: AreaInputProps) {
  const defaultOpt = {
    measure: true,
    remain: true,
    box: true,
  };
  const opt = { ...defaultOpt, ...options };

  const isOverArea = availableArea != null && availableArea > 0 && value > availableArea;
  // 사용 가능 면적 = 전체 가용 면적 - 현재 입력값
  const totalAvailable = availableArea != null ? availableArea : remainArea;
  const displayRemain = totalAvailable ? Math.max(0, totalAvailable - value) : 0;

  const contents = (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: remainArea && opt.remain ? 12 : 0 }}>
        <TextInput
          left={left || title}
          textAlign="right"
          value={value.toString()}
          onChangeText={(text) => {
            onChangeText(text);
          }}
          keyboardType="numeric"
          right={'㎡'}
          style={[
            { flex: 1 },
            isOverArea && { borderColor: '#ef4444', borderWidth: 1.5 },
          ]}
        />
        {opt.measure ? (
          <Pressable
            onPress={onPressMeasure}
            style={{
              backgroundColor: '#0ea5e9',
              height: 52,
              paddingHorizontal: 16,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text style={{ fontWeight: '800', color: 'white' }}>측정</Text>
          </Pressable>
        ) : null}
      </View>
      {isOverArea && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff5f5',
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginBottom: remainArea && opt.remain ? 8 : 0,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#fecaca',
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#dc2626' }}>
            남은 면적({availableArea.toFixed(1)}㎡)을 초과했습니다. 면적을 수정해주세요.
          </Text>
        </View>
      )}
      {displayRemain != null && opt.remain ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f9fafb',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#f3f4f6',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#6b7280' }}>사용 가능 면적</Text>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#0ea5e9' }}>{displayRemain.toLocaleString()} ㎡</Text>
          </View>
          <Pressable
            onPress={() => {
              onChangeText((totalAvailable || 0).toString());
            }}
            style={{
              backgroundColor: '#e5e7eb',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: '#374151', fontWeight: '800', fontSize: 11 }}>모두 채우기</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
  if (opt.box) {
    return (
      <View
        style={[STYLE.box, { flex: 1, marginBottom: 16, backgroundColor: '#ffffff', borderColor: isOverArea ? '#ef4444' : 'rgba(0,0,0,0.05)', borderWidth: isOverArea ? 1.5 : 1 }]}
      >
        {contents}
      </View>
    );
  } else {
    return contents;
  }
}
