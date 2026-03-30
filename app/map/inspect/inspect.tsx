import codeStore from '@/store/codeStore';
import inspectInputStore from '@/store/inspectInputStore';
import inspectStore from '@/store/inspectStore';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { Text } from 'native-base';
import { useEffect } from 'react';
import { View } from 'react-native';
import NullView from '@/src/map/components/nullView';
import InspectFormView from './components/form/inspectFormView';
import InspectListView from './components/list/inspectListView';

export default function InspectView() {
  const fieldInfo = inspectStore((s) => s.fieldInfo);
  const isEdit = inspectStore((s) => s.isEdit);
  const setIsEdit = inspectStore((s) => s.setIsEdit);
  const fetchInspectList = inspectStore((s) => s.fetchInspectList);
  const fetchFiles = inspectStore((s) => s.fetchFiles);
  const fetchJimkCodeList = codeStore((s) => s.fetchJimkCodeList);
  const resetInput = inspectInputStore((s) => s.reset);

  useEffect(() => {
    if (fieldInfo?.pnu) {
      setIsEdit(false);
      resetInput();
      fetchInspectList(fieldInfo.pnu);
      fetchFiles(fieldInfo.pnu);
    }
    fetchJimkCodeList();
  }, [fieldInfo?.pnu]);

  return (
    <View style={{ flex: 1 }}>
      <BottomSheetView style={{ height: '100%' }}>
        {!fieldInfo ? (
          <NullView>
            <Text>선택된 조사지가 없습니다.</Text>
          </NullView>
        ) : isEdit ? (
          <InspectFormView />
        ) : (
          <InspectListView />
        )}
      </BottomSheetView>
    </View>
  );
}
