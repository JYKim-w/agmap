import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function BtHeader({ onPress, fieldInfo, jimkCodeList }: { onPress: any; fieldInfo?: any; jimkCodeList?: any[] }) {
  // Find current jimk name before rendering to avoid complex inline logic
  const jimkName = jimkCodeList?.find(v => Number(v.code) === Number(fieldInfo?.rlnd_jimk_code))?.code_nm || '정보없음';

  return (
    <View style={styles.outerContainer}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={onPress}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#1a1d1e" />
        </Pressable>
        <View style={{flexDirection:'column', flex: 1}}>
          {fieldInfo ? (
            <View style={{flexDirection:'column', gap: 2}}>
              <View style={{flexDirection:'row', alignItems:'center', gap: 8}}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{jimkName}</Text>
                </View>
                <Text style={styles.addressText} numberOfLines={1}>
                  {fieldInfo?.emd_nm} {fieldInfo?.ri_nm} {fieldInfo?.jibun}
                </Text>
              </View>
              <View style={{flexDirection:'row', alignItems:'center', gap: 6}}>
                <Text style={styles.areaText}>
                  {fieldInfo?.rlnd_area?.toLocaleString() || fieldInfo?.area?.toLocaleString() || '0'}㎡
                </Text>
                <Text style={styles.pnuText}>
                  PNU: {fieldInfo?.pnu}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.fallbackText}>조사내용</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flexDirection: 'column',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButton: {
    padding: 8,
  },
  badge: {
    backgroundColor: '#339af0',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 10,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#374151',
    flex: 1,
  },
  areaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#339af0',
  },
  pnuText: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '500',
  },
  fallbackText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1d1e',
    marginLeft: 4,
  },
});
