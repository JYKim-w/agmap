import { Image, StyleSheet, View } from 'react-native';

interface InspectItemIconProps {
  category: string;
}

export default function InspectItemIcon({ category }: InspectItemIconProps) {
  return (
    <View
      style={styles.container}
    >
      {category === 'facility' ? (
        <Image
          style={styles.icon}
          source={require('../../../../../../assets/images/icon-inspect-facility.png')}
        />
      ) : category === 'farm' ? (
        <Image
          style={styles.icon}
          source={require('../../../../../../assets/images/icon-inspect-farm.png')}
        />
      ) : (
        <Image
          style={styles.icon}
          source={require('../../../../../../assets/images/icon-inspect-none.png')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 'auto' as any,
  },
  icon: {
    resizeMode: 'cover',
    width: 25,
    height: 25,
    tintColor: '#339af0',
  },
});
