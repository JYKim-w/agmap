import useInspectInputStore from '@/store/inspectInputStore';
import STYLE from '@/app/style/style';
import { Box, Button, FormControl, View } from 'native-base';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';

export default function SelectFarm() {
  const { fmlUseSitu, setFmlUseSitu } = useInspectInputStore();
  const farmList = [['농작물경작', '다년생식물재배']];
  const result = farmList.flatMap((row, i) => {
    return row.map((v, j) => {
      const isSelected = fmlUseSitu === v;
      return (
        <Button
          key={`${i}-${j}`}
          bg={isSelected ? 'primary.500' : 'coolGray.100'}
          _text={{ 
            color: isSelected ? 'white' : 'coolGray.700', 
            fontWeight: '700', 
            fontSize: '13px' 
          }}
          px={4}
          py={3}
          m={1}
          borderRadius="12px"
          onPress={() => setFmlUseSitu(v)}
          shadow={isSelected ? 2 : 0}
          _pressed={{ opacity: 0.8 }}
        >
          {v}
        </Button>
      );
    });
  });

  return (
    <View mb={4}>
      <Box style={[STYLE.box, { backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
        <FormControl.Label _text={{ fontSize: '14px', fontWeight: '700', color: 'coolGray.500', mb: 2 }}>
          재배 종류
        </FormControl.Label>
        <Box flexDirection="row" flexWrap="wrap">
          {result}
        </Box>
      </Box>
    </View>
  );
}
