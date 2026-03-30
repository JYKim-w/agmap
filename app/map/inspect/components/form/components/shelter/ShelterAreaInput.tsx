import shelterStore from '@/store/shelterStore';
import STYLE from '@/app/style/style';
import { Box, FormControl, VStack } from 'native-base';
import AreaInput from '../AreaInput';

export default function ShelterAreaInput() {
  const {
    farmlandArea,
    setFarmlandArea,
    totalFloorArea,
    setTotalFloorArea,
    buildingArea,
    setBuildingArea,
  } = shelterStore();
  return (
    <Box style={[STYLE.box, { marginBottom: 10, backgroundColor: 'white' }]}>
      <FormControl.Label style={STYLE.label}>농지면적</FormControl.Label>
      <VStack space={2}>
        <AreaInput
          title={'농지면적'}
          left={'농지면적'}
          value={farmlandArea}
          options={{ measure: false, remain: false, box: false }}
          onChangeText={(v) => {
            setFarmlandArea(Number(v));
          }}
        />

        <AreaInput
          left={'연면적'}
          value={totalFloorArea}
          options={{ measure: false, remain: false, box: false }}
          onChangeText={(v) => {
            setTotalFloorArea(Number(v));
          }}
        />

        <AreaInput
          left={'건축면적'}
          title={'건축면적'}
          value={buildingArea}
          options={{ measure: false, remain: false, box: false }}
          onChangeText={(v) => {
            setBuildingArea(Number(v));
          }}
        />
      </VStack>
    </Box>
  );
}
