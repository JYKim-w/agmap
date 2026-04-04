import STYLE from '@/app/style/style';
import { Pressable, Text, View } from 'react-native';

export default function YesNoButtonGroup({ value, onPress }) {
  return (
    <View style={{ flexDirection: 'row', width: '100%', paddingHorizontal: 4, gap: 12 }}>
      <Pressable
        onPress={() => onPress('Y')}
        style={({ pressed }) => ({
          flex: 1,
          backgroundColor: value === 'Y' ? '#0ea5e9' : '#f3f4f6',
          height: 52,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: value === 'Y' ? '#000' : 'transparent',
          shadowOffset: { width: 0, height: value === 'Y' ? 3 : 0 },
          shadowOpacity: value === 'Y' ? 0.12 : 0,
          shadowRadius: value === 'Y' ? 6 : 0,
          elevation: value === 'Y' ? 3 : 0,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ color: value === 'Y' ? 'white' : '#6b7280', fontWeight: '800', fontSize: 15 }}>
          예
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onPress('N')}
        style={({ pressed }) => ({
          flex: 1,
          backgroundColor: value === 'N' ? '#e03131' : '#f3f4f6',
          height: 52,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: value === 'N' ? '#000' : 'transparent',
          shadowOffset: { width: 0, height: value === 'N' ? 3 : 0 },
          shadowOpacity: value === 'N' ? 0.12 : 0,
          shadowRadius: value === 'N' ? 6 : 0,
          elevation: value === 'N' ? 3 : 0,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ color: value === 'N' ? 'white' : '#6b7280', fontWeight: '800', fontSize: 15 }}>
          아니오
        </Text>
      </Pressable>
    </View>
  );
}
