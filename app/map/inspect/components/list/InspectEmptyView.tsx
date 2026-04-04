import Common from '@/app/js/common';
import appStatusStore from '@/store/appStatus';
import { View } from 'react-native';

export default function InspectEmptyView() {
  const { isNetworkCheck } = appStatusStore();

  return (
    <View style={{ flex: 1 }}>
      {Common.getNullDataView({
        state: {
          isNetworkCheck: isNetworkCheck,
        },
      })}
    </View>
  );
}
