import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { qiscusClient } from '@/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushToken(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    (async () => {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;
      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      const { data: token } = await Notifications.getExpoPushTokenAsync();
      if (mounted && token) {
        qiscusClient.registerDeviceToken(token).catch(() => {});
      }
    })();

    return () => { mounted = false; };
  }, [enabled]);
}
