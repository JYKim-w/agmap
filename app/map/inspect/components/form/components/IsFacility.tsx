import React from 'react';

import useInspectInputStore from '@/store/inspectInputStore';
import STYLE from '@/app/style/style';
import { Text, View } from 'react-native';
import YesNoButtonGroup from './YesNoButtonGroup';

export default function IsFacility() {
  const { isFacility, setIsFacility, setFmlUseSitu, reset } =
    useInspectInputStore();
  return (
    <View style={[STYLE.box, { marginBottom: 12, backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#6b7280', marginBottom: 8 }}>
        시설물 여부
      </Text>
      <YesNoButtonGroup
        value={isFacility}
        onPress={(v) => {
          reset();
          setIsFacility(v);
        }}
      />
    </View>
  );
}
