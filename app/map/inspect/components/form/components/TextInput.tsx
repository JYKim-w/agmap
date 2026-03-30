import STYLE from '@/app/style/style';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Box, FormControl, HStack } from 'native-base';
import React from 'react';
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
    <Box
      flex={1}
      style={[STYLE.box, { marginBottom: 10, backgroundColor: 'white' }]}
    >
      <FormControl.Label style={STYLE.label}>
        {title ? title : '입력'}
      </FormControl.Label>
      <HStack style={STYLE.row} alignItems={'center'}>
        <BottomSheetTextInput
          returnKeyType="done"
          style={[STYLE.input]}
          value={value.toString()}
          onChangeText={(text) => {
            onChangeText(text);
          }}
        />
      </HStack>
    </Box>
  );
}
