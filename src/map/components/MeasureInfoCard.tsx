import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Box, Text, HStack, VStack } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import useMeasureStore from '@/store/measureStore';

const MeasureInfoCard = memo(() => {
  const distanceVal = useMeasureStore((s) => s.measureDistance);
  const areaVal = useMeasureStore((s) => s.measureArea);

  return (
    <Box style={styles.container}>
      <VStack space={2}>
        <HStack alignItems="center" space={3}>
            <Box bg="rgba(51, 154, 240, 0.1)" p={1.5} borderRadius="lg">
                <Ionicons name="resize-outline" size={18} color="#339af0" />
            </Box>
            <VStack>
                <Text fontSize="xs" color="gray.500" fontWeight="bold">총 거리</Text>
                <HStack alignItems="baseline" space={1}>
                    <Text fontSize="lg" fontWeight="bold" color="gray.800">
                        {distanceVal.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </Text>
                    <Text fontSize="xs" color="gray.600">m</Text>
                </HStack>
            </VStack>
        </HStack>

        <Box h="1px" bg="gray.100" />

        <HStack alignItems="center" space={3}>
            <Box bg="rgba(51, 154, 240, 0.1)" p={1.5} borderRadius="lg">
                <Ionicons name="layers-outline" size={18} color="#339af0" />
            </Box>
            <VStack>
                <Text fontSize="xs" color="gray.500" fontWeight="bold">면적 크기</Text>
                <HStack alignItems="baseline" space={1}>
                    <Text fontSize="lg" fontWeight="bold" color="gray.800">
                        {areaVal.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </Text>
                    <Text fontSize="xs" color="gray.600">㎡</Text>
                </HStack>
            </VStack>
        </HStack>
      </VStack>
    </Box>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 20,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default MeasureInfoCard;
