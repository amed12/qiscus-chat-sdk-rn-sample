import Reactotron from 'reactotron-react-native';

if (__DEV__) {
  Reactotron.configure({ name: 'Qiscus Chat SDK Sample' })
    .useReactNative({ networking: true })
    .connect();
}
