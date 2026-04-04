// Design Ref: mockup/components/validation-modal.html
import type { ValidationWarning } from '@/lib/survey/validation';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  visible: boolean;
  warnings: ValidationWarning[];
  onCancel: () => void;
  onSubmit: () => void;
}

export default function ValidationModal({ visible, warnings, onCancel, onSubmit }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.overlay}>
        <View style={s.modal}>
          <Text style={s.header}>제출 전 확인</Text>

          <View style={s.body}>
            {warnings.map((w, i) => (
              <View key={i} style={s.item}>
                <Text style={s.icon}>⚠</Text>
                <View style={s.textWrap}>
                  <Text style={s.label}>
                    {w.type === 'required' ? '필수항목' :
                     w.type === 'photo' ? '사진 부족' :
                     w.type === 'gps' ? 'GPS 거리 경고' :
                     w.type === 'time' ? '소요시간 경고' : '논리 검증'}
                  </Text>
                  <Text style={s.message}>{w.message}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={s.hint}>경고 무시 시 검수 관리자에게 표시됩니다.</Text>

          <View style={s.footer}>
            <Pressable style={s.footerBtn} onPress={onCancel}>
              <Text style={s.cancelText}>돌아가서 수정</Text>
            </Pressable>
            <View style={s.divider} />
            <Pressable style={s.footerBtn} onPress={onSubmit}>
              <Text style={s.submitText}>무시하고 제출</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modal: { backgroundColor: '#fff', borderRadius: 12, width: '100%', overflow: 'hidden' },
  header: { fontSize: 17, fontWeight: '700', padding: 24, paddingBottom: 8, color: '#212529' },
  body: { paddingHorizontal: 24, paddingBottom: 16 },
  item: { flexDirection: 'row', gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  icon: { fontSize: 16, color: '#fd7e14', marginTop: 1 },
  textWrap: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', color: '#212529' },
  message: { fontSize: 14, color: '#495057', marginTop: 2 },
  hint: { fontSize: 12, color: '#adb5bd', paddingHorizontal: 24, paddingBottom: 16 },
  footer: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e9ecef' },
  footerBtn: { flex: 1, height: 52, alignItems: 'center', justifyContent: 'center' },
  divider: { width: 1, backgroundColor: '#e9ecef' },
  cancelText: { fontSize: 15, fontWeight: '600', color: '#868e96' },
  submitText: { fontSize: 15, fontWeight: '600', color: '#228be6' },
});
