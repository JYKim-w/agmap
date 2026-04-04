import STYLE from '@/app/style/style';
import { Text, View } from 'react-native';

export default function FallowView() {
  return (
    <View
      style={[STYLE.box, { marginBottom: 10, backgroundColor: 'white', alignItems: 'center' }]}
    >
      <Text>휴경으로 입력됩니다.</Text>
    </View>
  );
}
