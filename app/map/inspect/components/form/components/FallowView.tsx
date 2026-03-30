import STYLE from '@/app/style/style';
import { Box, Text } from 'native-base';

export default function FallowView() {
  return (
    <Box
      style={[STYLE.box, { marginBottom: 10, backgroundColor: 'white' }]}
      alignItems={'center'}
    >
      <Text>휴경으로 입력됩니다.</Text>
    </Box>
  );
}
