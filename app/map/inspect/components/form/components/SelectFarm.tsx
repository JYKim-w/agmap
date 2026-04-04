import useInspectInputStore from '@/store/inspectInputStore';
import STYLE from '@/app/style/style';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function SelectFarm() {
  const { fmlUseSitu, setFmlUseSitu } = useInspectInputStore();
  const farmList = [['농작물경작', '다년생식물재배']];
  const result = farmList.flatMap((row, i) => {
    return row.map((v, j) => {
      const isSelected = fmlUseSitu === v;
      return (
        <Pressable
          key={`${i}-${j}`}
          onPress={() => setFmlUseSitu(v)}
          style={({ pressed }) => ({
            backgroundColor: isSelected ? '#0ea5e9' : '#f3f4f6',
            paddingHorizontal: 16,
            paddingVertical: 12,
            margin: 4,
            borderRadius: 12,
            shadowColor: isSelected ? '#000' : 'transparent',
            shadowOffset: { width: 0, height: isSelected ? 2 : 0 },
            shadowOpacity: isSelected ? 0.1 : 0,
            shadowRadius: isSelected ? 4 : 0,
            elevation: isSelected ? 2 : 0,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text
            style={{
              color: isSelected ? 'white' : '#374151',
              fontWeight: '700',
              fontSize: 13,
            }}
          >
            {v}
          </Text>
        </Pressable>
      );
    });
  });

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={[STYLE.box, { backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#6b7280', marginBottom: 8 }}>
          재배 종류
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {result}
        </View>
      </View>
    </View>
  );
}
