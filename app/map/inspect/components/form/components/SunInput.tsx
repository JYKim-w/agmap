import useInspectInputStore from '@/store/inspectInputStore';
import STYLE from '@/app/style/style';
import { Box, Button, FormControl, HStack } from 'native-base';
import React from 'react';

export default function SunInput() {
  const { sunlgtEsbYn, setSunlgtEsbYn } = useInspectInputStore();
  return (
    <Box style={[STYLE.box, { marginBottom: 10, backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
      <FormControl.Label _text={{ fontSize: '14px', fontWeight: '700', color: 'coolGray.500', mb: 2 }}>
        태양광 설치 여부
      </FormControl.Label>
      <HStack space={3}>
        <Button
          flex={1}
          bg={sunlgtEsbYn === 'Y' ? 'primary.500' : 'coolGray.100'}
          _text={{ color: sunlgtEsbYn === 'Y' ? 'white' : 'coolGray.500', fontWeight: '800', fontSize: '14px' }}
          h="48px"
          borderRadius="12px"
          onPress={() => setSunlgtEsbYn('Y')}
          shadow={sunlgtEsbYn === 'Y' ? 2 : 0}
          _pressed={{ opacity: 0.8 }}
        >
          설치
        </Button>
        <Button
          flex={1}
          bg={sunlgtEsbYn === 'N' ? 'primary.500' : 'coolGray.100'}
          _text={{ color: sunlgtEsbYn === 'N' ? 'white' : 'coolGray.500', fontWeight: '800', fontSize: '14px' }}
          h="48px"
          borderRadius="12px"
          onPress={() => setSunlgtEsbYn('N')}
          shadow={sunlgtEsbYn === 'N' ? 2 : 0}
          _pressed={{ opacity: 0.8 }}
        >
          미설치
        </Button>
      </HStack>
    </Box>
  );
}
