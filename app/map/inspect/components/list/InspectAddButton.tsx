import Config from '@/app/js/config';
import inspectStore from '@/store/inspectStore';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

export default function InspectAddButton() {
  const { remainArea, setIsEdit } = inspectStore();

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => {
          if (remainArea === 0) {
            Toast.show({
              type: 'error',
              text1: Config.message.error.remainArea,
            });
          } else {
            setIsEdit(true);
          }
        }}
      >
        <Text style={styles.buttonText}>+ 추가</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  button: {
    width: '100%',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#339af0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: '#e7f5ff',
  },
  buttonText: {
    color: '#339af0',
    fontSize: 14,
    fontWeight: '600',
  },
});
