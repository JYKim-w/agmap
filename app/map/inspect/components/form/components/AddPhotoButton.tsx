import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
interface AddPhotoButtonProps {
  style?: any;
  iconsSize?: number;
  fontSize?: number;
  onSelectImage?: (uri: string) => void;
  onCancel?: () => void;
}
export default function AddPhotoButton({
  style,
  iconsSize = 20,
  fontSize = 12,
  onSelectImage,
  onCancel,
}: AddPhotoButtonProps) {
  const onAddPhotoClick = () => {
    Alert.alert('사진 추가', '사용할 사진을 골라주세요.', [
      {
        text: '사진첩',
        onPress: () => openImagePicker(),
      },
      {
        text: '카메라',
        onPress: () => handleCameraLaunch(),
      },
    ]);
  };
  const openImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      onSelectImage(result.assets[0].uri);
    } else {
      onCancel?.();
    }
  };

  const handleCameraLaunch = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('카메라 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      // allowsEditing: true,
      // aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      onSelectImage(result.assets[0].uri);
    } else {
      onCancel?.();
    }
  };

  return (
    <View style={[styles.imageBox, style]}>
      <Pressable
        onPress={onAddPhotoClick}
        style={{
          width: '100%',
          height: '100%',
          borderWidth: 1,
          borderColor: '#0ea5e9',
          borderRadius: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="camera-outline" size={iconsSize} color="black" />
          <Text style={{ fontSize: fontSize }}>사진 추가</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  imageBox: {
    width: 110,
    height: 110,
  },
});
