import bottomStore from '@/store/bottomStore';
import useInspectInputStore from '@/store/inspectInputStore';
import inspectStore from '@/store/inspectStore';
import useMeasureStore from '@/store/measureStore';
import AreaInput from './AreaInput';

export default function OwnAreaInput() {
  const ownAr = useInspectInputStore((s) => s.ownAr);
  const setOwnAr = useInspectInputStore((s) => s.setOwnAr);
  const remainArea = inspectStore((s) => s.remainArea);
  const selectedItem = inspectStore((s) => s.selectedItem);
  const setIndex = bottomStore((s) => s.setIndex);
  const setIsMeasuring = useMeasureStore((s) => s.setIsMeasuring);
  const setMeasurePoints = useMeasureStore((s) => s.setMeasurePoints);

  const availableArea = selectedItem
    ? remainArea + Number(selectedItem.ownAr || 0)
    : remainArea;

  return (
    <AreaInput
      value={ownAr}
      remainArea={remainArea}
      availableArea={availableArea}
      onChangeText={(v) => {
        setOwnAr(Number(v));
      }}
      onPressMeasure={(v) => {
        setIndex(-1);
        setIsMeasuring(true);
        setMeasurePoints([]);
      }}
    />
  );
}
