import Ionicons from '@expo/vector-icons/build/Ionicons';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { HStack } from 'native-base';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

interface TextInputProps {
  value: string;
  right?: string | React.ReactNode;
  left?: string | React.ReactNode;
  placeholder?: string;
  onSubmitEditing?: () => void;
  onChangeText?: (text: string) => void;
  clearButton?: boolean;
  style?: StyleProp<ViewStyle>;
  onFocus?: () => void;
  onBlur?: () => void;
  keyboardType?: KeyboardTypeOptions;
  textAlign?: 'left' | 'right' | 'center';
}
export default function TextInput({
  value,
  right,
  left,
  placeholder,
  onSubmitEditing,
  onChangeText,
  onFocus,
  onBlur,
  clearButton = true,
  style,
  keyboardType,
  textAlign,
}: TextInputProps) {
  return (
    <HStack style={[styles.container, style]}>
      {left ? <Text style={styles.textLeft}>{left}</Text> : null}
      <BottomSheetTextInput
        style={styles.input}
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={value}
        onSubmitEditing={onSubmitEditing}
        onFocus={onFocus}
        onBlur={onBlur}
        keyboardType={keyboardType}
        textAlign={textAlign}
        returnKeyType="done"
        placeholderTextColor={'gray'}
      />
      {right ? <Text style={styles.textRight}>{right}</Text> : null}
      {clearButton && value !== '' ? (
        <Pressable onPress={() => onChangeText('')}>
          <Ionicons name="close-outline" size={20} color="black" />
        </Pressable>
      ) : null}
    </HStack>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    flex: 1,
    height: 52,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1d1e',
  },
  textRight: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#adb5bd',
  },
  textLeft: {
    marginRight: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
});
