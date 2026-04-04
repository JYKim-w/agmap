// Design Ref: mockup/components/form-section.html
import { StyleSheet, Text, View } from 'react-native';

export default function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.title}>{title}</Text>
      {children}
    </View>
  );
}

export function ConditionalDivider({ label }: { label: string }) {
  return (
    <View style={s.divider}>
      <View style={s.dividerLine} />
      <Text style={s.dividerText}>{label}</Text>
      <View style={s.dividerLine} />
    </View>
  );
}

const s = StyleSheet.create({
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  title: { fontSize: 17, fontWeight: '600', color: '#212529', marginBottom: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e9ecef' },
  dividerText: { fontSize: 13, color: '#adb5bd' },
});
