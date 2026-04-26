// MapLibre 오프라인 글리프(폰트) 셋업
// 번들된 PBF 파일을 FileSystem.cacheDirectory로 복사 → file:// URL 반환
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

const GLYPHS_CACHE_DIR = `${FileSystem.cacheDirectory}map-glyphs-v10/`;

// Metro require는 정적 문자열 필수 — 범위별로 나열
const BUNDLED_FONTS: Record<string, Record<string, number>> = {
  'Open Sans Semibold': {
    '0-255':   require('../../../assets/fonts/maplibre/Open_Sans_Semibold/0-255.pbf') as number,
    '256-511': require('../../../assets/fonts/maplibre/Open_Sans_Semibold/256-511.pbf') as number,
  },
  'Noto Sans KR Bold': {
    '0-255':       require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/0-255.pbf') as number,
    '256-511':     require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/256-511.pbf') as number,
    '512-767':     require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/512-767.pbf') as number,
    '768-1023':    require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/768-1023.pbf') as number,
    '4352-4607':   require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/4352-4607.pbf') as number,
    '12288-12543': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/12288-12543.pbf') as number,
    '44032-44287': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/44032-44287.pbf') as number,
    '44288-44543': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/44288-44543.pbf') as number,
    '44544-44799': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/44544-44799.pbf') as number,
    '44800-45055': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/44800-45055.pbf') as number,
    '45056-45311': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/45056-45311.pbf') as number,
    '45312-45567': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/45312-45567.pbf') as number,
    '45568-45823': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/45568-45823.pbf') as number,
    '45824-46079': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/45824-46079.pbf') as number,
    '46080-46335': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/46080-46335.pbf') as number,
    '46336-46591': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/46336-46591.pbf') as number,
    '46592-46847': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/46592-46847.pbf') as number,
    '46848-47103': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/46848-47103.pbf') as number,
    '47104-47359': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/47104-47359.pbf') as number,
    '47360-47615': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/47360-47615.pbf') as number,
    '47616-47871': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/47616-47871.pbf') as number,
    '47872-48127': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/47872-48127.pbf') as number,
    '48128-48383': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/48128-48383.pbf') as number,
    '48384-48639': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/48384-48639.pbf') as number,
    '48640-48895': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/48640-48895.pbf') as number,
    '48896-49151': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/48896-49151.pbf') as number,
    '49152-49407': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/49152-49407.pbf') as number,
    '49408-49663': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/49408-49663.pbf') as number,
    '49664-49919': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/49664-49919.pbf') as number,
    '49920-50175': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/49920-50175.pbf') as number,
    '50176-50431': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/50176-50431.pbf') as number,
    '50432-50687': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/50432-50687.pbf') as number,
    '50688-50943': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/50688-50943.pbf') as number,
    '50944-51199': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/50944-51199.pbf') as number,
    '51200-51455': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/51200-51455.pbf') as number,
    '51456-51711': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/51456-51711.pbf') as number,
    '51712-51967': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/51712-51967.pbf') as number,
    '51968-52223': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/51968-52223.pbf') as number,
    '52224-52479': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/52224-52479.pbf') as number,
    '52480-52735': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/52480-52735.pbf') as number,
    '52736-52991': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/52736-52991.pbf') as number,
    '52992-53247': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/52992-53247.pbf') as number,
    '53248-53503': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/53248-53503.pbf') as number,
    '53504-53759': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/53504-53759.pbf') as number,
    '53760-54015': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/53760-54015.pbf') as number,
    '54016-54271': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/54016-54271.pbf') as number,
    '54272-54527': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/54272-54527.pbf') as number,
    '54528-54783': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/54528-54783.pbf') as number,
    '54784-55039': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/54784-55039.pbf') as number,
    '55040-55295': require('../../../assets/fonts/maplibre/Noto_Sans_KR_Bold/55040-55295.pbf') as number,
  },
};

async function copyFontToCache(fontStack: string, range: string, moduleId: number): Promise<void> {
  const fontDir = `${GLYPHS_CACHE_DIR}${encodeURIComponent(fontStack)}/`;
  await FileSystem.makeDirectoryAsync(fontDir, { intermediates: true }).catch(() => {});

  const dest = `${fontDir}${range}.pbf`;
  const info = await FileSystem.getInfoAsync(dest);
  if (info.exists) return;

  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();
  if (asset.localUri) {
    await FileSystem.copyAsync({ from: asset.localUri, to: dest });
  }
}

export async function setupMapGlyphs(): Promise<string> {
  await Promise.all(
    Object.entries(BUNDLED_FONTS).flatMap(([fontStack, ranges]) =>
      Object.entries(ranges).map(([range, moduleId]) =>
        copyFontToCache(fontStack, range, moduleId),
      ),
    ),
  );
  return `${GLYPHS_CACHE_DIR}{fontstack}/{range}.pbf`;
}
