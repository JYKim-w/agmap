import { Badge, Text, VStack } from 'native-base';

interface InspectItemValueProps {
  title: string;
  value: string | number;
  width: number;
}

export default function InspectItemValue({
  title,
  value,
  width,
}: InspectItemValueProps) {
  return (
    <VStack alignItems="flex-start" style={{ width: width }}>
      <Text fontSize="10px" fontWeight="700" color="coolGray.400" mb={1}>{title}</Text>
      <Text fontSize="13px" fontWeight="600" color="coolGray.800">{value}</Text>
    </VStack>
  );
}
