# Migration Guide - React Native 0.79 Modernization

## 🎯 Overview
This guide covers the critical Phase 1 updates to modernize the Qiscus Chat SDK React Native sample app for React Native 0.79+ compatibility.

## ✅ Completed Changes

### 1. Dependencies Updated
- ✅ Added React Navigation 6 (replaced deprecated v4)
- ✅ Added Firebase Messaging v21+
- ✅ Added Notifee (replaced react-native-push-notification)
- ✅ Added AsyncStorage, Document Picker, Image Picker
- ✅ Added Zustand for state management
- ✅ Added TypeScript support
- ✅ Added proper ESLint and testing setup

### 2. Configuration Files Updated
- ✅ `package.json` - All dependencies added
- ✅ `babel.config.js` - Modern preset, module resolver
- ✅ `metro.config.js` - RN 0.79 pattern
- ✅ `tsconfig.json` - Created with path mappings
- ✅ `.eslintrc.js` - TypeScript + React Hooks rules
- ✅ `jest.config.js` - TypeScript + module mappings
- ✅ `jest.setup.js` - Created with mocks

### 3. Core Files Migrated
- ✅ `App.js` - React Navigation 6 + Notifee
- ✅ `index.js` - Modern push notification handling

## 📦 Installation Steps

### Step 1: Clean Install
```bash
# Remove old dependencies
rm -rf node_modules package-lock.json yarn.lock

# Install new dependencies
npm install
# or
yarn install
```

### Step 2: iOS Setup
```bash
cd ios
pod install
cd ..
```

### Step 3: Android Setup
No additional steps needed for Android. The gradle files are already configured.

### Step 4: Firebase Configuration

#### iOS
1. Download `GoogleService-Info.plist` from Firebase Console
2. Add it to `ios/qiscuschatsdkrn/` directory
3. Open Xcode and add the file to the project

#### Android
1. Download `google-services.json` from Firebase Console
2. Place it in `android/app/` directory

### Step 5: Update Android Build Files (if needed)

Ensure `android/build.gradle` has:
```gradle
buildscript {
    dependencies {
        classpath("com.google.gms:google-services:4.4.2")
    }
}
```

Ensure `android/app/build.gradle` has:
```gradle
apply plugin: "com.google.gms.google-services"
```

## 🚀 Running the App

### Development
```bash
# Start Metro
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

## 🔄 What Changed

### Navigation
**Before (react-navigation v4):**
```javascript
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

const AppNavigator = createStackNavigator({...});
const AppContainer = createAppContainer(AppNavigator);
```

**After (React Navigation 6):**
```javascript
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

<NavigationContainer>
  <Stack.Navigator>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
</NavigationContainer>
```

### Push Notifications
**Before (react-native-push-notification):**
```javascript
import PushNotification from 'react-native-push-notification';

PushNotification.configure({
  onRegister: (token) => {...},
  onNotification: (notification) => {...},
});
```

**After (Notifee + Firebase):**
```javascript
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

// Background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  await notifee.displayNotification({...});
});

// Foreground handler
messaging().onMessage(async remoteMessage => {
  await notifee.displayNotification({...});
});
```

## ⚠️ Breaking Changes

### 1. Navigation Props
Screens now receive navigation via hooks or props differently:

**Before:**
```javascript
this.props.navigation.navigate('Screen');
```

**After (same, but also can use hooks):**
```javascript
// In functional components
import {useNavigation} from '@react-navigation/native';
const navigation = useNavigation();
navigation.navigate('Screen');
```

### 2. Route Params
**Before:**
```javascript
const roomId = this.props.navigation.getParam('roomId', null);
```

**After:**
```javascript
// Using route prop
const roomId = route.params?.roomId ?? null;

// Or using hook
import {useRoute} from '@react-navigation/native';
const route = useRoute();
const roomId = route.params?.roomId ?? null;
```

### 3. Push Notifications
- `react-native-push-notification` removed
- Use `@notifee/react-native` for local notifications
- Use `@react-native-firebase/messaging` for FCM

## 🔧 Next Steps

### Phase 2: Component Modernization ✅ COMPLETE!
1. ✅ All screens updated to React Navigation 6
2. ✅ Replace xstream with modern patterns (EventEmitter bridge)
3. ✅ Remove css-to-rn.macro from all screens
4. ✅ Update to modern APIs (ImagePicker, AsyncStorage)
5. ⏳ Convert to TypeScript (optional)
6. ⏳ Implement custom hooks (optional)

### Phase 3: Testing & Deployment (NEXT)
1. **Test on iOS device/simulator**
2. **Test on Android device/emulator**
3. Test push notifications
4. Test all navigation flows
5. Test real-time messaging
6. Fix any runtime issues

### Phase 4: Code Quality (Future)
1. Add error boundaries
2. Implement proper loading states
3. Add unit tests
4. Performance optimization
5. Convert to TypeScript
6. Implement Zustand state management

## 📝 Migration Checklist

### Phase 1: Critical Setup ✅
- [x] Update package.json
- [x] Update Babel config
- [x] Update Metro config
- [x] Create TypeScript config
- [x] Update ESLint config
- [x] Update Jest config
- [x] Migrate App.js to React Navigation 6
- [x] Update push notification setup

### Phase 2: Modernization ✅ COMPLETE!
- [x] Remove xstream dependencies from core files
- [x] Create EventEmitter bridge for Qiscus events
- [x] Update ChatScreen (navigation + events)
- [x] Update RoomListScreen (navigation + events)
- [x] Update LoginScreen (both versions)
- [x] Update UserListScreen (removed xstream, css-to-rn.macro)
- [x] Update CreateGroupScreen (already clean)
- [x] Update RoomInfoScreen (removed xstream, css-to-rn.macro, route.params)
- [x] Update ProfileScreen (modern ImagePicker API)
- [x] Remove all css-to-rn.macro usage
- [x] Update to modern async/await patterns
- [ ] Convert to TypeScript (optional - Phase 4)
- [ ] Add state management Zustand (optional - Phase 4)

### Phase 3: Testing 🧪
- [ ] Test on iOS
- [ ] Test on Android
- [ ] Test push notifications
- [ ] Test navigation flows

## 🐛 Known Issues & Solutions

### Issue: Navigation not working
**Solution:** Make sure all screen components are updated to use React Navigation 6 props/hooks.

### Issue: Push notifications not showing
**Solution:** 
1. Verify Firebase configuration files are in place
2. Check notification permissions
3. Ensure notification channel is created (Android)

### Issue: Module not found errors
**Solution:** 
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx react-native start --reset-cache
```

### Issue: iOS build fails
**Solution:**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

## 📚 Resources

- [React Navigation 6 Docs](https://reactnavigation.org/docs/getting-started)
- [React Native Firebase](https://rnfirebase.io/)
- [Notifee Documentation](https://notifee.app/)
- [React Native 0.79 Release Notes](https://reactnative.dev/blog)

## 🆘 Support

If you encounter issues:
1. Check the console logs for specific errors
2. Verify all dependencies are installed correctly
3. Ensure Firebase configuration is correct
4. Clear cache and rebuild

## 📊 Performance Improvements

The new architecture provides:
- ✅ Better navigation performance (Native Stack)
- ✅ Improved notification handling
- ✅ Better TypeScript support
- ✅ Modern build tooling
- ✅ Smaller bundle size (removed unused deps)
