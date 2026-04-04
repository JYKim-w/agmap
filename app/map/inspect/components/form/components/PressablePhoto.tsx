import Config from '@/app/js/config';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

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
      style={({ pressed }) => [
        styles.imageBox,
        style,
        { padding: 0 },
        pressed && { opacity: 0.5 },
      ]}
    >
      <View style={{ flex: 1 }}>
        {loading && (
          <View
            style={{
              backgroundColor: '#e9ecef',
              height: boxSize,
              width: boxSize,
            }}
          />
        )}
        <Image
          accessibilityLabel={alt}
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
