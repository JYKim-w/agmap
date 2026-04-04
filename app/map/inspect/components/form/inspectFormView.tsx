import BtBody from '@/src/map/components/btBody';
import BtHeader from '@/src/map/components/btHeader';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import inspectInputStore from '@/store/inspectInputStore';
import inspectStore from '@/store/inspectStore';
import shelterStore from '@/store/shelterStore';
import userStore from '@/store/userStore';
import STYLE from '@/app/style/style';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import codeStore from '@/store/codeStore';
import FallowView from './components/FallowView';
import IsFacility from './components/IsFacility';
import IsFarm from './components/IsFarm';
import OwnAreaInput from './components/OwnAreaInput';
import SelectFacility from './components/SelectFacility';
import SelectFarm from './components/SelectFarm';
import SunInput from './components/SunInput';
import ShelterForm from './components/shelter/ShelterInputs';

export default function InspectFormView() {
  // UI 렌더에 필요한 값만 셀렉터로 구독
  const isFacility = inspectInputStore((s) => s.isFacility);
  const isFarm = inspectInputStore((s) => s.isFarm);
  const fmlUseSitu = inspectInputStore((s) => s.fmlUseSitu);

  const fieldInfo = inspectStore((s) => s.fieldInfo);
  const isLoading = inspectStore((s) => s.isLoading);
  const jimkCodeList = codeStore((s) => s.jimkCodeList);

  const [validationMsg, setValidationMsg] = useState('');
  const scrollRef = useRef<any>(null);

  const ownAr = inspectInputStore((s) => s.ownAr);
  const remainArea = inspectStore((s) => s.remainArea);
  const selectedItem = inspectStore((s) => s.selectedItem);

  const ownAreaY = useRef(0);

  // 면적 초과 시 OwnAreaInput으로 자동 스크롤
  useEffect(() => {
    const available = selectedItem
      ? remainArea + Number(selectedItem.ownAr || 0)
      : remainArea;
    if (available > 0 && ownAr > available && scrollRef.current) {
      scrollRef.current.scrollTo({ y: ownAreaY.current, animated: true });
    }
  }, [ownAr, remainArea, selectedItem]);

  const handleBack = useCallback(() => {
    inspectStore.getState().setIsEdit(false);
    inspectStore.getState().setSelectedItem(null);
    inspectInputStore.getState().reset();
    shelterStore.getState().reset();
  }, []);

  const onSubmitClick = useCallback(async () => {
    // 제출 시점에 getState()로 최신 값 읽기 — stale closure 방지
    const input = inspectInputStore.getState();
    const inspect = inspectStore.getState();
    const shelter = shelterStore.getState();
    const user = userStore.getState();

    // validation
    const msg = validate(input, inspect);
    if (msg) {
      setValidationMsg(msg);
      return;
    }
    setValidationMsg('');
    Keyboard.dismiss();

    const params: any = {
      inspectId: inspect.selectedItem?.inspectId,
      userId: user.userId,
      fmlId: inspect.fieldInfo?.pnu,
      fmlUseCategory:
        input.isFacility === 'Y'
          ? 'facility'
          : input.isFarm === 'Y'
            ? 'farm'
            : 'none',
      fmlUseSitu: input.fmlUseSitu,
      sunlgtEsbYn: input.sunlgtEsbYn,
      ownAr: input.ownAr,
    };

    if (input.fmlUseSitu === '체류형쉼터') {
      params.shelter = {
        id: shelter.id,
        managementNo: shelter.managementNo,
        applicantName: shelter.applicantName,
        applicantDob: shelter.applicantDob,
        applicantAddr: shelter.applicantAddr,
        reportDate: shelter.reportDate,
        installDate: shelter.installDate,
        lotNo: shelter.lotNo,
        farmlandArea: shelter.farmlandArea,
        totalFloorArea: shelter.totalFloorArea,
        buildingArea: shelter.buildingArea,
        structure: shelter.structure,
        totalArea: shelter.totalArea,
        landArea: shelter.landArea,
        parkingArea: shelter.parkingArea,
        septicArea: shelter.septicArea,
        deckArea: shelter.deckArea,
        electricityYn: shelter.electricityYn,
        waterSupplyYn: shelter.waterSupplyYn,
        septicYn: shelter.septicYn,
        otherYn: shelter.otherYn,
        location: shelter.location,
      };
    }

    const saveResult = await inspect.fetchSaveInspect(
      params,
      inspect.selectedItem ? 'update' : 'insert'
    );

    if (!saveResult) return; // 저장 실패 시 중단

    // 체류형 쉼터 사진 업로드
    if (input.fmlUseSitu === '체류형쉼터') {
      const images = [
        ...shelter.interiorImage.filter((item) => item.isNew),
        ...shelter.fireImage.filter((item) => item.isNew),
        ...shelter.singleImage.filter((item) => item.isNew),
        ...shelter.nearImage.filter((item) => item.isNew),
        ...shelter.farImage.filter((item) => item.isNew),
        ...shelter.locationImage.filter((item) => item.isNew),
      ];
      for (const img of images) {
        await inspect.fetchUploadImage(img.uri, {
          fmlId: inspect.fieldInfo?.pnu,
          fileType: img.fileType,
          inspectId: inspect.selectedItem?.inspectId,
        });
      }
    }

    // 입력 상태 먼저 초기화 (remainArea 재계산 전에 리셋해야 초과 플리커 방지)
    const pnu = inspect.fieldInfo?.pnu;
    inspectInputStore.getState().reset();
    shelterStore.getState().reset();
    inspectStore.getState().setSelectedItem(null);
    inspectStore.getState().setIsEdit(false);
    await inspect.fetchInspectList(pnu);
    await inspect.fetchFiles(pnu);
  }, []);

  return (
    <View style={{ flexGrow: 1 }}>
      <BtHeader
        fieldInfo={fieldInfo}
        jimkCodeList={jimkCodeList}
        onPress={handleBack}
      />
      <BtBody>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <ScrollView ref={scrollRef} style={[STYLE.view, { flexGrow: 1 }]}>
            <IsFacility />
            {isFacility === 'Y' && <SelectFacility />}
            {isFacility === 'N' && <IsFarm />}
            {isFarm === 'Y' && <SelectFarm />}
            {isFacility === 'N' && isFarm === 'N' && <FallowView />}
            {fmlUseSitu === '체류형쉼터' ? (
              <ShelterForm />
            ) : (
              <>
                {fmlUseSitu && (
                  <View onLayout={(e) => { ownAreaY.current = e.nativeEvent.layout.y; }}>
                    <OwnAreaInput />
                  </View>
                )}
                {fmlUseSitu != null && fmlUseSitu !== '휴경' && <SunInput />}
              </>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>

        {validationMsg ? (
          <View
            style={{
              backgroundColor: '#fff5f5',
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginHorizontal: 16,
              marginBottom: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#fee2e2',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="alert-circle" size={18} color="#e03131" />
              <Text style={{ color: '#e03131', fontSize: 14, fontWeight: '700' }}>
                {validationMsg}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Pressable
            onPress={onSubmitClick}
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? '#0284c7' : '#0ea5e9',
                height: 60,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
              },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={{ fontWeight: '800', fontSize: 18, color: 'white' }}>
              기록 저장하기
            </Text>
          </Pressable>
        </View>
      </BtBody>
      {isLoading && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
}

/** validation — 순수 함수, 스토어 스냅샷으로 검증 */
function validate(input: any, inspect: any): string | null {
  if (input.isFacility === 'Y') {
    if (!input.fmlUseSitu) return '시설물을 선택해주세요.';
  } else {
    if (!input.isFarm) return '경작 여부를 선택해주세요.';
  }

  if (input.isFarm === 'Y') {
    if (!input.fmlUseSitu) return '재배 종류를 선택해주세요.';
  }

  if (input.fmlUseSitu !== '체류형쉼터') {
    if (!input.sunlgtEsbYn) return '태양광 설치 여부를 선택해주세요.';
    if (!input.ownAr) return '면적을 입력해주세요.';

    const available = inspect.selectedItem
      ? inspect.remainArea + Number(inspect.selectedItem.ownAr || 0)
      : inspect.remainArea;
    if (Number(input.ownAr) > available) {
      return '사용가능한 면적을 초과했습니다.';
    }
  }

  return null;
}
