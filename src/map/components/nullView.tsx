import { Image, StyleSheet, Text, View } from 'react-native';

export default function NullView({ children }) {
  return (
    <View
      style={styles.container}
    >
      <Image
        source={require('../../../assets/images/ic_search_white.png')}
        style={{ width: 50, height: 50, marginBottom: 10 }} // 이미지 스타일 추가
      />
      {typeof children === 'string' ? (
        <Text style={{ color: '#808080', fontSize: 16 }}>
          {children ? children : '데이터가 없습니다.'}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
});
