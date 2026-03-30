const Config = {
  url: 'https://farmfield.kr/',
  // url: 'http://juyoungk.iptime.org:8080/',

  api: {
    address:
      'http://api.vworld.kr/req/address?service=address&request=getAddress&key=514A74AA-9B2B-30E0-B3CE-6687EEFB9730&type=PARCEL&point=',
    vworldKey: 'D34B6D7C-0A50-3A91-BC71-22E1E3C22678',
    addressSearch: 'http://map.vworld.kr/search.do?',
  },

  coordinate: {
    wgs84:
      '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees',
    grs80:
      '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs',
  },

  file: {
    offlineCollection: 'offlineCollection',
    loginInfo: 'loginInfoMfield',
    settingData: 'settingDataMfield',
  },

  message: {
    info: {
      gps: 'GPS 정보를 가져오는 중입니다.',
      gpsError: 'GPS 정보를 가져올 수 없습니다.',
      reset: '초기화 완료',
      save: '저장이 완료되었습니다.',
      delete: '삭제되었습니다.',
      update: '수정이 완료되었습니다.',
      settingSuccess: '기본 설정으로 변경되었습니다.',
      dateSmall: '종료일이 시작일보다 작습니다.',
      dateBig: '시작일이 종료일보다 큽니다.',
      select: '선택된 조사가 없습니다.',
    },
    error: {
      network: '인터넷이 연결이 되어있지 않습니다.',
      pointCnt: '점 데이터가 존재하지 않습니다 \n 다시 실행해 주세요.',
      lineCnt: '점 데이터가 2개 이상 존재해야 됩니다.',
      polygonCnt: '점 데이터가 3개 이상 존재해야 됩니다.',
      id: '아이디를 입력하세요.',
      pw: '패스워드를 입력하세요.',
      license: '라이센스 코드를 입력하세요.',
      inspector: '조사자명을 입력하세요.',
      subject: '제목을 입력하세요',
      remainArea:
        '사용가능한 면적이 없습니다.\n조사내용을 삭제하거나 수정한 뒤에\n추가할 수 있습니다.',
    },
  },

  datePicker: {
    dayNames: [
      '일요일',
      '월요일',
      '화요일',
      '수요일',
      '목요일',
      '금요일',
      '토요일',
    ],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
    monthNames: [
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
      '9월',
      '10월',
      '11월',
      '12월',
    ],
  },

  facilityList: [
    [
      '비닐하우스',
      '고정식온실',
      '버섯재배사',
      '농막',
      // '체류형쉼터'
    ],
    ['간이퇴비장', '간이액비저장조'],
    ['수로', '농로', '제방', '양배수시설', '유지'],
    ['주택', '창고', '주유소'],
    ['주차장', '일반도로', '묘지'],
    ['축사', '곤충사육사', '간이양축시설'],
  ],
  facilityListAdmin: [
    ['비닐하우스', '고정식온실', '버섯재배사', '농막', '체류형쉼터'],
    ['간이퇴비장', '간이액비저장조'],
    ['수로', '농로', '제방', '양배수시설', '유지'],
    ['주택', '창고', '주유소'],
    ['주차장', '일반도로', '묘지'],
    ['축사', '곤충사육사', '간이양축시설'],
  ],
};

export default Config;
