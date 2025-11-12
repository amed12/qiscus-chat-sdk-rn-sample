import React, {useEffect} from 'react';
import {Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useAsyncStorage} from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';

import * as Qiscus from 'qiscus';
import {LoginPage as LoginScreen} from 'screens/LoginScreen';
import ProfileScreen from 'screens/ProfileScreen';
import RoomListScreen from 'screens/RoomListScreen';
import ChatScreen from 'screens/ChatScreen';
import UserListScreen from 'screens/UserListScreen';
import CreateGroupScreen from 'screens/CreateGroupScreen';
import RoomInfoScreen from 'screens/RoomInfo';

const Stack = createNativeStackNavigator();

export default function Application() {
  const storage = useAsyncStorage('qiscus');

  useEffect(() => {
    // Initialize Qiscus SDK
    Qiscus.init();
    
    // Restore user session
    storage.getItem().then(
      (res) => {
        if (res == null) return;
        const data = JSON.parse(res);
        Qiscus.qiscus.setUserWithIdentityToken({user: data});
      },
      (error) => {
        console.log('error getting login data', error);
      },
    );
  }, [storage]);

  useEffect(() => {
    // Setup push notifications
    const setupNotifications = async () => {
      try {
        // Request permission
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('Push notification permission denied');
          return;
        }

        // Create notification channel for Android
        if (Platform.OS === 'android') {
          await notifee.createChannel({
            id: 'general',
            name: 'General Notifications',
            importance: AndroidImportance.HIGH,
          });
        }

        // Handle foreground messages
        const unsubscribe = messaging().onMessage(async (remoteMessage) => {
          console.log('FCM Message received:', remoteMessage);
          
          try {
            const payload = remoteMessage.data?.payload 
              ? JSON.parse(remoteMessage.data.payload) 
              : null;

            // Display notification using Notifee
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

        return unsubscribe;
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    const unsubscribe = setupNotifications();
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
          initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="RoomList" component={RoomListScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="UserList" component={UserListScreen} />
          <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
          <Stack.Screen name="RoomInfo" component={RoomInfoScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

