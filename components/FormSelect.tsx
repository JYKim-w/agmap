// Design Ref: mockup/components/form-select.html
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  label: string;
  items: { value: string; label: string }[];
  value: string | null;
  onChange: (v: string) => void;
  required?: boolean;
  columns?: 2 | 3;
  error?: boolean;
}

export default function FormSelect({ label, items, value, onChange, required, columns, error }: Props) {
  const cols = columns ?? (items.length <= 3 ? 3 : 2);
  return (
    <View style={s.group}>
      <Text style={s.label}>{label}{required && <Text style={s.req}> *</Text>}</Text>
      <View style={s.grid}>
        {items.map((item) => (
          <Pressable
            key={item.value}
            style={[s.btn, { width: cols === 3 ? '31%' : '48%' }, value === item.value && s.btnSelected]}
            onPress={() => onChange(item.value)}
          >
            <Text style={[s.btnText, value === item.value && s.btnTextSelected]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      {error && !value && <Text style={s.errorText}>필수 항목입니다</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  group: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#343a40', marginBottom: 8 },
  req: { color: '#fa5252' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btn: {
    height: 48, borderWidth: 1.5, borderColor: '#dee2e6', borderRadius: 10,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  btnSelected: { borderColor: '#228be6', backgroundColor: '#e7f5ff' },
  btnText: { fontSize: 14, fontWeight: '600', color: '#495057' },
  btnTextSelected: { color: '#228be6' },
  errorText: { fontSize: 13, color: '#fa5252', marginTop: 6 },
});

