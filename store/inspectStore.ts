import { Alert } from 'react-native';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import Toast from 'react-native-toast-message';
import Common from '@/app/js/common';
import Config from '@/app/js/config';
import appStatusStore from './appStatus';
interface InspectStore {
  fieldInfo: any;
  inspectList: any[];
  remainArea: number;
  isEdit: boolean;
  isLoading: boolean;
  error: string | null;
  selectedItem: any;
  files: any[];
  setFieldInfo: (fieldInfo: any) => void;
  setSelectedItem: (selectedItem: any) => void;
  setInspectList: (inspectList: any[]) => void;
  setRemainArea: (remainArea: number) => void;
  setIsEdit: (isEdit: boolean) => void;
  resetInspectList: () => void;
  fetchInspectList: (pnu: string) => Promise<void>;
  fetchFiles: (pnu: string) => Promise<void>;
  fetchSaveInspect: (data: any, option: 'insert' | 'update') => Promise<any>;
  fetchRemoveInspect: (inspectId: string) => Promise<any>;
  fetchRemoveImage: (fileId: string) => Promise<any>;
  fetchUploadImage: (uri: string, data?: any) => Promise<any>;
  reset: () => void;
}

const createStore = (set, get) => ({
  fieldInfo: null,
  setFieldInfo: (fieldInfo: any) => set({ fieldInfo }),
  inspectList: [],
  remainArea: 0,
  isEdit: false,
  isLoading: false,
  error: null,
  selectedItem: null,
  files: [],
  setFiles: (files: any[]) => set({ files }),
  setSelectedItem: (selectedItem: any) => {
    set({ selectedItem });
  },
  setInspectList: (inspectList: any[]) => {
    // 필지 전체 면적 가져오기
    const totalArea = get().fieldInfo ? Number(get().fieldInfo.rlnd_area) : 0;

    // 조사내용들의 소유면적 합계 계산
    const usedArea = inspectList.reduce((sum, item) => {
      return sum + (Number(item.ownAr) || 0);
    }, 0);

    // 남은 면적 계산
    const remainArea = totalArea - usedArea;
    set({ inspectList: inspectList, remainArea: remainArea });
  },
  setRemainArea: (remainArea: number) => set({ remainArea }),
  setIsEdit: (isEdit: boolean) => set({ isEdit }),
  resetInspectList: () => {
    set({ inspectList: [], remainArea: 0, isEdit: false });
  },
  fetchFiles: async (pnu: string) => {
    if (!pnu) return;

    const { isNetworkCheck } = appStatusStore.getState();

    set({ isLoading: true, error: null });
    try {
      //console.log('fetchFiles :: pnu', pnu);
      const url = Config.url + `lot/file/list/${pnu}`;
      const response = await Common.callAPI(
        url,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
        isNetworkCheck
      );
      if (response.isOffline) {
        Alert.alert(response.message);
      }
      set({ files: response.result ?? [], isLoading: false });
      //console.log('fetchFiles :: response', response.result.length);
      return response;
    } catch (error) {
      set({ error: error?.message || '알 수 없는 오류', isLoading: false });
    }
  },
  fetchInspectList: async (pnu: string) => {
    const { isNetworkCheck } = appStatusStore.getState();

    set({ isLoading: true, error: null });

    try {
      const url = `${Config.url}lot/inspect/list?fmlId=${pnu}`;
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

      if (response.isOffline) {
        Alert.alert(response.message);
      }
      const inspectList = response.result || [];
      const fieldInfo = get().fieldInfo;
      const totalArea = fieldInfo ? Number(fieldInfo.rlnd_area) : 0;

      const usedArea = inspectList.reduce((sum, item) => {
        return sum + (Number(item.ownAr) || 0);
      }, 0);

      const remainArea = totalArea - usedArea;
      set({ inspectList, remainArea, isLoading: false });
      return response;
    } catch (error) {
      set({ error: error?.message || '알 수 없는 오류', isLoading: false });
    }
  },
  fetchSaveInspect: async (data: any, option: 'insert' | 'update') => {
    const { isNetworkCheck } = appStatusStore.getState();
    set({ isLoading: true, error: null });

    try {
      const jsonStr = JSON.stringify(data);
      const url = Config.url + 'lot/inspect/app/' + option;

      const response = await Common.callAPI(
        url,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: jsonStr,
        },
        isNetworkCheck
      );

      if (response.isOffline) {
        Alert.alert(response.message);
      }
      set({ isLoading: false });
      return response;
    } catch (error) {
      console.error('[fetchSaveInspect] Error:', error);
      const msg = error?.message || '저장 중 오류가 발생했습니다.';
      set({ error: msg, isLoading: false });
      Toast.show({
        type: 'error',
        text1: '저장 실패',
        text2: msg,
        visibilityTime: 4000,
      });
    }
  },
  fetchRemoveInspect: async (inspectId: string) => {
    const { isNetworkCheck } = appStatusStore.getState();

    set({ isLoading: true, error: null });

    try {
      const url = `${Config.url}lot/inspect/app/delete`;
      const response = await Common.callAPI(
        url,
        { method: 'POST', body: JSON.stringify({ inspectId: inspectId }) },
        isNetworkCheck
      );

      if (response.isOffline) {
        Alert.alert(response.message);
      }
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ error: error?.message || '알 수 없는 오류', isLoading: false });
    }
  },
  fetchRemoveImage: async (fileId: string) => {
    const { isNetworkCheck } = appStatusStore.getState();

    set({ isLoading: true, error: null });
    try {
      // console.log('fetchRemoveImage :: fileId', fileId);
      const url = Config.url + 'lot/file/delete';
      const formData = new FormData();
      formData.append('fileId', fileId);

      const response = await Common.callAPI(
        url,
        {
          method: 'POST',
          body: formData,
        },
        isNetworkCheck
      );
      if (response.isOffline) {
        Alert.alert(response.message);
      }
      set({ isLoading: false });
      // console.log('fetchRemoveImage :: response', response.result);
      return response;
    } catch (error) {
      set({ error: error?.message || '알 수 없는 오류', isLoading: false });
    }
  },
  fetchUploadImage: async (uri: string, data?: any) => {
    const { isNetworkCheck } = appStatusStore.getState();

    set({ isLoading: true, error: null });

    try {
      const fileName = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(fileName ?? '');
      const type = match ? `image/${match[1]}` : 'image';
      const formData = new FormData();
      formData.append('image', {
        uri: uri,
        name: fileName,
        type: type,
      } as any);

      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          formData.append(key, value as string);
        });
      }

      const url = Config.url + 'lot/file/upload';
      const response = await Common.callAPI(
        url,
        {
          method: 'POST',
          body: formData,
        },
        isNetworkCheck
      );
      if (response.isOffline) Alert.alert(response.message);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ error: error?.message || '알 수 없는 오류', isLoading: false });
    }
  },
  reset: () => {
    set({
      fieldInfo: null,
      inspectList: [],
      remainArea: 0,
      isEdit: false,
      selectedItem: null,
      isLoading: false,
      error: null,
    });
  },
});

export default create<InspectStore>()(
  process.env.NODE_ENV === 'development'
    ? devtools(createStore, { name: 'Inspect Store' })
    : createStore
);
