import STYLE from '@/app/style/style';
import { View, StyleSheet } from 'react-native';

function SkeletonBox({ style }: { style?: any }) {
  return <View style={[styles.skeleton, style]} />;
}

export default function InspectLoadingView() {
  return (
    <View style={styles.outerBox}>
      {[...Array(5)].map((_, index) => (
        <View key={index} style={[STYLE.box, styles.itemBox]}>
          <View style={styles.row}>
            <View style={styles.rowInner}>
              <SkeletonBox style={styles.skeletonCircle} />
            </View>
            <View style={styles.column}>
              <SkeletonBox style={styles.skeletonBar} />
              <SkeletonBox style={styles.skeletonBar} />
            </View>
            <View style={styles.column}>
              <SkeletonBox style={styles.skeletonBar} />
              <SkeletonBox style={styles.skeletonBar} />
            </View>
            <View style={styles.column}>
              <SkeletonBox style={styles.skeletonBar} />
              <SkeletonBox style={styles.skeletonBar} />
            </View>
            <View style={styles.actionRow}>
              <SkeletonBox style={styles.skeletonSquare} />
              <SkeletonBox style={styles.skeletonSquare} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  outerBox: {
    flex: 1,
    padding: 4,
  },
  itemBox: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  rowInner: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  skeleton: {
    backgroundColor: '#e9ecef',
  },
  skeletonCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  skeletonBar: {
    height: 16,
    width: 70,
    borderRadius: 4,
  },
  skeletonSquare: {
    width: 40,
    height: 40,
    borderRadius: 5,
  },
});
