import NullView from '@/src/map/components/nullView';
import inspectStore from '@/store/inspectStore';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import InspectProgressBar from './InspectProgressBar';
import InspectCard from './inspectItem';
import PhotoStrip from './inspectPhotoList';
import UnsurveyedCard from './UnsurveyedCard';

interface InspectListContentProps {
  onRefresh: () => void;
}

type ListEntry =
  | { type: 'inspect'; item: any }
  | { type: 'unsurveyed'; item: null };

export default function InspectListContent({
  onRefresh,
}: InspectListContentProps) {
  const inspectList = inspectStore((s) => s.inspectList);
  const remainArea = inspectStore((s) => s.remainArea);
  const isLoading = inspectStore((s) => s.isLoading);
  const files = inspectStore((s) => s.files);
  const totalArea = inspectStore((s) =>
    s.fieldInfo
      ? Number(s.fieldInfo.rlnd_area) || Number(s.fieldInfo.area) || 0
      : 0
  );
  const pnu = inspectStore((s) => s.fieldInfo?.pnu);

  const usedArea = useMemo(
    () =>
      inspectList.reduce(
        (sum, item) => sum + (Number(item.ownAr) || 0),
        0
      ),
    [inspectList]
  );

  const listData = useMemo<ListEntry[]>(() => {
    const items: ListEntry[] = inspectList.map((item) => ({
      type: 'inspect',
      item,
    }));
    if (remainArea > 0) {
      items.push({ type: 'unsurveyed', item: null });
    }
    return items;
  }, [inspectList, remainArea]);

  const lotImages = useMemo(
    () => (files || []).filter((f: any) => f.fileType === null),
    [files]
  );
  const shelterImages = useMemo(
    () => (files || []).filter((f: any) => f.fileType !== null),
    [files]
  );

  const renderItem = useCallback(
    ({ item: entry }: { item: ListEntry }) => {
      if (entry.type === 'unsurveyed') {
        return (
          <UnsurveyedCard remainArea={remainArea} totalArea={totalArea} />
        );
      }
      return <InspectCard item={entry.item} totalArea={totalArea} />;
    },
    [remainArea, totalArea]
  );

  const keyExtractor = useCallback(
    (entry: ListEntry, index: number) =>
      entry.item?.inspectId || `unsurveyed-${index}`,
    []
  );

  const ListFooter = useMemo(
    () => (
      <PhotoStrip
        lotImages={lotImages}
        shelterImages={shelterImages}
        pnu={pnu}
      />
    ),
    [lotImages, shelterImages, pnu]
  );

  return (
    <View style={styles.container}>
      <InspectProgressBar
        count={inspectList.length}
        usedArea={usedArea}
        totalArea={totalArea}
      />
      <BottomSheetFlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<NullView>데이터가 없습니다.</NullView>}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
});
