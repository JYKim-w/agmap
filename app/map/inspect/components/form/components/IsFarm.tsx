import useInspectInputStore from '@/store/inspectInputStore';
import STYLE from '@/app/style/style';
import { Box, FormControl } from 'native-base';
import React from 'react';
import YesNoButtonGroup from './YesNoButtonGroup';

export default function IsFarm() {
  const { isFarm, setIsFarm, setFmlUseSitu } = useInspectInputStore();
  return (
    <Box style={[STYLE.box, { marginBottom: 12, backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
      <FormControl.Label _text={{ fontSize: '14px', fontWeight: '700', color: 'coolGray.500', mb: 2 }}>
        경작 여부
      </FormControl.Label>
      <YesNoButtonGroup
        value={isFarm}
        onPress={(v) => {
          setIsFarm(v);
          setFmlUseSitu(v === 'N' ? '휴경' : null);
        }}
      />
    </Box>
  );
}
