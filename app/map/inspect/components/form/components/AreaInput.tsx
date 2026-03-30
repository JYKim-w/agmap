import { Box, Button, HStack, Text } from 'native-base';
import React from 'react';
import { View } from 'react-native';

import TextInput from '@/src/map/components/inputs/input';
import STYLE from '@/app/style/style';
interface AreaInputProps {
  value: number;
  remainArea?: number;
  availableArea?: number;
  onChangeText: (text: string) => void;
  onPressMeasure?: (v: any) => void;
  title?: string;
  left?: string;
  options?: {
    measure?: boolean;
    remain?: boolean;
    box?: boolean;
  };
}
export default function AreaInput({
  value,
  remainArea,
  availableArea,
  onChangeText,
  onPressMeasure,
  title = '면적',
  left,
  options = {},
}: AreaInputProps) {
  const defaultOpt = {
    measure: true,
    remain: true,
    box: true,
  };
  const opt = { ...defaultOpt, ...options };

  const isOverArea = availableArea != null && availableArea > 0 && value > availableArea;
  // 사용 가능 면적 = 전체 가용 면적 - 현재 입력값
  const totalAvailable = availableArea != null ? availableArea : remainArea;
  const displayRemain = totalAvailable ? Math.max(0, totalAvailable - value) : 0;

  const contents = (
    <View>
      <HStack alignItems="center" space={3} mb={remainArea && opt.remain ? 3 : 0}>
        <TextInput
          left={left || title}
          textAlign="right"
          value={value.toString()}
          onChangeText={(text) => {
            onChangeText(text);
          }}
          keyboardType="numeric"
          right={'㎡'}
          style={[
            { flex: 1 },
            isOverArea && { borderColor: '#ef4444', borderWidth: 1.5 },
          ]}
        />
        {opt.measure ? (
          <Button
            bg="primary.500"
            _text={{ fontWeight: '800', color: 'white' }}
            h="52px"
            px={4}
            borderRadius="14px"
            onPress={onPressMeasure}
            shadow={2}
          >
            측정
          </Button>
        ) : null}
      </HStack>
      {isOverArea && (
        <HStack
          alignItems="center"
          bg="red.50"
          px={3}
          py={2}
          mb={remainArea && opt.remain ? 2 : 0}
          borderRadius="10px"
          borderWidth={1}
          borderColor="red.200"
        >
          <Text fontSize="xs" fontWeight="700" color="red.600">
            남은 면적({availableArea.toFixed(1)}㎡)을 초과했습니다. 면적을 수정해주세요.
          </Text>
        </HStack>
      )}
      {displayRemain != null && opt.remain ? (
        <HStack
          alignItems="center"
          justifyContent="space-between"
          bg="coolGray.50"
          px={3}
          py={2}
          borderRadius="10px"
          borderWidth={1}
          borderColor="coolGray.100"
        >
          <HStack alignItems="center" space={1}>
            <Text fontSize="xs" fontWeight="700" color="coolGray.500">사용 가능 면적</Text>
            <Text fontSize="sm" fontWeight="800" color="primary.500">{displayRemain.toLocaleString()} ㎡</Text>
          </HStack>
          <Button
            size="xs"
            variant="solid"
            bg="coolGray.200"
            _text={{ color: 'coolGray.700', fontWeight: '800', fontSize: '11px' }}
            borderRadius="lg"
            px={3}
            onPress={() => {
              onChangeText((totalAvailable || 0).toString());
            }}
          >
            모두 채우기
          </Button>
        </HStack>
      ) : null}
    </View>
  );
  if (opt.box) {
    return (
      <Box
        flex={1}
        style={[STYLE.box, { marginBottom: 16, backgroundColor: '#ffffff', borderColor: isOverArea ? '#ef4444' : 'rgba(0,0,0,0.05)', borderWidth: isOverArea ? 1.5 : 1 }]}
      >
        {contents}
      </Box>
    );
  } else {
    return contents;
  }
}
