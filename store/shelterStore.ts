import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import Common from '@/app/js/common';
import Config from '@/app/js/config';
import appStatusStore from './appStatus';
interface ShelterState {
  isLoading: boolean;
  error: string | null;
  id: string;
  managementNo: string;
  applicantName: string;
  applicantDob: string;
  applicantAddr: string;
  reportDate: string;
  installDate: string;
  lotNo: string;
  farmlandArea: number;
  totalFloorArea: number;
  buildingArea: number;
  structure: string;
  totalArea: number;
  landArea: number;
  parkingArea: number;
  septicArea: number;
  deckArea: number;
  electricityYn: string;
  waterSupplyYn: string;
  septicYn: string;
  otherYn: string;
  location: string;
  locationImage: any[];
  interiorImage: any[];
  fireImage: any[];
  singleImage: any[];
  nearImage: any[];
  farImage: any[];
  setManagementNo: (managementNo: string) => void;
  setApplicantName: (applicantName: string) => void;
  setApplicantDob: (applicantDob: string) => void;
  setApplicantAddr: (applicantAddr: string) => void;
  setReportDate: (reportDate: string) => void;
  setInstallDate: (installDate: string) => void;
  setLotNo: (lotNo: string) => void;
  setFarmlandArea: (farmlandArea: number) => void;
  setTotalFloorArea: (totalFloorArea: number) => void;
  setBuildingArea: (buildingArea: number) => void;
  setStructure: (structure: string) => void;
  setTotalArea: (totalArea: number) => void;
  setLandArea: (landArea: number) => void;
  setParkingArea: (parkingArea: number) => void;
  setSepticArea: (septicArea: number) => void;
  setDeckArea: (deckArea: number) => void;
  setElectricityYn: (electricityYn: string) => void;
  setWaterSupplyYn: (waterSupplyYn: string) => void;
  setSepticYn: (septicYn: string) => void;
  setOtherYn: (otherYn: string) => void;
  setLocation: (location: string) => void;
  setLocationImage: (locationImage: any[]) => void;
  setInteriorImage: (interiorImage: any[]) => void;
  setFireImage: (fireImage: any[]) => void;
  setSingleImage: (singleImage: any[]) => void;
  setNearImage: (nearImage: any[]) => void;
  setFarImage: (farImage: any[]) => void;
  fetchShelter: (inspectId: string) => Promise<void>;
  reset: () => void;
}

const createStore = (set) => ({
  isLoading: false,
  error: null,
  id: '',
  managementNo: '',
  applicantName: '',
  applicantDob: '',
  applicantAddr: '',
  reportDate: '',
  installDate: '',
  lotNo: '',
  farmlandArea: 0,
  totalFloorArea: 0,
  buildingArea: 0,
  structure: '',
  totalArea: 0,
  landArea: 0,
  parkingArea: 0,
  septicArea: 0,
  deckArea: 0,
  electricityYn: 'N',
  waterSupplyYn: 'N',
  septicYn: 'N',
  otherYn: 'N',
  location: '',
  locationImage: [],
  interiorImage: [],
  fireImage: [],
  singleImage: [],
  nearImage: [],
  farImage: [],
  setId: (id: string) => set({ id }),
  setManagementNo: (managementNo: string) => set({ managementNo }),
  setApplicantName: (applicantName: string) => set({ applicantName }),
  setApplicantDob: (applicantDob: string) => set({ applicantDob }),
  setApplicantAddr: (applicantAddr: string) => set({ applicantAddr }),
  setReportDate: (reportDate: string) => set({ reportDate }),
  setInstallDate: (installDate: string) => set({ installDate }),
  setLotNo: (lotNo: string) => set({ lotNo }),
  setFarmlandArea: (farmlandArea: number) => set({ farmlandArea }),
  setTotalFloorArea: (totalFloorArea: number) => set({ totalFloorArea }),
  setBuildingArea: (buildingArea: number) => set({ buildingArea }),
  setStructure: (structure: string) => set({ structure }),
  setTotalArea: (totalArea: number) => set({ totalArea }),
  setLandArea: (landArea: number) => set({ landArea }),
  setParkingArea: (parkingArea: number) => set({ parkingArea }),
  setSepticArea: (septicArea: number) => set({ septicArea }),
  setDeckArea: (deckArea: number) => set({ deckArea }),
  setElectricityYn: (electricityYn: string) => set({ electricityYn }),
  setWaterSupplyYn: (waterSupplyYn: string) => set({ waterSupplyYn }),
  setSepticYn: (septicYn: string) => set({ septicYn }),
  setOtherYn: (otherYn: string) => set({ otherYn }),
  setLocation: (location: string) => set({ location }),
  setLocationImage: (locationImage: string[]) => set({ locationImage }),
  setInteriorImage: (interiorImage: string[]) => set({ interiorImage }),
  setFireImage: (fireImage: string[]) => set({ fireImage }),
  setSingleImage: (singleImage: string[]) => set({ singleImage }),
  setNearImage: (nearImage: string[]) => set({ nearImage }),
  setFarImage: (farImage: string[]) => set({ farImage }),
  fetchShelter: async (inspectId: string) => {
    const { isNetworkCheck } = appStatusStore.getState();

    set({ isLoading: true, error: null });

    try {
      const url = `${Config.url}lot/inspect/shelter/${inspectId}`;
      const response = await Common.callAPI(
        url,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        isNetworkCheck
      );
      const r = response.result;
      if (!r) return;
      set({
        id: r.id,
        managementNo: r.managementNo,
        applicantName: r.applicantName,
        applicantDob: r.applicantDob,
        applicantAddr: r.applicantAddr,
        reportDate: r.reportDate,
        installDate: r.installDate,
        lotNo: r.lotNo,
        farmlandArea: r.farmlandArea,
        totalFloorArea: r.totalFloorArea,
        buildingArea: r.buildingArea,
        structure: r.structure,
        totalArea: r.totalArea,
        landArea: r.landArea,
        parkingArea: r.parkingArea,
        septicArea: r.septicArea,
        deckArea: r.deckArea,
        electricityYn: r.electricityYn,
        waterSupplyYn: r.waterSupplyYn,
        septicYn: r.septicYn,
        otherYn: r.otherYn,
        location: r.location,
      });
    } catch (error) {
      set({ error: error?.message || '알 수 없는 오류' });
    } finally {
      set({ isLoading: false });
    }
  },
  reset: () =>
    set({
      managementNo: '',
      applicantName: '',
      applicantDob: '',
      applicantAddr: '',
      reportDate: '',
      installDate: '',
      lotNo: '',
      farmlandArea: 0,
      totalFloorArea: 0,
      buildingArea: 0,
      structure: '',
      totalArea: 0,
      landArea: 0,
      parkingArea: 0,
      septicArea: 0,
      deckArea: 0,
      electricityYn: 'N',
      waterSupplyYn: 'N',
      septicYn: 'N',
      otherYn: 'N',
      location: '',
      locationImage: [],
      interiorImage: [],
      fireImage: [],
      singleImage: [],
      nearImage: [],
      farImage: [],
    }),
});
export default create<ShelterState>()(
  process.env.NODE_ENV === 'development'
    ? devtools(createStore, { name: 'Shelter Store' })
    : (createStore as any)
);
