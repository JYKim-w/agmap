import Config from '@/app/js/config';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Skeleton, View } from 'native-base';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

interface PressablePhotoProps {
  data?: any;
  alt?: string;
  onPress: () => void;
  onRemove?: () => void;
  style?: any;
}

export default function PressablePhoto({
  data,
  alt = 'image alt',
  onPress,
  onRemove,
  style,
}: PressablePhotoProps) {
  const [loading, setLoading] = useState(true);
  const boxSize = style?.width || 110;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.imageBox, style, { cursor: 'pointer', padding: 0 }]}
      _pressed={{
        opacity: 0.5,
      }}
    >
      <View flex={1}>
        {loading && (
          <Skeleton
            startColor="coolGray.200"
            endColor="coolGray.300"
            height={boxSize}
            width={boxSize}
          />
        )}
        <Image
          alt={alt}
          style={styles.image}
          source={{
            uri: data.fileId
              ? Config.url + 'lot/file/get?fileId=' + data.fileId
              : data.uri,
          }}
          onLoadEnd={() => setLoading(false)}
        />
        {onRemove && (
          <Pressable onPress={onRemove} style={styles.removeButton}>
            <Ionicons name="close" weight="bold" size={16} color="white" />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageBox: {
    width: 110,
    height: 110,
    margin: 5,
    backgroundColor: 'white',
  },
  removeButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'black',
    // padding: ,
    borderRadius: 10,
  },
});
