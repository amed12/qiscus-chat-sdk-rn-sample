# Push Notifications

## Setup

Push notification registration is handled by `usePushToken` (`src/hooks/usePushToken.ts`).

```ts
usePushToken(enabled);
```

Call it from any always-mounted component (e.g. `RoomListScreen`) after the user is logged in.

## How it works

1. Requests permission via `Notifications.requestPermissionsAsync()`
2. Gets an Expo push token via `Notifications.getExpoPushTokenAsync()`
3. Registers the token with Qiscus via `qiscusClient.registerDeviceToken(token)`

If permission is denied or the request fails, it exits silently (no crash).

## Notification handler

A global handler is configured in the hook file:

```ts
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

This means all incoming push notifications will show an alert, play a sound, and update the badge count while the app is foregrounded.

## Requirements

- Physical device or emulator with Google Play Services (Android)
- `expo-notifications` is already in `package.json`
- For production, you need to configure FCM credentials in your Expo project

## Testing

On the `sdksample` App ID, Qiscus will forward push notifications via Expo's push service. To test:

1. Log in on a physical device
2. Send a message from another account
3. Background the app — a notification should appear
