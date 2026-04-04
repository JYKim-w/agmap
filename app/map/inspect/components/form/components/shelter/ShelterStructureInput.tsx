import TextInput from '@/src/map/components/inputs/input';
import shelterStore from '@/store/shelterStore';
import STYLE from '@/app/style/style';
import { Text, View } from 'react-native';

export default function ShelterStructureInput() {
  const { structure, setStructure } = shelterStore();
  return (
    <View style={[STYLE.box, { marginBottom: 10, backgroundColor: 'white' }]}>
      <Text style={STYLE.label}>건축물 구조</Text>
      <View style={[STYLE.row, { flexDirection: 'row' }]}>
        <TextInput
          placeholder={'컨테이너 조립식 등'}
          value={structure}
          onChangeText={setStructure}
        />
      </View>
    </View>
  );
}
