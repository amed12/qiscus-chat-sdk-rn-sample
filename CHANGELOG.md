# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.0] - 2025-11-13

### 🎉 Qiscus SDK v3 Migration

Complete migration to Qiscus SDK v3 with full TypeScript support and modern patterns.

### ⚠️ BREAKING CHANGES

- **Qiscus SDK**: Migrated from v2 to v3 (qiscus-sdk-javascript)
- **Message Properties**: Changed from snake_case to camelCase
  - `user_id` → `sender.id`
  - `message` → `text`
  - `unique_id` → `uniqueId`
  - `comment_before_id` → `previousMessageId`
- **SDK Methods**: Updated to v3 API
  - `init()` → `setup()`
  - `isLogin()` → `hasSetupUser()`
  - `getNonce()` → `getJWTNonce()`
- **Event Handling**: Now uses SDK's built-in event methods
  - `onMessageReceived()`
  - `onMessageDelivered()`
  - `onMessageRead()`
  - `onUserTyping()`
  - `onUserOnlinePresence()`

### Added

#### SDK v3 Features
- ✅ Official TypeScript types from SDK
- ✅ `IQMessage`, `IQChatRoom`, `IQAccount`, `IQUser` interfaces
- ✅ Room subscription management (`subscribeChatRoom`/`unsubscribeChatRoom`)
- ✅ Internal storage manipulation for session restoration
- ✅ Proper message generation with `generateMessage()`
- ✅ File attachment support with `generateFileAttachmentMessage()`

#### UI Improvements
- ✅ Auto-scroll to bottom on new messages
- ✅ Reversed message order (newest at bottom)
- ✅ Proper message bubble alignment
- ✅ Real-time message status updates

### Changed

#### Core Files Migrated
- **qiscus/index.ts**: Complete SDK v3 integration
- **qiscus/multichannelApi.ts**: Session restoration with internal storage
- **screens/ChatScreen.tsx**: Full TypeScript with SDK v3 types
- **screens/LoginScreen.tsx**: Proper type safety with `IQAccount`
- **components/MessageList.tsx**: SDK v3 message properties

#### Message Handling
- Messages now use `text` property instead of `message`
- User identification via `sender.id` instead of `user_id`
- Pagination uses `previousMessageId` instead of `comment_before_id`
- Proper `IQMessage` typing throughout

#### Session Management
- Added internal storage manipulation for session persistence
- Proper token storage and restoration
- Session survives app restarts

### Fixed

#### Critical Fixes
- ✅ **Session Restoration**: Added internal storage manipulation
  - `qiscus.storage.setAppId()`
  - `qiscus.storage.setCurrentUser()`
  - `qiscus.storage.setToken()`
- ✅ **Message Rendering**: Fixed property names for SDK v3
- ✅ **Room Subscription**: Added proper subscribe/unsubscribe lifecycle
- ✅ **Pagination**: Fixed `getPreviousMessagesById` parameter order
- ✅ **Message Order**: Reversed to show newest at bottom
- ✅ **Auto-scroll**: Implemented smooth scroll to latest message

#### Type Safety
- All screens now fully TypeScript
- No more `any` types for SDK objects
- Proper interface usage from official SDK types

### Removed
- ❌ All temporary migration documentation files
- ❌ Deprecated property names (snake_case)
- ❌ Legacy event handling patterns
- ❌ Debug panel (moved to production-ready state)

### Migration Notes

#### Key SDK v3 Patterns

**Session Restoration:**
```typescript
// Required for session persistence
await qiscus.setUserWithIdentityToken(token);
qiscus.storage.setAppId(appId);
qiscus.storage.setCurrentUser(userData);
qiscus.storage.setToken(token);
```

**Message Generation:**
```typescript
// Always generate message first
const message = qiscus.generateMessage({
  roomId: room.id,
  text: 'Hello'
});
await qiscus.sendMessage(message);
```

**Room Subscription:**
```typescript
// Subscribe when entering room
qiscus.subscribeChatRoom(room);

// Unsubscribe when leaving
qiscus.unsubscribeChatRoom(room);
```

**Event Handling:**
```typescript
// Use SDK's built-in methods
const subscription = qiscus.onMessageReceived((message) => {
  // Handle message
});

// Cleanup
subscription(); // Call to unsubscribe
```

### Documentation
- Consolidated to README.md and CHANGELOG.md only
- All migration details in this changelog
- Complete version history maintained

### Performance
- Improved message rendering with proper types
- Optimized event subscriptions
- Better memory management with proper cleanup

## [2.0.0] - 2025-11-12

### 🎉 Major Modernization Release

This release represents a complete modernization of the Qiscus Chat SDK React Native Sample app to be compatible with React Native 0.79+ and React 19.

### ⚠️ BREAKING CHANGES

- **Minimum React Native version**: Now requires React Native 0.79.2
- **Minimum React version**: Now requires React 19.0.0
- **Minimum Android SDK**: Increased from 21 to 24
- **Removed deprecated libraries**: xstream, css-to-rn.macro, reactive.macro
- **Navigation**: Migrated from React Navigation 4 to React Navigation 6
- **Package renames**: Several packages have been replaced with modern alternatives

### Added

#### Dependencies
- ✅ `@react-native-documents/picker@11.0.0` (replaces react-native-document-picker)
- ✅ `react-native-blob-util@0.23.2` (replaces rn-fetch-blob)
- ✅ `eventemitter3@5.0.1` for event handling
- ✅ `@react-navigation/native@6.1.18`
- ✅ `@react-navigation/native-stack@6.11.0`
- ✅ `react-native-safe-area-context@5.6.2`
- ✅ `react-native-screens@3.34.0`
- ✅ `@notifee/react-native@9.0.0` for notifications
- ✅ `@react-native-firebase/app@21.3.0`
- ✅ `@react-native-firebase/messaging@21.3.0`

#### Features
- EventEmitter bridge for Qiscus SDK callbacks
- Modern async/await patterns throughout
- Proper error handling and logging
- Enhanced notification support with Notifee
- Firebase Cloud Messaging integration
- Modern navigation with React Navigation 6

#### Documentation
- `MIGRATION_GUIDE.md` - Complete migration steps
- `TESTING_GUIDE.md` - Comprehensive testing scenarios
- `ANDROID_FIX.md` - Android build issue resolutions
- `RUNTIME_FIXES.md` - Runtime dependency fixes
- `COMMIT_CONVENTIONS.md` - Git commit standards
- `PHASE2_FINAL_SUMMARY.md` - Modernization summary
- `COMPLETE.md` - Project completion status

### Changed

#### Core Updates
- **React Native**: 0.70.x → 0.79.2
- **React**: 18.x → 19.0.0
- **Navigation**: React Navigation 4 → 6
- **ImagePicker**: Updated to modern API (`launchImageLibrary`)
- **Document Picker**: Migrated to new package name
- **Blob Utilities**: Migrated to maintained package

#### Code Modernization
- Replaced all `xstream` reactive streams with async/await
- Converted `css-to-rn.macro` to standard `StyleSheet.create`
- Removed `reactive.macro` usage, replaced with `React.useState`
- Updated `navigation.getParam` to `route.params`
- Modernized all component lifecycle methods
- Implemented proper TypeScript-ready patterns

#### Build Configuration
- Updated Gradle to 8.13
- Updated Android Gradle Plugin to 8.8.2
- Set minSdkVersion to 24 (was 21)
- Set compileSdkVersion to 35
- Set targetSdkVersion to 35
- Added multidex support
- Added Firebase configuration

### Removed

#### Deprecated Dependencies
- ❌ `xstream` - Replaced with async/await and EventEmitter
- ❌ `css-to-rn.macro` - Replaced with StyleSheet.create
- ❌ `reactive.macro` - Replaced with React.useState
- ❌ `react-native-document-picker` - Replaced with @react-native-documents/picker
- ❌ `rn-fetch-blob` - Replaced with react-native-blob-util

#### Deprecated Patterns
- Removed all macro-based code generation
- Removed reactive stream patterns
- Removed legacy navigation methods
- Removed deprecated ImagePicker API usage

### Fixed

#### Android Build Issues
- ✅ Fixed `GuardedResultAsyncTask` not found error
  - Root cause: react-native-document-picker incompatibility with RN 0.74+
  - Solution: Migrated to @react-native-documents/picker@11.0.0

- ✅ Fixed Yoga API compatibility error
  - Root cause: react-native-safe-area-context using deprecated API
  - Solution: Updated to version 5.6.2

- ✅ Fixed minSdkVersion conflict
  - Root cause: New packages require minSdk 24
  - Solution: Updated minSdkVersion from 21 to 24

- ✅ Fixed native module linking errors
  - Root cause: Stale build cache after package updates
  - Solution: Complete clean rebuild with cache reset

#### Runtime Issues
- ✅ Fixed "Unable to resolve module rn-fetch-blob"
  - Root cause: Deprecated package not installed
  - Solution: Installed react-native-blob-util

- ✅ Fixed "Cannot read property 'getConstants' of null"
  - Root cause: Native modules not properly linked
  - Solution: Clean rebuild with Metro cache reset

- ✅ Fixed "QiscusChatSDKRN has not been registered"
  - Root cause: Manual firebase.initializeApp() causing crash
  - Solution: Removed manual initialization (auto-initialized by package)

#### Code Quality
- Fixed all ESLint warnings
- Resolved deprecated API usage
- Fixed memory leaks in event listeners
- Improved error handling throughout

### Migration Notes

#### For Developers

**Before upgrading:**
1. Review `MIGRATION_GUIDE.md` for detailed steps
2. Backup your current codebase
3. Ensure you have the required development environment

**Key changes to be aware of:**
1. Navigation API has changed - update all navigation calls
2. Event handling now uses EventEmitter instead of xstream
3. Styles must use StyleSheet.create instead of macros
4. ImagePicker API has changed
5. Document picker package has been renamed

**After upgrading:**
1. Run `npm install` to update dependencies
2. Clean build folders: `npm run fresh`
3. Test all features according to `TESTING_GUIDE.md`

#### Breaking Changes Detail

**Navigation (React Navigation 6)**
```javascript
// OLD (v4)
navigation.getParam('roomId')
navigation.navigate('Chat', {roomId: 123})

// NEW (v6)
route.params.roomId
navigation.navigate('Chat', {roomId: 123}) // Same API
```

**Event Handling**
```javascript
// OLD (xstream)
import {qiscus, login$} from 'qiscus';
login$.addListener({next: (data) => {...}})

// NEW (EventEmitter)
import {qiscus, qiscusEvents} from 'qiscus';
qiscusEvents.on('login-success', (data) => {...})
```

**Styles**
```javascript
// OLD (macro)
import css from 'css-to-rn.macro';
const styles = css`color: red; font-size: 16px;`;

// NEW (StyleSheet)
import {StyleSheet} from 'react-native';
const styles = StyleSheet.create({
  text: {color: 'red', fontSize: 16}
});
```

**Document Picker**
```javascript
// OLD
import DocumentPicker from 'react-native-document-picker';

// NEW
import DocumentPicker from '@react-native-documents/picker';
// API remains the same
```

**File Operations**
```javascript
// OLD
import RNFetchBlob from 'rn-fetch-blob';
const {dirs} = RNFetchBlob.fs;

// NEW
import ReactNativeBlobUtil from 'react-native-blob-util';
const {dirs} = ReactNativeBlobUtil.fs;
// API remains the same
```

### Performance Improvements

- Reduced bundle size by removing unused dependencies
- Improved app startup time with modern async patterns
- Optimized re-renders with proper React hooks usage
- Better memory management without reactive streams

### Security

- Updated all dependencies to latest secure versions
- Removed deprecated packages with known vulnerabilities
- Improved Firebase security configuration
- Added proper permission handling for Android

### Testing

- Created comprehensive testing guide
- Added test scenarios for all major features
- Documented common issues and solutions
- Provided troubleshooting steps

## [1.0.0] - Previous Version

### Initial Release
- Basic Qiscus Chat SDK integration
- React Native 0.70.x support
- React Navigation 4
- Firebase messaging
- Push notifications

---

## Version History Summary

| Version | Date | React Native | React | Qiscus SDK | Major Changes |
|---------|------|--------------|-------|------------|---------------|
| 3.0.0 | 2025-11-13 | 0.79.2 | 19.0.0 | v3 | SDK v3 migration + TypeScript |
| 2.0.0 | 2025-11-12 | 0.79.2 | 19.0.0 | v2 | Complete modernization |
| 1.0.0 | Previous | 0.70.x | 18.x | v2 | Initial release |

## Upgrade Path

- **From 2.0.0 to 3.0.0**: SDK v3 migration - See v3.0.0 release notes above
- **From 1.0.0 to 2.0.0**: Complete modernization - See v2.0.0 release notes
- **Future updates**: Will follow semantic versioning

## Support

For issues, questions, or contributions:
- Check README.md troubleshooting section
- Review this CHANGELOG for migration details
- Follow conventional commits for contributions

---

**Note**: This changelog follows [Keep a Changelog](https://keepachangelog.com/) format and [Semantic Versioning](https://semver.org/).
