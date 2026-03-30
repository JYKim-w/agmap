import React from 'react';
import {
  Alert,
  BackHandler,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const Common = {
  // 뒤로가기 버튼 클릭
  handleBackPress: function (subject, message) {
    Alert.alert(subject, message, [
      { text: 'OK', onPress: () => BackHandler.exitApp() },
      { text: 'Cancel' },
    ]);
    return true;
  },

  // backButton 리스너 등록
  startBackPressListener: function (subject, message) {
    BackHandler.addEventListener(
      'hardwareBackPress',
      Common.handleBackPress(subject, message)
    );
  },

  // backButton 리스너 종료
  stopBackPressListener: function () {
    BackHandler.removeEventListener('hardwareBackPress');
  },

  // 오늘 날짜 시간 가져오기
  getToday: function () {
    var today = new Date();
    var year = today.getFullYear().toString();
    var month = (today.getMonth() + 1).toString();
    var day = today.getDate().toString();
    var hour = today.getHours().toString();
    var min = today.getMinutes().toString();
    var second = today.getSeconds().toString();

    if (month.length == 1) {
      month = '0' + month;
    }

    if (day.length == 1) {
      day = '0' + day;
    }

    if (hour.length == 1) {
      hour = '0' + hour;
    }

    if (min.length == 1) {
      min = '0' + min;
    }

    if (second.length == 1) {
      second = '0' + second;
    }

    return {
      year: year,
      month: month,
      day: day,
      hour: hour,
      min: min,
      second: second,
    };
  },

  // 날짜 포멧을 변경한다
  dateFormat: function (date, seprator) {
    let d = Common.dateToObj(date);
    seprator = seprator || '';

    return d.year + seprator + d.month + seprator + d.day;
  },

  dateToObj: function (date) {
    let year = date.getFullYear().toString();
    let month = date.getMonth() + 1;
    let day = date.getDate().toString();

    if (month.toString().length == 1) {
      month = '0' + month;
    }

    if (day.toString().length == 1) {
      day = '0' + day;
    }

    return {
      year: year,
      month: month,
      day: day,
    };
  },

  // 데이터가 없을때 보여주는 화면
  getNullDataView: function (thisData) {
    if (thisData.state.isNetworkCheck) {
      return (
        <View
          style={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50%',
          }}
        >
          <Image source={require('../../assets/images/ic_search_white.png')} />
          <Text style={{ color: '#808080' }}>데이터가 없습니다</Text>
        </View>
      );
    } else {
      return (
        <View
          style={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image source={require('../../assets/images/ic_no_wifi.png')} />
          <Text style={{ color: '#808080' }}>
            인터넷 연결시 사용할 수 있습니다
          </Text>
        </View>
      );
    }
  },

  callAPI: async function (url, param, isConnected) {
    if (!isConnected) {
      // saveOffline(url, param); // 주석 처리된 부분
      const message =
        '기기 로컬에 저장합니다.\n인터넷 열결시 자동으로 업로드 됩니다.';
      Alert.alert('오프라인 저장', message);
      return {
        isOffline: true,
        message: message,
      };
    } else {
      const response = await fetch(url, param);
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('[callAPI] JSON 파싱 실패:', response.status, text.substring(0, 200));
        throw new Error(`서버 오류 (${response.status})`);
      }
    }
  },

  isNull: function (v) {
    return v === null || v === undefined || v.trim() === '';
  },

  STYLE: StyleSheet.create({
    header: {
      padding: 10,
      paddingTop: 15,
    },
    container: {},
    sheet: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 2,
      elevation: 5,
      flex: 1,
      flexGrow: 1,
    },
    view: {
      marginTop: 5,
      padding: 5,
    },
    box: {
      padding: 10,
      borderWidth: 0.5,
      borderColor: '#e1e1e1',
      borderRadius: 5,
    },
    input: {
      color: 'black',
    },
    row: {
      width: '100%',
      paddingLeft: 15,
      paddingRight: 15,
    },
    label: {
      width: '100%',
      marginLeft: 5,
      fontWeight: '400',
    },
    postfix: {
      margin: 5,
      marginBottom: 10,
      alignSelf: 'flex-end',
    },
    select: {
      width: '100%',
    },
    btn_inspect: {
      minWidth: 60,
      maxHeight: 50,
      overflow: 'hidden',
      borderRadius: 30,
    },
    btn_bottom: {},
  }),
};

export default Common;
