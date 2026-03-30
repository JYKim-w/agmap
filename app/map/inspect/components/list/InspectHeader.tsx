import { useRefContext } from '@/app/refContext';
import bottomStore from '@/store/bottomStore';
import codeStore from '@/store/codeStore';
import inspectStore from '@/store/inspectStore';
import { Text } from 'native-base';
import { Keyboard } from 'react-native';
import BtHeader from '@/src/map/components/btHeader';

export default function InspectHeader() {
  const { clearSelection } = useRefContext();
  const { setActiveMenu, setIndex } = bottomStore();
  const fieldInfo = inspectStore((state) => state.fieldInfo);
  const jimkCodeList = codeStore((state) => state.jimkCodeList);

  return (
    <BtHeader
      fieldInfo={fieldInfo}
      jimkCodeList={jimkCodeList}
      onPress={() => {
        clearSelection();
        Keyboard.dismiss();
        setActiveMenu(null);
        setIndex(-1);
      }}
    />
  );
}
