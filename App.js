import {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';

import * as Qiscus from 'qiscus';
import {LoginPage as LoginScreen} from 'screens/LoginScreen';
import {ResumeSessionScreen} from 'screens/ResumeSessionScreen';
import ChatScreen from 'screens/ChatScreen';
import { loadMultichannelSession } from './app/services/sessionService';
import { APP_CONFIG } from './app/config/appConfig';

const Stack = createNativeStackNavigator();

const sleep = (durationMs) =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

const useBootstrapRoute = () => {
  const [state, setState] = useState({initialRoute: 'Login', isReady: false});

  useEffect(() => {
    const bootstrap = async () => {
      try {
        Qiscus.init();
        const storedUser = await loadMultichannelSession(APP_CONFIG.qiscus.appId);

        if (!storedUser) {
          console.log('[App] No stored user found');
          setState({initialRoute: 'Login', isReady: true});
          return;
        }
        console.log('[App] User found:', storedUser);
        await Qiscus.qiscus.setUserWithIdentityToken(storedUser.userDataToken);
        await sleep(300);

        setState({initialRoute: 'ResumeSession', isReady: true});
      } catch (error) {
        console.log('[App] Error checking session:', error);
        setState({initialRoute: 'Login', isReady: true});
      }
    };

    bootstrap();
  }, []);

  return state;
};

const usePushNotifications = () => {
  useEffect(() => {
    let unsubscribe = null;

    const setupNotifications = async () => {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('Push notification permission denied');
          return;
        }

        if (Platform.OS === 'android') {
          await notifee.createChannel({
            id: 'general',
            name: 'General Notifications',
            importance: AndroidImportance.HIGH,
          });
        }

        unsubscribe = messaging().onMessage(async (remoteMessage) => {
          console.log('FCM Message received:', remoteMessage);

          try {
            const payload = remoteMessage.data?.payload
              ? JSON.parse(remoteMessage.data.payload)
              : null;

            await notifee.displayNotification({
              title: remoteMessage.notification?.title || 'New Message',
              body: payload?.message || remoteMessage.notification?.body || '',
              android: {
                channelId: 'general',
                importance: AndroidImportance.HIGH,
                pressAction: {
                  id: 'default',
                },
              },
              ios: {
                foregroundPresentationOptions: {
                  alert: true,
                  badge: true,
                  sound: true,
                },
              },
            });
          } catch (error) {
            console.error('Error displaying notification:', error);
          }
        });
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);
};

export default function Application() {
  const {initialRoute, isReady} = useBootstrapRoute();
  usePushNotifications();

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
          initialRouteName={initialRoute}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ResumeSession" component={ResumeSessionScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
