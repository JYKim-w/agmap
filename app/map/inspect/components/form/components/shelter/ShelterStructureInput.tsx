import TextInput from '@/src/map/components/inputs/input';
import shelterStore from '@/store/shelterStore';
import STYLE from '@/app/style/style';
import { Box, FormControl, HStack } from 'native-base';

export default function ShelterStructureInput() {
  const { structure, setStructure } = shelterStore();
  return (
    <Box style={[STYLE.box, { marginBottom: 10, backgroundColor: 'white' }]}>
      <FormControl.Label style={STYLE.label}>건축물 구조</FormControl.Label>
      <HStack style={STYLE.row}>
        <TextInput
          placeholder={'컨테이너 조립식 등'}
          value={structure}
          onChangeText={setStructure}
        />
      </HStack>
    </Box>
  );
}
