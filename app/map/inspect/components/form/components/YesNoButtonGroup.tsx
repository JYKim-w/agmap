import STYLE from '@/app/style/style';
import { Button, HStack } from 'native-base';

export default function YesNoButtonGroup({ value, onPress }) {
  return (
    <HStack style={{ width: '100%', paddingHorizontal: 4 }} space={3}>
      <Button
        flex={1}
        bg={value === 'Y' ? 'primary.500' : 'coolGray.100'}
        _text={{ color: value === 'Y' ? 'white' : 'coolGray.500', fontWeight: '800', fontSize: '15px' }}
        h="52px"
        borderRadius="16px"
        onPress={() => onPress('Y')}
        shadow={value === 'Y' ? 3 : 0}
        _pressed={{ opacity: 0.8 }}
      >
        예
      </Button>
      <Button
        flex={1}
        bg={value === 'N' ? '#e03131' : 'coolGray.100'}
        _text={{ color: value === 'N' ? 'white' : 'coolGray.500', fontWeight: '800', fontSize: '15px' }}
        h="52px"
        borderRadius="16px"
        onPress={() => onPress('N')}
        shadow={value === 'N' ? 3 : 0}
        _pressed={{ opacity: 0.8 }}
      >
        아니오
      </Button>
    </HStack>
  );
}
