import codeStore from '@/store/codeStore';
import inspectStore from '@/store/inspectStore';
import { View } from 'react-native';
import { useCallback } from 'react';
import BtBody from '@/src/map/components/btBody';
import InspectHeader from './InspectHeader';
import InspectListContent from './InspectListContent';

export default function InspectListView() {
  const pnu = inspectStore((s) => s.fieldInfo?.pnu);
  const fetchInspectList = inspectStore((s) => s.fetchInspectList);
  const fetchFiles = inspectStore((s) => s.fetchFiles);
  const fetchJimkCodeList = codeStore((s) => s.fetchJimkCodeList);

  const handleRefresh = useCallback(() => {
    if (pnu) {
      fetchInspectList(pnu);
      fetchFiles(pnu);
    }
    fetchJimkCodeList();
  }, [pnu, fetchInspectList, fetchFiles, fetchJimkCodeList]);

  return (
    <View style={{ flex: 1 }}>
      <InspectHeader />
      <BtBody>
        <InspectListContent onRefresh={handleRefresh} />
      </BtBody>
    </View>
  );
}
