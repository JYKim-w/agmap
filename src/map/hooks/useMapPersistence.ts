import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import Config from '@/app/js/config';
import optionStore from '@/store/optionStore';

export const useMapPersistence = (options: any) => {
  const [isStoreLoaded, setIsStoreLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await AsyncStorage.getItem(Config.file.settingData);
        if (result) {
          const value = JSON.parse(result);
          optionStore.getState().setOptions(value);
        }
      } catch (e) {
        console.error('[useMapPersistence] loadSettings error', e);
      } finally {
        setIsStoreLoaded(true);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (!isStoreLoaded) return;
    
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem(Config.file.settingData, JSON.stringify(options));
      } catch (e) {
        console.error('[useMapPersistence] saveSettings error', e);
      }
    };
    saveSettings();
  }, [options, isStoreLoaded]);

  return { isStoreLoaded };
};
