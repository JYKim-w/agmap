import shelterStore from '@/store/shelterStore';
import STYLE from '@/app/style/style';
import React from 'react';
import { Text, View } from 'react-native';
import YesNoButtonGroup from '../YesNoButtonGroup';

export default function LivingFacilitiesInput() {
  const {
    electricityYn,
    setElectricityYn,
    waterSupplyYn,
    setWaterSupplyYn,
    septicYn,
    setSepticYn,
    otherYn,
    setOtherYn,
  } = shelterStore();
  return (
    <>
      <View style={[STYLE.box, { marginBottom: 10, backgroundColor: 'white' }]}>
        <Text style={STYLE.label}>전기</Text>
        <YesNoButtonGroup
          value={electricityYn}
          onPress={(v) => {
            setElectricityYn(v);
          }}
        />
      </View>
      <View style={[STYLE.box, { marginBottom: 10, backgroundColor: 'white' }]}>
        <Text style={STYLE.label}>정화조</Text>
        <YesNoButtonGroup
          value={waterSupplyYn}
          onPress={(v) => {
            setWaterSupplyYn(v);
          }}
        />
      </View>
      <View style={[STYLE.box, { marginBottom: 10, backgroundColor: 'white' }]}>
        <Text style={STYLE.label}>상수도</Text>
        <YesNoButtonGroup
          value={septicYn}
          onPress={(v) => {
            setSepticYn(v);
          }}
        />
      </View>
      <View style={[STYLE.box, { marginBottom: 10, backgroundColor: 'white' }]}>
        <Text style={STYLE.label}>화장실</Text>
        <YesNoButtonGroup
          value={otherYn}
          onPress={(v) => {
            setOtherYn(v);
          }}
        />
      </View>
    </>
  );
}
