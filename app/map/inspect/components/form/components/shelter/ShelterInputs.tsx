import { View } from 'native-base';
import React from 'react';
import LivingFacilitiesInput from './LivingFacilitiesInput';
import ShelterAreaInput from './ShelterAreaInput';
import ShelterDetailAreaInput from './ShelterDetailAreaInput';
import ShelterPhotoInputs from './ShelterPhotoInputs';
import ShelterStructureInput from './ShelterStructureInput';
export default function ShelterForm({}) {
  return (
    <View>
      <ShelterAreaInput />
      <ShelterDetailAreaInput />
      <ShelterStructureInput />
      <LivingFacilitiesInput />
      <ShelterPhotoInputs />
    </View>
  );
}
