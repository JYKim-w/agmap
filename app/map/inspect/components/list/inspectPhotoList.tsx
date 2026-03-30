import inspectStore from '@/store/inspectStore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PressablePhoto from '../form/components/PressablePhoto';
import InspectImageView from './InspectImageView';

interface PhotoStripProps {
  lotImages: any[];
  shelterImages: any[];
  pnu: string | undefined;
}

const PhotoStrip = memo(
  ({ lotImages, shelterImages, pnu }: PhotoStripProps) => {
    const fetchUploadImage = inspectStore((s) => s.fetchUploadImage);
    const fetchRemoveImage = inspectStore((s) => s.fetchRemoveImage);
    const fetchFiles = inspectStore((s) => s.fetchFiles);

    const [isImgVisible, setIsImgVisible] = useState(false);
    const [imgIndex, setImgIndex] = useState(0);
    const [viewerImages, setViewerImages] = useState<any[]>([]);

    const uploadImage = useCallback(
      async (uri: string) => {
        if (!pnu) return;
        await fetchUploadImage(uri, { fmlId: pnu });
        await fetchFiles(pnu);
      },
      [pnu, fetchUploadImage, fetchFiles]
    );

    const handlePickFromGallery = useCallback(async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('갤러리 접근 권한이 필요합니다.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (!result.canceled) uploadImage(result.assets[0].uri);
    }, [uploadImage]);

    const handleTakePhoto = useCallback(async () => {
      const { status } =
        await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('카메라 접근 권한이 필요합니다.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 1 });
      if (!result.canceled) uploadImage(result.assets[0].uri);
    }, [uploadImage]);

    const handleRemoveImage = useCallback(
      (data: any) => {
        Alert.alert('사진 삭제', '사진을 삭제하시겠습니까?', [
          { text: '취소' },
          {
            text: '삭제',
            style: 'destructive',
            onPress: async () => {
              await fetchRemoveImage(data.fileId);
              if (pnu) await fetchFiles(pnu);
              setImgIndex(0);
              setIsImgVisible(false);
            },
          },
        ]);
      },
      [fetchRemoveImage, fetchFiles, pnu]
    );

    const renderPhotoItem = useCallback(
      ({ item, index }: { item: any; index: number }) => (
        <PressablePhoto
          data={item}
          alt="필지 사진"
          style={styles.photoThumb}
          onPress={() => {
            setImgIndex(index);
            setViewerImages(lotImages);
            setIsImgVisible(true);
          }}
        />
      ),
      [lotImages]
    );

    const renderShelterItem = useCallback(
      ({ item, index }: { item: any; index: number }) => (
        <PressablePhoto
          data={item}
          alt="쉼터 사진"
          style={styles.photoThumb}
          onPress={() => {
            setImgIndex(index);
            setViewerImages(shelterImages);
            setIsImgVisible(true);
          }}
        />
      ),
      [shelterImages]
    );

    const totalCount = lotImages.length + shelterImages.length;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          현장 사진{'  '}
          {totalCount}장
        </Text>

        {lotImages.length > 0 && (
          <FlatList
            data={lotImages}
            renderItem={renderPhotoItem}
            keyExtractor={(item) => item.fileId}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stripContainer}
          />
        )}

        {shelterImages.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
              체류형쉼터 사진{'  '}
              {shelterImages.length}장
            </Text>
            <FlatList
              data={shelterImages}
              renderItem={renderShelterItem}
              keyExtractor={(item) => item.fileId}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.stripContainer}
            />
          </>
        )}

        {/* 사진 추가 — 갤러리/촬영 분리 */}
        <View style={styles.addCardRow}>
          <Pressable style={styles.addCard} onPress={handlePickFromGallery}>
            <Ionicons name="images-outline" size={18} color="#339af0" />
            <Text style={styles.addCardText}>앨범에서 선택</Text>
          </Pressable>
          <Pressable style={styles.addCard} onPress={handleTakePhoto}>
            <Ionicons name="camera-outline" size={18} color="#339af0" />
            <Text style={styles.addCardText}>사진 촬영</Text>
          </Pressable>
        </View>

        <InspectImageView
          isVisible={isImgVisible}
          setIsVisible={setIsImgVisible}
          index={imgIndex}
          data={viewerImages}
          onRemove={handleRemoveImage}
        />
      </View>
    );
  }
);

export default PhotoStrip;

const styles = StyleSheet.create({
  section: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#495057',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  stripContainer: {
    paddingVertical: 6,
    gap: 8,
  },
  photoThumb: {
    width: 100,
    height: 100,
    borderRadius: 8,
    margin: 0,
    overflow: 'hidden',
  },
  addCardRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  addCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#dee2e6',
    borderRadius: 12,
    backgroundColor: 'rgba(248,249,250,0.7)',
    paddingVertical: 12,
  },
  addCardText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#339af0',
  },
});
