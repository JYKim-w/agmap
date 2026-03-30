import shelterStore from '@/store/shelterStore';
import STYLE from '@/app/style/style';
import { Box, FormControl } from 'native-base';
import React from 'react';
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
      <Box style={[STYLE.box, { marginBottom: 10, backgroundColor: 'white' }]}>
        <FormControl.Label style={STYLE.label}>전기</FormControl.Label>
        <YesNoButtonGroup
          value={electricityYn}
          onPress={(v) => {
            setElectricityYn(v);
          }}
        />
      </Box>
      <Box style={[STYLE.box, { marginBottom: 10, backgroundColor: 'white' }]}>
        <FormControl.Label style={STYLE.label}>정화조</FormControl.Label>
        <YesNoButtonGroup
          value={waterSupplyYn}
          onPress={(v) => {
            setWaterSupplyYn(v);
          }}
        />
      </Box>
      <Box style={[STYLE.box, { marginBottom: 10, backgroundColor: 'white' }]}>
        <FormControl.Label style={STYLE.label}>상수도</FormControl.Label>
        <YesNoButtonGroup
          value={septicYn}
          onPress={(v) => {
            setSepticYn(v);
          }}
        />
      </Box>
      <Box style={[STYLE.box, { marginBottom: 10, backgroundColor: 'white' }]}>
        <FormControl.Label style={STYLE.label}>화장실</FormControl.Label>
        <YesNoButtonGroup
          value={otherYn}
          onPress={(v) => {
            setOtherYn(v);
          }}
        />
      </Box>
    </>
  );
}
