import inspectInputStore from '@/store/inspectInputStore';
import inspectStore from '@/store/inspectStore';
import shelterStore from '@/store/shelterStore';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

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

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.iconButton,
          pressed && styles.pressedEdit,
        ]}
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
      >
        <Ionicons name="create-outline" size={22} color="#339af0" />
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          styles.iconButton,
          pressed && styles.pressedDelete,
        ]}
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
      >
        <Ionicons name="trash-outline" size={22} color="#ff4d4d" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    right: 0,
  },
  iconButton: {
    padding: 8,
    borderRadius: 4,
  },
  pressedEdit: {
    backgroundColor: '#f1f3f5',
  },
  pressedDelete: {
    backgroundColor: '#fff5f5',
  },
});
