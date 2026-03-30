import Config from '@/app/js/config';
import useInspectInputStore from '@/store/inspectInputStore';
import userStore from '@/store/userStore';
import STYLE from '@/app/style/style';
import { Box, Button, FormControl, View } from 'native-base';
import React from 'react';

export default function SelectFacility() {
  const fmlUseSitu = useInspectInputStore((s) => s.fmlUseSitu);
  const setFmlUseSitu = useInspectInputStore((s) => s.setFmlUseSitu);
  const userId = userStore((s) => s.userId);
  const list =
    userId === 'admin' ? Config.facilityListAdmin : Config.facilityList;

  return (
    <View mb={4}>
      <Box style={[STYLE.box, { backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
        <FormControl.Label _text={{ fontSize: '14px', fontWeight: '700', color: 'coolGray.500', mb: 2 }}>
          설치된 시설
        </FormControl.Label>
        {list.map((row, i) => (
          <Box
            key={i}
            flexDirection="row"
            flexWrap="wrap"
            mt={i > 0 ? 2 : 0}
            pt={i > 0 ? 2 : 0}
            borderTopWidth={i > 0 ? 1 : 0}
            borderTopColor="coolGray.100"
          >
            {row.map((v, j) => {
              const isSelected = fmlUseSitu === v;
              return (
                <Button
                  key={`${i}-${j}`}
                  bg={isSelected ? 'primary.500' : 'coolGray.100'}
                  _text={{
                    color: isSelected ? 'white' : 'coolGray.700',
                    fontWeight: '600',
                    fontSize: '12px',
                  }}
                  _pressed={{
                    bg: isSelected ? 'primary.600' : 'primary.100',
                    _text: { color: isSelected ? 'white' : 'primary.700' },
                  }}
                  px={2.5}
                  py={1.5}
                  mr={1.5}
                  mb={1}
                  borderRadius="8px"
                  onPress={() => setFmlUseSitu(v)}
                  shadow={isSelected ? 1 : 0}
                >
                  {v}
                </Button>
              );
            })}
          </Box>
        ))}
      </Box>
    </View>
  );
}
