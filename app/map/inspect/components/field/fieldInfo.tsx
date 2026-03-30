import codeStore from '@/store/codeStore';
import inspectStore from '@/store/inspectStore';
import STYLE from '@/app/style/style';
import { Badge, Box, HStack, Spacer, Text, View, VStack } from 'native-base';

export default function FieldInfo() {
  const fieldInfo = inspectStore((state) => state.fieldInfo);
  const jimkCodeList = codeStore((state) => state.jimkCodeList);
  return (
    <View style={[STYLE.view, { paddingBottom: 0 }]}>
      <HStack alignItems="center" px={1}>
        <Text fontSize="sm" fontWeight="700" color="coolGray.500">필지 정보</Text>
      </HStack>
      <Box style={[STYLE.box, { marginTop: 8, backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.05)', borderWidth: 1 }]} shadow={2}>
        <VStack space={2}>
          <HStack alignItems="center" justifyContent="space-between">
            <Badge 
              bg="primary.500" 
              _text={{ color: 'white', fontWeight: '800' }} 
              borderRadius="lg" 
              px={3} 
              py={1}
            >
              {jimkCodeList
                .find(v => Number(v.code) === Number(fieldInfo.rlnd_jimk_code))?.code_nm || '정보없음'}
            </Badge>
            <Text fontSize="md" fontWeight="800" color="primary.500">
              {fieldInfo?.rlnd_area?.toLocaleString() || fieldInfo?.area?.toLocaleString() || '0'} ㎡
            </Text>
          </HStack>
          
          <VStack space={1}>
            <Text fontSize="lg" fontWeight="800" color="coolGray.800" letterSpacing="-0.5">
              {fieldInfo?.emd_nm} {fieldInfo?.ri_nm} {fieldInfo?.jibun}
            </Text>
            <Text fontSize="xs" color="coolGray.400" fontWeight="500">
              PNU: {fieldInfo?.pnu}
            </Text>
          </VStack>
        </VStack>
      </Box>
    </View>
  );
}
