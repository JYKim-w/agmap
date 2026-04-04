// Design Ref: mockup/components/form-yesno.html
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  required?: boolean;
  error?: boolean;
}

export default function FormYesNo({ label, value, onChange, required, error }: Props) {
  return (
    <View style={s.group}>
      <Text style={s.label}>{label}{required && <Text style={s.req}> *</Text>}</Text>
      <View style={s.row}>
        <Pressable
          style={[s.btn, value === true && s.btnYes, error && value === null && s.btnError]}
          onPress={() => onChange(true)}
        >
          <Text style={[s.btnText, value === true && s.btnYesText]}>예</Text>
        </Pressable>
        <Pressable
          style={[s.btn, value === false && s.btnNo, error && value === null && s.btnError]}
          onPress={() => onChange(false)}
        >
          <Text style={[s.btnText, value === false && s.btnNoText]}>아니오</Text>
        </Pressable>
      </View>
      {error && value === null && <Text style={s.errorText}>필수 항목입니다</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  group: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#343a40', marginBottom: 8 },
  req: { color: '#fa5252' },
  row: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, height: 52, borderRadius: 10, borderWidth: 1.5, borderColor: '#dee2e6', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 15, fontWeight: '600', color: '#495057' },
  btnYes: { borderColor: '#228be6', backgroundColor: '#e7f5ff' },
  btnYesText: { color: '#228be6' },
  btnNo: { borderColor: '#495057', backgroundColor: '#f1f3f5' },
  btnNoText: { color: '#495057' },
  btnError: { borderColor: '#fa5252', backgroundColor: '#fff5f5' },
  errorText: { fontSize: 13, color: '#fa5252', marginTop: 6 },
});
