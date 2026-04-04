import STYLE from '@/app/style/style';
import { StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import AddPhotoButton from '../AddPhotoButton';
import PressablePhoto from '../PressablePhoto';
interface ShelterPhotoInputProps {
  title: string;
  data: any;
  onPressImage: (data: any, index: number) => void;
  onRemoveImage: (data: any, index: number) => void;
  onSelectImage?: (uri: string) => void;
}

export default function ShelterPhotoInput({
  title,
  data,
  onPressImage,
  onRemoveImage,
  onSelectImage,
}: ShelterPhotoInputProps) {
  const renderPhoto = (data) => {
    return data.map((item, index) => {
      return (
        <PressablePhoto
          key={index}
          data={item}
          onPress={() => onPressImage(item, index)}
          onRemove={() => onRemoveImage(item, index)}
        />
      );
    });
  };
  return (
    <View style={[STYLE.box, { marginBottom: 10 }]}>
      <Text style={STYLE.label}>{title}</Text>

      <View style={{ flexDirection: 'row', flex: 1 }}>
        <AddPhotoButton style={styles.imageBox} onSelectImage={onSelectImage} />

        <ScrollView horizontal>
          <View style={{ flexDirection: 'row', flex: 1 }}>{renderPhoto(data)}</View>
        </ScrollView>
      </View>
    </View>
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
});
