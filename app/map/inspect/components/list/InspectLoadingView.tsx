import STYLE from '@/app/style/style';
import { Box, HStack, Skeleton, VStack } from 'native-base';

export default function InspectLoadingView() {
  return (
    <Box style={{ flex: 1 }} p={1}>
      {[...Array(5)].map((_, index) => (
        <Box key={index} style={[STYLE.box]} mb={2}>
          <HStack space={1} justifyContent="space-between">
            <HStack>
              <Skeleton size="10" rounded="10" />
            </HStack>
            <VStack space={2} alignItems="center">
              <Skeleton h="4" w="70" />
              <Skeleton h="4" w="70" />
            </VStack>
            <VStack space={2} alignItems="center">
              <Skeleton h="4" w="70" />
              <Skeleton h="4" w="70" />
            </VStack>
            <VStack space={2} alignItems="center">
              <Skeleton h="4" w="70" />
              <Skeleton h="4" w="70" />
            </VStack>
            <HStack space={2}>
              <Skeleton size="10" rounded="5" />
              <Skeleton size="10" rounded="5" />
            </HStack>
          </HStack>
        </Box>
      ))}
    </Box>
  );
}
