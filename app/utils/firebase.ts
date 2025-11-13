import firebase from '@react-native-firebase/app';
import '@react-native-firebase/messaging';

import * as Qiscus from '../qiscus';

// Get FCM token
export const getToken = async (): Promise<string> => {
  try {
    const token = await firebase.messaging().getToken();
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    throw error;
  }
};

// Initialize Firebase messaging and register device token
export const initiate = async (): Promise<void> => {
  try {
    // v3: Check if user is logged in
    const isLoggedIn = await Qiscus.isUserLoggedIn();
    
    if (!isLoggedIn) {
      console.log('User not logged in, skipping FCM token registration');
      return;
    }
    
    const token = await getToken();
    await Qiscus.setDeviceToken(token);
    console.log('FCM token registered successfully');
  } catch (error) {
    console.error('Error initiating Firebase:', error);
    throw error;
  }
};

// Request notification permission
export async function requestPermission(): Promise<number> {
  try {
    const authStatus = await firebase.messaging().hasPermission();
    if (authStatus === 0) {
      // Not authorized, request permission
      await firebase.messaging().requestPermission();
    }
    return authStatus;
  } catch (error) {
    console.error('Error requesting permission:', error);
    throw error;
  }
}
