import fs from 'fs';
import type { ExpoConfig, ConfigContext } from 'expo/config';

const hasGoogleServices = fs.existsSync('./google-services.json');
const hasGoogleServicesPlist = fs.existsSync('./GoogleService-Info.plist');

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Qiscus Chat Sample',
  slug: 'qiscus-chat-sdk-rn-sample',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.qiscus.chatsample',
    // Only include if the file exists (gitignored — add your own for FCM push)
    ...(hasGoogleServices && { googleServicesFile: './google-services.json' }),
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.qiscus.chatsample',
    ...(hasGoogleServicesPlist && { googleServicesFile: './GoogleService-Info.plist' }),
  },
  plugins: [
    [
      'expo-notifications',
      {
        icon: './assets/icon.png',
        color: '#9aca62',
        sounds: [],
      },
    ],
    'expo-image-picker',
    'expo-document-picker',
  ],
  extra: {
    qiscusAppId: process.env.QISCUS_APP_ID ?? 'sdksample',
  },
});
