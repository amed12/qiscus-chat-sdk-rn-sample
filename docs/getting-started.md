# Getting Started

## Prerequisites

| Tool | Version |
|------|---------|
| Node | 20+ |
| Yarn | 4+ (or npm 10+) |
| Expo CLI | latest (`npm i -g expo-cli`) |
| Android Studio | latest + emulator API 33+ |
| Xcode | 15+ (macOS only, for iOS) |

## Clone & install

```bash
git clone https://github.com/qiscus/qiscus-chat-sdk-rn-sample
cd qiscus-chat-sdk-rn-sample
git checkout rewrite/expo-ts
yarn install
```

## Run on Android

1. Start an Android emulator from Android Studio (AVD Manager).
2. Run:
   ```bash
   yarn android
   ```
   This builds the Expo dev-client and installs it on the emulator.

## Run on iOS (macOS only)

```bash
yarn ios
```

## Test login

Open the app → enter `guest-101` / `passkey` → tap **Start**.

To test realtime messaging between users, open a second emulator/simulator and log in as `guest-102`.

## Using your own Qiscus App ID

Edit `src/client/QiscusClient.ts` line 9:
```ts
const APP_ID = 'your-app-id';
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Metro not starting | `yarn start --clear` |
| Build fails on Android | `cd android && ./gradlew clean && cd ..` |
| Type errors | `yarn type-check` for details |
