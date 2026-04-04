import useInspectInputStore from '@/store/inspectInputStore';
import STYLE from '@/app/style/style';
import { Text, View } from 'react-native';
import React from 'react';
import YesNoButtonGroup from './YesNoButtonGroup';

export default function IsFarm() {
  const { isFarm, setIsFarm, setFmlUseSitu } = useInspectInputStore();
  return (
    <View style={[STYLE.box, { marginBottom: 12, backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#6b7280', marginBottom: 8 }}>
        경작 여부
      </Text>
      <YesNoButtonGroup
        value={isFarm}
        onPress={(v) => {
          setIsFarm(v);
          setFmlUseSitu(v === 'N' ? '휴경' : null);
        }}
      />
    </View>
  );
}
