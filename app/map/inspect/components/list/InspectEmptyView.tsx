import Common from '@/app/js/common';
import appStatusStore from '@/store/appStatus';
import { View } from 'native-base';

export default function InspectEmptyView() {
  const { isNetworkCheck } = appStatusStore();

  return (
    <View flex={1}>
      {Common.getNullDataView({
        state: {
          isNetworkCheck: isNetworkCheck,
        },
      })}
    </View>
  );
}
