import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function BtBody({ children }) {
  return <View style={[styles.body]}>{children}</View>;
}
const styles = StyleSheet.create({
  body: {
    flex: 1,
    flexGrow: 1,
    // backgroundColor: '#f7f7f7',
    // backgroundColor: 'orange',
    padding: 0,
    backgroundColor: 'transparent',
  },
});
