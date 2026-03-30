import { Ionicons } from '@expo/vector-icons';
import { Badge, HStack, IconButton, Text, VStack } from 'native-base';
import React from 'react';
export default function BtHeader({ onPress, fieldInfo, jimkCodeList }: { onPress: any; fieldInfo?: any; jimkCodeList?: any[] }) {
  // Find current jimk name before rendering to avoid complex inline logic
  const jimkName = jimkCodeList?.find(v => Number(v.code) === Number(fieldInfo?.rlnd_jimk_code))?.code_nm || '정보없음';

  return (
    <VStack bg="white" borderBottomWidth={1} borderColor="rgba(0,0,0,0.05)" px={2} pt={2} pb={1.5}>
      <HStack alignItems="center" space={1}>
        <IconButton
          icon={<Ionicons name="chevron-back" size={24} color="#1a1d1e" />}
          onPress={onPress}
          variant="ghost"
          _pressed={{ bg: 'coolGray.100' }}
          p={2}
        />
        <VStack flex={1}>
          {fieldInfo ? (
            <VStack space={0.5}>
              <HStack alignItems="center" space={2}>
                <Badge 
                  bg="primary.500" 
                  _text={{ color: 'white', fontWeight: '800', fontSize: '10px' }} 
                  borderRadius="md" 
                  px={1.5} 
                  py={0.5}
                >
                  {jimkName}
                </Badge>
                <Text fontSize="14px" fontWeight="800" color="coolGray.800" flex={1} numberOfLines={1}>
                  {fieldInfo?.emd_nm} {fieldInfo?.ri_nm} {fieldInfo?.jibun}
                </Text>
              </HStack>
              <HStack alignItems="center" space={1.5}>
                <Text fontSize="12px" fontWeight="700" color="primary.500">
                  {fieldInfo?.rlnd_area?.toLocaleString() || fieldInfo?.area?.toLocaleString() || '0'}㎡
                </Text>
                <Text fontSize="10px" color="coolGray.400" fontWeight="500">
                  PNU: {fieldInfo?.pnu}
                </Text>
              </HStack>
            </VStack>
          ) : (
            <Text fontSize="md" fontWeight="700" color="#1a1d1e" ml={1}>조사내용</Text>
          )}
        </VStack>
      </HStack>
    </VStack>
  );
}
