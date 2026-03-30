import inspectInputStore from '@/store/inspectInputStore';
import inspectStore from '@/store/inspectStore';
import shelterStore from '@/store/shelterStore';
import { Ionicons } from '@expo/vector-icons';
import { HStack, IconButton, useTheme } from 'native-base';
import { Alert } from 'react-native';

interface InspectItemActionsProps {
  item: any;
}

export default function InspectItemActions({ item }: InspectItemActionsProps) {
  const {
    setSelectedItem,
    setIsEdit,
    fetchRemoveInspect,
    fetchInspectList,
    fetchFiles,
  } = inspectStore();
  const { fieldInfo } = inspectStore();
  const { setIsFacility, setIsFarm, setInspectInput } = inspectInputStore();
  const { fetchShelter } = shelterStore();
  const theme = useTheme();
  return (
    <HStack style={{ right: 0 }}>
      <IconButton
        variant="ghost"
        icon={<Ionicons name="create-outline" size={22} color="#339af0" />}
        _pressed={{ bg: 'coolGray.100' }}
        onPress={async () => {
          setSelectedItem(item);
          setIsEdit(true);
          if (item.fmlUseCategory === 'facility') {
            setIsFacility('Y');
            setIsFarm('N');
          } else if (item.fmlUseCategory === 'farm') {
            setIsFarm('Y');
            setIsFacility('N');
          } else if (item.fmlUseCategory === 'none') {
            setIsFacility('N');
            setIsFarm('N');
          }

          setInspectInput(item);

          if (item.fmlUseSitu === '체류형쉼터') {
            await fetchShelter(item.inspectId);
          }
        }}
      />
      <IconButton
        variant="ghost"
        icon={<Ionicons name="trash-outline" size={22} color="#ff4d4d" />}
        _pressed={{ bg: 'red.50' }}
        onPress={() => {
          Alert.alert('조사내용 삭제', '선택한 조사내역을 삭제하시겠습니까?', [
            {
              text: '취소',
              onPress: () => {},
            },
            {
              text: '삭제',
              style: 'destructive',
              onPress: async () => {
                await fetchRemoveInspect(item.inspectId);
                await fetchInspectList(fieldInfo.pnu);
                await fetchFiles(fieldInfo.pnu);
              },
            },
          ]);
        }}
      />
    </HStack>
  );
}
