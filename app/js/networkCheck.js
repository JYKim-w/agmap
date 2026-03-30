import NetInfo from '@react-native-community/netinfo';
import React, { PureComponent } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

class networkCheck extends PureComponent {
  networkId;

  constructor(props) {
    super(props);

    this.state = {
      isConnected: true,
    };
  }

  componentDidMount() {
    networkId = NetInfo.addEventListener((state) => {
      this.handleConnectivityChange(state.isConnected);
    });

    this.isNetworkCheck();
    let that = this;
    window.netTest = function netTest(v) {
      that.setState({ isConnected: v });
      //네트워크상태 전달
      that.props.callbackFromParent(v);
    };
  }

  componentWillUnmount() {
    networkId();
    //NetInfo.removeEventListener('connectionChange', this.handleConnectivityChange);
  }

  isNetworkCheck = () => {
    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        this.setState({ isConnected: false });
        this.props.callbackFromParent(false);
      }
    });
  };

  handleConnectivityChange = (isConnected) => {
    if (isConnected) {
      this.setState({ isConnected });
    } else {
      this.setState({ isConnected });
    }

    //네트워크상태 전달
    this.props.callbackFromParent(isConnected);
  };

  render() {
    if (!this.state.isConnected) {
      return (
        <View safeAreaTop style={styles.offlineContainer}>
          <Image
            style={styles.image}
            source={require('../../assets/images/wifi_icon.png')}
          />
          <Text style={styles.offlineText}>인터넷이 연결되어있지 않습니다</Text>
        </View>
      );
    }
    return null;
  }
}

const styles = StyleSheet.create({
  offlineContainer: {
    backgroundColor: '#F30E0E',
    width: 50,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    top: 0,
    zIndex: 100,
  },
  offlineText: { color: '#FFF' },
  image: { width: 18, height: 18, marginRight: 10 },
});

export default networkCheck;
