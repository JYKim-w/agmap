import Config from '@/app/js/config';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

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
  const [currentIndex, setCurrentIndex] = useState(index);
  const [loading, setLoading] = useState(true);

  if (!data) {
    return null;
  }
  const images: { url: string }[] = [];

  data.forEach((v) => {
    if (v.fileId) {
      images.push({ url: Config.url + 'lot/file/get?fileId=' + v.fileId });
    } else {
      images.push({ url: v.uri });
    }
  });

  const uri = images[currentIndex]?.url;

  return (
    <Modal visible={isVisible} transparent={true}>
      <View style={imgStyles.container}>
        <Pressable style={imgStyles.closeBtn} onPress={() => setIsVisible(false)}>
          <Ionicons name="close" size={28} color="white" />
        </Pressable>
        {loading && <ActivityIndicator style={StyleSheet.absoluteFill} color="white" />}
        {uri && (
          <Image
            source={{ uri }}
            style={imgStyles.image}
            resizeMode="contain"
            onLoadEnd={() => setLoading(false)}
          />
        )}
        <View style={imgStyles.footer}>
          <Pressable onPress={() => onRemove(data[currentIndex], currentIndex)}>
            <Ionicons name="trash" size={20} color="white" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const imgStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,1)', justifyContent: 'center' },
  closeBtn: { position: 'absolute', top: 50, right: 16, zIndex: 10, padding: 8 },
  image: { width: '100%', height: '80%' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16 },
});
