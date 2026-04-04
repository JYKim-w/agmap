import Config from '@/app/js/config';
import useInspectInputStore from '@/store/inspectInputStore';
import userStore from '@/store/userStore';
import STYLE from '@/app/style/style';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function SelectFacility() {
  const fmlUseSitu = useInspectInputStore((s) => s.fmlUseSitu);
  const setFmlUseSitu = useInspectInputStore((s) => s.setFmlUseSitu);
  const userId = userStore((s) => s.userId);
  const list =
    userId === 'admin' ? Config.facilityListAdmin : Config.facilityList;

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={[STYLE.box, { backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#6b7280', marginBottom: 8 }}>
          설치된 시설
        </Text>
        {list.map((row, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginTop: i > 0 ? 8 : 0,
              paddingTop: i > 0 ? 8 : 0,
              borderTopWidth: i > 0 ? 1 : 0,
              borderTopColor: '#f3f4f6',
            }}
          >
            {row.map((v, j) => {
              const isSelected = fmlUseSitu === v;
              return (
                <Pressable
                  key={`${i}-${j}`}
                  onPress={() => setFmlUseSitu(v)}
                  style={({ pressed }) => ({
                    backgroundColor: isSelected
                      ? (pressed ? '#0284c7' : '#0ea5e9')
                      : (pressed ? '#dbeafe' : '#f3f4f6'),
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    marginRight: 6,
                    marginBottom: 4,
                    borderRadius: 8,
                    shadowColor: isSelected ? '#000' : 'transparent',
                    shadowOffset: { width: 0, height: isSelected ? 1 : 0 },
                    shadowOpacity: isSelected ? 0.08 : 0,
                    shadowRadius: isSelected ? 2 : 0,
                    elevation: isSelected ? 1 : 0,
                  })}
                >
                  <Text
                    style={{
                      color: isSelected ? 'white' : '#374151',
                      fontWeight: '600',
                      fontSize: 12,
                    }}
                  >
                    {v}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
