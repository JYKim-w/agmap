import Config from '@/app/js/config';
import { Ionicons } from '@expo/vector-icons';
import { HStack, IconButton } from 'native-base';
import React from 'react';
import { ActivityIndicator, Modal } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
interface InspectImageViewProps {
  data?: any[];
  dataType?: 'file' | 'url';
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  index: number;
  onRemove: (data: any, index: number) => void;
}
export default function InspectImageView({
  data,
  isVisible,
  setIsVisible,
  index,
  onRemove,
}: InspectImageViewProps) {
  if (!data) {
    return;
  }
  const images = [];

  data.map((v) => {
    if (v.fileId) {
      images.push({ url: Config.url + 'lot/file/get?fileId=' + v.fileId });
    } else {
      images.push({ url: v.uri });
    }
  });

  return (
    <Modal visible={isVisible} transparent={true}>
      <ImageViewer
        index={index}
        imageUrls={images}
        backgroundColor={'rgba(0,0,0,1)'}
        enableSwipeDown={true}
        onSwipeDown={() => {
          setIsVisible(false);
        }}
        //TODO 삭제기능 추가
        loadingRender={() => {
          return <ActivityIndicator />;
        }}
        renderFooter={(index) => (
          <HStack
            style={{ width: '100%' }}
            flex={1}
            justifyContent="flex-end"
            safeAreaBottom
          >
            {/* <Button
              variant="outline"
              colorScheme="secondary"
              style={{ marginRight: 10, backgroundColor: 'white' }}
              onPress={() => {
                onRemove(data[index], index);
              }}
            >
              삭제
            </Button> */}
            <IconButton
              icon={<Ionicons name="trash" size={20} color="white" />}
              shadow={1}
              onPress={() => {
                onRemove(data[index], index);
              }}
            />
          </HStack>
        )}
      />
    </Modal>
  );
}
