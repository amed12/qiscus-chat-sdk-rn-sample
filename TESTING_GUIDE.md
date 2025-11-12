# 🧪 Testing Guide - Phase 3

## 🎯 Objective
Test the modernized React Native 0.79 app to ensure all features work correctly after Phase 2 modernization.

## ✅ Pre-Testing Checklist

### 1. Dependencies Installed
```bash
# Check node_modules exists
ls node_modules | wc -l  # Should show ~1000+ packages

# Verify key packages
npm list react-native
npm list @react-navigation/native
npm list eventemitter3
npm list @notifee/react-native
```

### 2. iOS Setup (Mac only)
```bash
cd ios
pod install
cd ..

# Verify workspace created
ls ios/*.xcworkspace
```

### 3. Android Setup
```bash
# Verify google-services.json exists
ls android/app/google-services.json

# Clean build
cd android
./gradlew clean
cd ..
```

### 4. Firebase Configuration
- [ ] iOS: `GoogleService-Info.plist` in `ios/qiscuschatsdkrn/`
- [ ] Android: `google-services.json` in `android/app/`
- [ ] Firebase project has FCM enabled
- [ ] APNs certificate uploaded (iOS)

## 🚀 Running the App

### Start Metro Bundler
```bash
# Terminal 1
npm start

# Or with cache reset
npm run reset
```

### Run on Android
```bash
# Terminal 2
npm run android

# Or manually
npx react-native run-android
```

### Run on iOS
```bash
# Terminal 2
npm run ios

# Or specific simulator
npx react-native run-ios --simulator="iPhone 15 Pro"
```

## 🧪 Test Scenarios

### Phase 3.1: Basic Functionality ⚡

#### Test 1: App Launch
- [ ] App launches without crashes
- [ ] No red screen errors
- [ ] No yellow warnings about deprecated APIs
- [ ] Login screen appears

**Expected:** Clean launch, login screen visible

#### Test 2: Authentication
- [ ] Can enter user ID and password
- [ ] Login button works
- [ ] Shows loading state during login
- [ ] Navigates to room list on success
- [ ] Shows error on failure

**Test Credentials:**
- User ID: `guest-101`
- Password: `passkey`

#### Test 3: Navigation
- [ ] Can navigate to room list
- [ ] Can open user list
- [ ] Can go back from screens
- [ ] Navigation transitions are smooth
- [ ] No navigation errors in console

### Phase 3.2: Core Features 📱

#### Test 4: Room List
- [ ] Room list loads
- [ ] Shows room names and avatars
- [ ] Shows last message preview
- [ ] Shows unread count (if any)
- [ ] Can tap to open room

**Check Console:** No errors about `navigation.getParam`

#### Test 5: Chat Screen
- [ ] Chat screen opens with room ID
- [ ] Messages load
- [ ] Can scroll through messages
- [ ] Can send text message
- [ ] Message appears in chat
- [ ] Can send image (test image picker)
- [ ] Can send file (test document picker)

**Check Console:** 
- EventEmitter events firing: `new-messages`, `comment-delivered`, `comment-read`
- No xstream errors

#### Test 6: Real-Time Features
- [ ] Typing indicator works
- [ ] Online presence shows
- [ ] New messages appear automatically
- [ ] Read receipts update
- [ ] Delivered status updates

**Test Method:** 
1. Open same room on web dashboard
2. Send message from web
3. Should appear in app immediately

#### Test 7: User Management
- [ ] User list loads
- [ ] Can search users
- [ ] Can start 1-on-1 chat
- [ ] Can create group chat
- [ ] Can add participants
- [ ] Can remove participants (if admin)

#### Test 8: Profile
- [ ] Profile screen shows user info
- [ ] Can edit display name
- [ ] Can change avatar (test image picker)
- [ ] Avatar uploads successfully
- [ ] Can logout
- [ ] Logout returns to login screen

### Phase 3.3: Push Notifications 🔔

#### Test 9: Notification Permissions
- [ ] App requests notification permission
- [ ] Permission dialog appears
- [ ] Can grant permission
- [ ] FCM token registered

**Check Console:** Look for FCM token log

#### Test 10: Foreground Notifications
- [ ] Receive notification while app open
- [ ] Notification shows in-app (Notifee)
- [ ] Can tap notification
- [ ] Opens correct chat room

#### Test 11: Background Notifications
- [ ] Put app in background
- [ ] Send message from another device
- [ ] Notification appears in notification center
- [ ] Tap notification opens app
- [ ] Opens correct chat room

#### Test 12: Killed App Notifications
- [ ] Force close app
- [ ] Send message from another device
- [ ] Notification appears
- [ ] Tap notification launches app
- [ ] Opens correct chat room

### Phase 3.4: Edge Cases 🔍

#### Test 13: Network Issues
- [ ] Turn off WiFi
- [ ] App shows appropriate error
- [ ] Turn on WiFi
- [ ] App reconnects automatically
- [ ] Messages sync

#### Test 14: App State
- [ ] Minimize app
- [ ] Reopen app
- [ ] State preserved
- [ ] No crashes

#### Test 15: Memory & Performance
- [ ] Open multiple rooms
- [ ] Send multiple messages
- [ ] No memory leaks
- [ ] Smooth scrolling
- [ ] No lag

## 🐛 Common Issues & Solutions

### Issue: App Won't Build

**Android:**
```bash
cd android
./gradlew clean
cd ..
rm -rf node_modules
npm install
npm run android
```

**iOS:**
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Issue: Metro Bundler Errors
```bash
# Clear all caches
watchman watch-del-all
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
npm start -- --reset-cache
```

### Issue: "Cannot find module"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Navigation Errors
**Check for:**
- `navigation.getParam` → Should be `route.params`
- Missing route params
- Incorrect screen names

### Issue: EventEmitter Not Working
**Check:**
```javascript
// In app/qiscus/index.js
console.log('Qiscus init called');

// In screens
console.log('Listener count:', qiscusEvents.listenerCount('new-messages'));
```

### Issue: Push Notifications Not Working
**Check:**
1. Firebase config files in place
2. FCM token in console
3. Notification permissions granted
4. Test with Firebase Console first

## 📊 Test Results Template

### Device Information
- **Device:** iPhone 15 Pro / Pixel 7
- **OS Version:** iOS 17.0 / Android 14
- **App Version:** 0.0.1
- **React Native:** 0.79.2

### Test Results

| Test # | Feature | Status | Notes |
|--------|---------|--------|-------|
| 1 | App Launch | ✅/❌ | |
| 2 | Authentication | ✅/❌ | |
| 3 | Navigation | ✅/❌ | |
| 4 | Room List | ✅/❌ | |
| 5 | Chat Screen | ✅/❌ | |
| 6 | Real-Time | ✅/❌ | |
| 7 | User Management | ✅/❌ | |
| 8 | Profile | ✅/❌ | |
| 9 | Notification Permissions | ✅/❌ | |
| 10 | Foreground Notifications | ✅/❌ | |
| 11 | Background Notifications | ✅/❌ | |
| 12 | Killed App Notifications | ✅/❌ | |
| 13 | Network Issues | ✅/❌ | |
| 14 | App State | ✅/❌ | |
| 15 | Performance | ✅/❌ | |

### Issues Found
1. 
2. 
3. 

### Console Errors
```
[Paste any console errors here]
```

## 🎯 Success Criteria

### Must Pass (Critical)
- ✅ App launches without crashes
- ✅ Can login successfully
- ✅ Can view room list
- ✅ Can open and view chat
- ✅ Can send messages
- ✅ Real-time messaging works

### Should Pass (Important)
- ✅ Push notifications work
- ✅ Navigation is smooth
- ✅ No deprecated API warnings
- ✅ Image/file upload works
- ✅ Profile updates work

### Nice to Have
- ✅ Typing indicators work
- ✅ Online presence works
- ✅ Group management works
- ✅ No memory leaks

## 📝 Testing Workflow

### Day 1: Basic Testing
1. Install and run on both platforms
2. Test authentication
3. Test navigation
4. Test basic chat functionality

### Day 2: Feature Testing
1. Test real-time features
2. Test user management
3. Test profile features
4. Test file uploads

### Day 3: Notification Testing
1. Test notification permissions
2. Test foreground notifications
3. Test background notifications
4. Test notification actions

### Day 4: Edge Cases & Performance
1. Test network issues
2. Test app state management
3. Test performance
4. Fix any issues found

## 🚀 Next Steps After Testing

### If All Tests Pass ✅
1. Update MIGRATION_GUIDE.md
2. Mark Phase 3 as complete
3. Proceed to Phase 4 (optional improvements)
4. Deploy to staging/production

### If Tests Fail ❌
1. Document all issues
2. Prioritize critical bugs
3. Fix issues one by one
4. Re-test after fixes
5. Repeat until all pass

## 📞 Getting Help

### Check These First
1. Console logs for errors
2. QISCUS_EVENT_ARCHITECTURE.md for event system
3. MIGRATION_GUIDE.md for patterns
4. PHASE2_FINAL_SUMMARY.md for what changed

### Debug Commands
```bash
# Check installed packages
npm list

# Check for outdated packages
npm outdated

# Verify React Native version
npx react-native --version

# Check Metro bundler
npx react-native start --verbose
```

---

**Ready to test!** Start with Phase 3.1 (Basic Functionality) and work through each test scenario. 🧪
