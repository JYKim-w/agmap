import { StyleSheet, Text, View } from 'react-native';

interface Props {
  dueDate: string | null | undefined;
}

export default function DDayBadge({ dueDate }: Props) {
  if (!dueDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);

  const label = diff === 0 ? 'D-Day' : diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
  const color = diff < 0 ? '#fa5252' : diff <= 3 ? '#fd7e14' : '#868e96';

  return (
    <View style={[s.badge, { borderColor: color }]}>
      <Text style={[s.text, { color }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  text: { fontSize: 11, fontWeight: '700' },
});
