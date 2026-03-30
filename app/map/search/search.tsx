import bottomStore from '@/store/bottomStore';
import useSearchStore from '@/store/searchStore';
import BtBody from '@/src/map/components/btBody';
import TextInput from '@/src/map/components/inputs/input';
import NullView from '@/src/map/components/nullView';
import { useRefContext } from '@/app/refContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BottomSheetFlatList, TouchableOpacity as BSTouchable } from '@gorhom/bottom-sheet';
import { HStack } from 'native-base';
import { useCallback, useRef, useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import SearchItem from './components/searchItem';

/**
 * 선택된 아이템 요약 바 — 검색 입력창과 리스트 사이 고정
 * 리스트 스크롤과 완전 독립.
 */
function SelectedBar({ item, onPress }: { item: any; onPress: () => void }) {
  return (
    <BSTouchable style={styles.selectedBar} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name="location" size={16} color="#339AF0" style={{ marginRight: 8 }} />
      <Text style={styles.selectedBarName} numberOfLines={1} ellipsizeMode="tail">
        {item['place_name']}
      </Text>
      <Text style={styles.selectedBarAddr} numberOfLines={1} ellipsizeMode="tail">
        {item['road_address_name'] || item['address_name']}
      </Text>
      <Ionicons name="chevron-forward" size={16} color="#999" />
    </BSTouchable>
  );
}

export default function SearchView() {
  const [searchQuery, setSearchQuery] = useState('');
  const results = useSearchStore((s) => s.results);
  const loading = useSearchStore((s) => s.loading);
  const fetchSearchData = useSearchStore((s) => s.fetchSearchData);
  const reset = useSearchStore((s) => s.reset);
  const selectItem = useSearchStore((s) => s.selectItem);
  const selectedIndex = useSearchStore((s) => s.selectedIndex);
  const setIndex = bottomStore((s) => s.setIndex);
  const onEndReachedCalledDuringMomentum = useRef(false);
  const { setCameraState, cameraRef } = useRefContext();

  const hasSelection = selectedIndex !== null && selectedIndex < results.length;
  const selectedItem = hasSelection ? results[selectedIndex] : null;

  // MapLibre Camera는 동일 좌표 setCamera를 무시함
  // 매번 극미세 오프셋(~0.01m)을 더해 항상 새 좌표로 인식
  const flyToCoord = useCallback((lng: number, lat: number, duration = 500) => {
    const jitter = (Math.random() - 0.5) * 0.0000001;
    setCameraState({
      centerCoordinate: [lng + jitter, lat + jitter],
      zoomLevel: 18,
      animationDuration: duration,
      type: 'flyTo',
    });
  }, [setCameraState]);

  const handleItemPress = useCallback((item: any, index: number) => {
    const lat = parseFloat(item.y);
    const lng = parseFloat(item.x);
    if (isNaN(lat) || isNaN(lng)) return;

    Keyboard.dismiss();
    selectItem(index, [lng, lat]);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    setIndex(1); // mid snap (45%) — 요약 바 + 지도 동시 노출
    flyToCoord(lng, lat, 1000);
  }, [selectItem, setIndex, flyToCoord]);

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => (
    <SearchItem
      data={{ item, index }}
      isSelected={selectedIndex === index}
      onPress={() => handleItemPress(item, index)}
    />
  ), [selectedIndex, handleItemPress]);

  return (
    <View style={{ flex: 1 }}>
      {/* 검색 입력창 */}
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <HStack style={{ padding: 5 }}>
          <TextInput
            style={{ borderRadius: 30, height: 45 }}
            left={<Ionicons name="search-outline" size={20} color="black" />}
            clearButton={true}
            placeholder="주소 또는 명칭을 입력하세요"
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={() => {
              reset();
              fetchSearchData(searchQuery);
            }}
          />
        </HStack>
      </TouchableWithoutFeedback>

      {/* 선택 아이템 요약 바 (고정, 스크롤 무관) */}
      {hasSelection && selectedItem && (
        <SelectedBar
          item={selectedItem}
          onPress={() => {
            const lat = parseFloat(selectedItem.y);
            const lng = parseFloat(selectedItem.x);
            if (isNaN(lat) || isNaN(lng)) return;

            setIndex(1); // mid snap
            flyToCoord(lng, lat);
          }}
        />
      )}

      {/* 검색 결과 리스트 */}
      <View style={{ flex: 1, width: '100%' }}>
        <BtBody>
            {results.length === 0 ? (
              <NullView>검색 결과가 없습니다.</NullView>
            ) : (
              <BottomSheetFlatList
                data={results}
                contentContainerStyle={{ flexGrow: 1, paddingTop: 4 }}
                keyExtractor={(item: any, index) => 'search_' + item.id + '_' + index}
                renderItem={renderItem}
                ListHeaderComponent={
                  <Text style={styles.listHeader}>
                    검색결과 <Text style={styles.listHeaderCount}>{results.length}</Text>건
                  </Text>
                }
                onEndReached={() => {
                  if (!onEndReachedCalledDuringMomentum.current) {
                    fetchSearchData(searchQuery, true);
                    onEndReachedCalledDuringMomentum.current = true;
                  }
                }}
                onEndReachedThreshold={0.1}
                onMomentumScrollEnd={() => {
                  onEndReachedCalledDuringMomentum.current = false;
                }}
                ListFooterComponent={loading && <ActivityIndicator />}
                extraData={selectedIndex}
              />
            )}
          </BtBody>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  selectedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    marginHorizontal: 8,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#339AF0',
  },
  selectedBarName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 8,
    flexShrink: 0,
  },
  selectedBarAddr: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    marginRight: 4,
  },
  listHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  listHeaderCount: {
    fontWeight: '800',
    color: '#339AF0',
  },
});
