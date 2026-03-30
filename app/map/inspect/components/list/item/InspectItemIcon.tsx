import { HStack } from 'native-base';
import { Image, StyleSheet } from 'react-native';

interface InspectItemIconProps {
  category: string;
}

export default function InspectItemIcon({ category }: InspectItemIconProps) {
  return (
    <HStack
      justifyItems={'center'}
      style={{ margin: 'auto' }}
      alignItems={'center'}
    >
      {category === 'facility' ? (
        <Image
          style={style.icon}
          source={require('../../../../../../assets/images/icon-inspect-facility.png')}
        />
      ) : category === 'farm' ? (
        <Image
          style={style.icon}
          source={require('../../../../../../assets/images/icon-inspect-farm.png')}
        />
      ) : (
        <Image
          style={style.icon}
          source={require('../../../../../../assets/images/icon-inspect-none.png')}
        />
      )}
    </HStack>
  );
}

const style = StyleSheet.create({
  icon: {
    resizeMode: 'cover',
    width: 25,
    height: 25,
    tintColor: '#339af0',
  },
});
