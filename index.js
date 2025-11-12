import {AppRegistry, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import App from './App';
import {name as appName} from './app.json';
import {qiscus} from './app/qiscus';

if (__DEV__) {
  require("./ReactotronConfig");
}

// Register background handler for Firebase messaging
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  
  try {
    const payload = remoteMessage.data?.payload 
      ? JSON.parse(remoteMessage.data.payload) 
      : null;

    // Display notification in background
    await notifee.displayNotification({
      title: remoteMessage.notification?.title || 'New Message',
      body: payload?.message || remoteMessage.notification?.body || '',
      android: {
        channelId: 'general',
        pressAction: {
          id: 'default',
        },
      },
    });
  } catch (error) {
    console.error('Error handling background message:', error);
  }
});

// Handle notification events (when user taps on notification)
notifee.onBackgroundEvent(async ({type, detail}) => {
  console.log('Background notification event:', type, detail);
  
  if (type === EventType.PRESS) {
    // Handle notification press - navigate to appropriate screen
    console.log('User pressed notification:', detail.notification);
  }
});

// Register FCM token with Qiscus when user logs in
// This should be called after successful login
export const registerDeviceToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    
    if (qiscus.isLogin) {
      await qiscus.registerDeviceToken(token);
      console.log('Device token registered with Qiscus');
    }
  } catch (error) {
    console.error('Error registering device token:', error);
  }
};
// Register the app
AppRegistry.registerComponent(appName, () => App);
