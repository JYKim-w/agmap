// Design Ref: mockup/components/form-input.html
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  error?: string;
}

export default function FormTextInput({ label, value, onChange, placeholder, required, multiline, error }: Props) {
  return (
    <View style={s.group}>
      <Text style={s.label}>{label}{required && <Text style={s.req}> *</Text>}</Text>
      <TextInput
        style={[multiline ? s.textarea : s.input, error ? s.inputError : null]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? '내용을 입력하세요'}
        placeholderTextColor="#ced4da"
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {error && <Text style={s.error}>{error}</Text>}
    </View>
  );
}

export function FormNumberInput({ label, value, onChange, suffix, required }: {
  label: string; value: string; onChange: (v: string) => void; suffix: string; required?: boolean;
}) {
  return (
    <View style={s.group}>
      <Text style={s.label}>{label}{required && <Text style={s.req}> *</Text>}</Text>
      <View style={s.suffixRow}>
        <TextInput
          style={[s.input, s.inputSuffix]}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          textAlign="right"
          placeholderTextColor="#ced4da"
        />
        <View style={s.suffix}>
          <Text style={s.suffixText}>{suffix}</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  group: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#343a40', marginBottom: 8 },
  req: { color: '#fa5252' },
  input: { height: 48, borderWidth: 1.5, borderColor: '#dee2e6', borderRadius: 8, paddingHorizontal: 16, fontSize: 15, color: '#212529', backgroundColor: '#fff' },
  inputError: { borderColor: '#fa5252' },
  textarea: { height: 120, borderWidth: 1.5, borderColor: '#dee2e6', borderRadius: 8, padding: 12, paddingHorizontal: 16, fontSize: 15, color: '#212529', backgroundColor: '#fff' },
  error: { fontSize: 13, color: '#fa5252', marginTop: 4 },
  suffixRow: { flexDirection: 'row' },
  inputSuffix: { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  suffix: { height: 48, paddingHorizontal: 12, backgroundColor: '#f1f3f5', borderWidth: 1.5, borderLeftWidth: 0, borderColor: '#dee2e6', borderTopRightRadius: 8, borderBottomRightRadius: 8, justifyContent: 'center' },
  suffixText: { fontSize: 13, color: '#868e96' },
});
