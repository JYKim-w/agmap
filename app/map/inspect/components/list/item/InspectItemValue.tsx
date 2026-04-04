import { View, Text, StyleSheet } from 'react-native';

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
    <View style={[styles.container, { width }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: 4,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: '#343a40',
  },
});
