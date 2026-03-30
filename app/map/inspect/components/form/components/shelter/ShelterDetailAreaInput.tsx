import shelterStore from '@/store/shelterStore';
import STYLE from '@/app/style/style';
import { Box, FormControl, VStack } from 'native-base';
import AreaInput from '../AreaInput';

export default function ShelterDetailAreaInput() {
  const {
    septicArea,
    setSepticArea,
    deckArea,
    setDeckArea,
    parkingArea,
    setParkingArea,
  } = shelterStore();
  return (
    <Box style={[STYLE.box, { marginBottom: 10, backgroundColor: 'white' }]}>
      <FormControl.Label style={STYLE.label}>면적상세</FormControl.Label>
      <VStack space={2}>
        <AreaInput
          left={'정화조'}
          value={septicArea}
          options={{ measure: false, remain: false, box: false }}
          onChangeText={(v) => {
            setSepticArea(Number(v));
          }}
        />

        <AreaInput
          left={'데크'}
          value={deckArea}
          options={{ measure: false, remain: false, box: false }}
          onChangeText={(v) => {
            setDeckArea(Number(v));
          }}
        />

        <AreaInput
          left={'주차공간'}
          value={parkingArea}
          options={{ measure: false, remain: false, box: false }}
          onChangeText={(v) => {
            setParkingArea(Number(v));
          }}
        />
      </VStack>
    </Box>
  );
}
