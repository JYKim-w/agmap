import React from 'react';

import useInspectInputStore from '@/store/inspectInputStore';
import STYLE from '@/app/style/style';
import { Box, FormControl } from 'native-base';
import YesNoButtonGroup from './YesNoButtonGroup';

export default function IsFacility() {
  const { isFacility, setIsFacility, setFmlUseSitu, reset } =
    useInspectInputStore();
  return (
    <Box style={[STYLE.box, { marginBottom: 12, backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
      <FormControl.Label _text={{ fontSize: '14px', fontWeight: '700', color: 'coolGray.500', mb: 2 }}>
        시설물 여부
      </FormControl.Label>
      <YesNoButtonGroup
        value={isFacility}
        onPress={(v) => {
          reset();
          setIsFacility(v);
        }}
      />
    </Box>
  );
}
