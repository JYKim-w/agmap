import codeStore from '@/store/codeStore';
import inspectStore from '@/store/inspectStore';
import STYLE from '@/app/style/style';
import { Text, View } from 'react-native';

export default function FieldInfo() {
  const fieldInfo = inspectStore((state) => state.fieldInfo);
  const jimkCodeList = codeStore((state) => state.jimkCodeList);
  return (
    <View style={[STYLE.view, { paddingBottom: 0 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#6b7280' }}>필지 정보</Text>
      </View>
      <View style={[STYLE.box, { marginTop: 8, backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
        <View style={{ flexDirection: 'column', gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View
              style={{
                backgroundColor: '#0ea5e9',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>
                {jimkCodeList
                  .find(v => Number(v.code) === Number(fieldInfo.rlnd_jimk_code))?.code_nm || '정보없음'}
              </Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#0ea5e9' }}>
              {fieldInfo?.rlnd_area?.toLocaleString() || fieldInfo?.area?.toLocaleString() || '0'} ㎡
            </Text>
          </View>

          <View style={{ flexDirection: 'column', gap: 4 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1f2937', letterSpacing: -0.5 }}>
              {fieldInfo?.emd_nm} {fieldInfo?.ri_nm} {fieldInfo?.jibun}
            </Text>
            <Text style={{ fontSize: 12, color: '#9ca3af', fontWeight: '500' }}>
              PNU: {fieldInfo?.pnu}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
