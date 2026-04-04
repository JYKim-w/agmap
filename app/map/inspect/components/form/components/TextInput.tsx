import STYLE from '@/app/style/style';
import React from 'react';
import { Text, TextInput as RNTextInput, View } from 'react-native';
interface TextInputProps {
  value: any;
  onChangeText?: (text: string) => void;
  title?: string;
}
export default function TextInput({
  value,
  onChangeText,
  title,
}: TextInputProps) {
  return (
    <View
      style={[STYLE.box, { flex: 1, marginBottom: 10, backgroundColor: 'white' }]}
    >
      <Text style={STYLE.label}>
        {title ? title : '입력'}
      </Text>
      <View style={[STYLE.row, { flexDirection: 'row', alignItems: 'center' }]}>
        <RNTextInput
          returnKeyType="done"
          style={[STYLE.input]}
          value={value.toString()}
          onChangeText={(text) => {
            onChangeText(text);
          }}
        />
      </View>
    </View>
  );
}
