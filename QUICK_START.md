# 🚀 Quick Start Guide

## Prerequisites
- Node.js >= 18
- React Native development environment setup
- Firebase project with FCM enabled

## Installation (5 minutes)

### 1. Install Dependencies
```bash
# Clean install
rm -rf node_modules package-lock.json yarn.lock
npm install

# Install iOS pods
cd ios
pod install
cd ..
```

### 2. Firebase Configuration

#### Download Config Files
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Download configuration files:
   - **iOS:** `GoogleService-Info.plist`
   - **Android:** `google-services.json`

#### iOS Setup
```bash
# Copy the file to iOS directory
cp /path/to/GoogleService-Info.plist ios/qiscuschatsdkrn/

# Open in Xcode to verify
open ios/qiscuschatsdkrn.xcworkspace
```

In Xcode:
1. Right-click on project
2. Add Files to "qiscuschatsdkrn"
3. Select `GoogleService-Info.plist`
4. Ensure "Copy items if needed" is checked

#### Android Setup
```bash
# Copy the file to Android app directory
cp /path/to/google-services.json android/app/
```

Verify `android/app/build.gradle` has:
```gradle
apply plugin: "com.google.gms.google-services"
```

### 3. Update Android Build (if needed)

Check `android/build.gradle` has:
```gradle
buildscript {
    dependencies {
        classpath("com.google.gms:google-services:4.4.2")
    }
}
```

## Running the App

### Start Metro Bundler
```bash
npm start
```

### Run on Android
```bash
# In a new terminal
npm run android

# Or with specific device
npx react-native run-android --deviceId=DEVICE_ID
```

### Run on iOS
```bash
# In a new terminal
npm run ios

# Or with specific simulator
npx react-native run-ios --simulator="iPhone 15 Pro"
```

## Quick Fixes

### Clear Cache
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clear all caches
npm start -- --reset-cache
watchman watch-del-all
rm -rf $TMPDIR/react-*
```

### Rebuild iOS
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npm run ios
```

### Rebuild Android
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Fix Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
npx react-native start --reset-cache
```

## Testing Push Notifications

### Get FCM Token
Check console logs after app starts:
```
FCM Token: YOUR_TOKEN_HERE
```

### Send Test Notification
Use Firebase Console:
1. Go to Cloud Messaging
2. Click "Send your first message"
3. Enter notification details
4. Select your app
5. Send

Or use curl:
```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "YOUR_FCM_TOKEN",
    "notification": {
      "title": "Test",
      "body": "Test message"
    },
    "data": {
      "payload": "{\"message\":\"Test message\"}"
    }
  }'
```

## Development Commands

```bash
# Start development
npm start

# Run on devices
npm run android
npm run ios

# Type checking
npm run typecheck

# Linting
npm run lint

# Testing
npm test

# Clean and reinstall
rm -rf node_modules && npm install
```

## Common Issues

### Issue: "Unable to resolve module"
```bash
npm install
npx react-native start --reset-cache
```

### Issue: "Command PhaseScriptExecution failed" (iOS)
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Issue: "Execution failed for task ':app:processDebugGoogleServices'" (Android)
- Ensure `google-services.json` is in `android/app/`
- Check file is valid JSON
- Verify package name matches

### Issue: Push notifications not working
1. Check Firebase config files are in place
2. Verify permissions are granted
3. Check FCM token is generated
4. Test with Firebase Console first

### Issue: Navigation errors
Update screen components - see `SCREEN_MIGRATION_REFERENCE.md`

## Next Steps

After successful installation:

1. ✅ **Test basic navigation** - Login → Room List → Chat
2. ✅ **Test push notifications** - Send test notification
3. ⏳ **Update screen components** - See `SCREEN_MIGRATION_REFERENCE.md`
4. ⏳ **Remove xstream** - See `MIGRATION_GUIDE.md`
5. ⏳ **Add TypeScript** - Gradual migration

## Useful Scripts

```bash
# Check what's installed
npm list react-native
npm list @react-navigation/native

# Update specific package
npm update package-name

# Check for outdated packages
npm outdated

# Audit dependencies
npm audit
npm audit fix
```

## Debug Mode

### Enable Debug Menu
- **iOS:** Cmd + D
- **Android:** Cmd + M (Mac) or Ctrl + M (Windows/Linux)

### Enable Remote Debugging
1. Open Debug Menu
2. Select "Debug"
3. Chrome DevTools will open

### React DevTools
```bash
npx react-devtools
```

## Production Build

### Android
```bash
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

### iOS
1. Open Xcode: `open ios/qiscuschatsdkrn.xcworkspace`
2. Select "Any iOS Device"
3. Product → Archive
4. Follow distribution steps

## Environment Variables (Optional)

Create `.env` file:
```env
QISCUS_APP_ID=your_app_id
API_BASE_URL=https://api.example.com
```

Install dotenv:
```bash
npm install react-native-dotenv
```

## Resources

- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Firebase Setup](https://rnfirebase.io/)
- [Notifee Docs](https://notifee.app/)

## Support

If you encounter issues:
1. Check `MIGRATION_GUIDE.md`
2. Check `CRITICAL_PHASE_COMPLETE.md`
3. Clear cache and rebuild
4. Check Firebase configuration

---

**Ready to go!** 🚀
