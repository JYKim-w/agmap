import Config from '@/app/js/config';
import inspectStore from '@/store/inspectStore';
import { Button, HStack } from 'native-base';
import Toast from 'react-native-toast-message';

export default function InspectAddButton() {
  const { remainArea, setIsEdit } = inspectStore();

  return (
    <HStack style={{ backgroundColor: 'white' }}>
      <Button
        size="md"
        width="100%"
        colorScheme="primary"
        variant="outline"
        onPress={() => {
          if (remainArea === 0) {
            Toast.show({
              type: 'error',
              text1: Config.message.error.remainArea,
            });
          } else {
            setIsEdit(true);
          }
        }}
      >
        + 추가
      </Button>
    </HStack>
  );
}
