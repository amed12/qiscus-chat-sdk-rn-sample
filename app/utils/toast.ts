import { ToastAndroid, Platform } from 'react-native';

export default function toast(msg: string): void {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  }
}
