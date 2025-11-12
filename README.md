# Qiscus Chat SDK React Native Sample

A modern React Native sample application demonstrating Qiscus Chat SDK integration with React Native 0.79+.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Node Modules Management](#node-modules-management)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

## ✨ Features

- ✅ React Native 0.79+ compatible
- ✅ React Navigation 6 (Native Stack)
- ✅ Firebase Cloud Messaging integration
- ✅ Modern push notifications (Notifee)
- ✅ TypeScript support
- ✅ Modern state management ready (Zustand)
- ✅ File & image picker integration
- ✅ Comprehensive testing setup

## 🔧 Prerequisites

- Node.js >= 18
- npm or yarn
- React Native development environment
  - For iOS: Xcode 14+, CocoaPods
  - For Android: Android Studio, JDK 17+
- Firebase project with FCM enabled

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Clean install (recommended after cloning)
rm -rf node_modules package-lock.json yarn.lock
npm install

# Install iOS pods (Mac only)
cd ios
pod install
cd ..
```

### 2. Firebase Configuration

#### iOS
1. Download `GoogleService-Info.plist` from Firebase Console
2. Place in `ios/qiscuschatsdkrn/` directory
3. Open Xcode and add to project

#### Android
1. Download `google-services.json` from Firebase Console
2. Place in `android/app/` directory

### 3. Run the App

```bash
# Start Metro bundler
npm start

# Run on Android (in new terminal)
npm run android

# Run on iOS (in new terminal)
npm run ios
```

## 📦 Node Modules Management

### Best Practices for Resetting Dependencies

#### After Major Dependency Changes (Recommended Now)
```bash
# Complete clean reset
rm -rf node_modules package-lock.json yarn.lock
npm install

# iOS pods
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Clear Metro cache
npx react-native start --reset-cache
```

#### Daily Development (Fast)
```bash
# Just clear Metro cache
npx react-native start --reset-cache

# Or restart Metro
npm start
```

#### When Teammates Update Dependencies
```bash
# Fast clean install using lock file
npm ci

# iOS pods
cd ios && pod install && cd ..
```

#### Nuclear Option (When Everything Breaks)
```bash
# Clear everything
rm -rf node_modules package-lock.json yarn.lock
npm cache clean --force
npm install

# iOS
cd ios
rm -rf Pods Podfile.lock
pod deintegrate
pod install
cd ..

# Clear all caches
watchman watch-del-all
rm -rf $TMPDIR/react-*
npx react-native start --reset-cache
```

### Helper Scripts

These scripts are already configured in `package.json`:

```bash
# Development
npm start              # Start Metro bundler
npm run android        # Run on Android
npm run ios            # Run on iOS

# Cleaning (in safe order)
npm run clean:android  # Clean Android build (needs node_modules)
npm run clean:ios      # Remove iOS pods
npm run clean:cache    # Clear watchman and temp files
npm run clean          # Remove node_modules and lock file
npm run clean:all      # All of the above in correct order

# Maintenance
npm run fresh          # Complete clean + reinstall + pods
npm run reset          # Clear Metro cache only (fastest)

# Quality
npm run lint           # Run ESLint
npm run typecheck      # Run TypeScript checks
npm test               # Run tests
```

**Important:** Scripts run in the correct order to avoid gradle errors!

### When to Reset Node Modules

**✅ DO reset when:**
- Added/removed dependencies
- Updated major versions
- After merging branches with dependency changes
- "Module not found" errors persist
- After pulling major updates (like this modernization)

**❌ DON'T reset when:**
- Just changed code (not dependencies)
- Metro bundler errors (just clear cache)
- Switching branches without dependency changes
- Minor code changes

### Performance Tips

```bash
# Fastest: Use npm ci when lock file exists
npm ci  # 3-10x faster than npm install

# Alternative: Use yarn (generally faster)
yarn install

# Clear only Metro cache (very fast)
npx react-native start --reset-cache
```

## 📁 Project Structure

```
qiscus-chat-sdk-rn-sample/
├── app/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── qiscus/          # Qiscus SDK integration
│   └── utils/           # Helper functions
├── assets/              # Images, fonts, etc.
├── android/             # Android native code
├── ios/                 # iOS native code
├── __tests__/           # Test files
├── App.js               # Root component
├── index.js             # Entry point
└── [config files]       # babel, metro, jest, etc.
```

## ⚙️ Configuration

### TypeScript
TypeScript is configured but migration is in progress. You can:
- Use `.js` files (current)
- Gradually migrate to `.ts`/`.tsx`
- Run type checking: `npm run typecheck`

### Path Aliases
Configured in `babel.config.js` and `tsconfig.json`:
```javascript
import Component from 'components/Component';
import Screen from 'screens/Screen';
import {qiscus} from 'qiscus';
import helper from 'utils/helper';
```

### Environment Variables (Optional)
Create `.env` file:
```env
QISCUS_APP_ID=your_app_id
API_BASE_URL=https://api.example.com
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm start              # Start Metro bundler
npm run android        # Run on Android
npm run ios            # Run on iOS

# Quality
npm run lint           # Run ESLint
npm run typecheck      # Run TypeScript checks
npm test               # Run tests

# Maintenance
npm run clean          # Remove node_modules
npm run fresh          # Complete reinstall
npm run reset          # Clear Metro cache
```

### Code Style

- ESLint configured for TypeScript + React Hooks
- Prettier for formatting
- Conventional commits recommended

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## 🐛 Troubleshooting

### Common Issues

#### Gradle error: "Included build 'node_modules/@react-native/gradle-plugin' does not exist"
**Cause:** Trying to run `./gradlew clean` after `node_modules` was deleted.

**Solution:**
```bash
# Install dependencies first
npm install

# Then you can use clean scripts
npm run clean:all
npm run fresh
```

**Note:** Our scripts now run in the correct order to prevent this!

#### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
npx react-native start --reset-cache
```

#### iOS build fails
```bash
cd ios
pod deintegrate
pod install
cd ..
```

#### Android build fails
```bash
cd android
./gradlew clean
cd ..
npm run android
```

#### Push notifications not working
1. Verify Firebase config files are in place
2. Check permissions are granted
3. Test with Firebase Console first
4. Check FCM token in console logs

#### Navigation errors
Update screen components to use React Navigation 6 syntax.
See `SCREEN_MIGRATION_REFERENCE.md` for details.

### Debug Tools

```bash
# Enable debug menu
# iOS: Cmd + D
# Android: Cmd + M (Mac) or Ctrl + M (Windows/Linux)

# React DevTools
npx react-devtools

# Check what's installed
npm list react-native
npm list @react-navigation/native

# Check for outdated packages
npm outdated
```

### Clear All Caches

```bash
# Complete cache clear
watchman watch-del-all
rm -rf $TMPDIR/react-*
rm -rf node_modules
npm cache clean --force
npm install
npx react-native start --reset-cache
```

## 📚 Documentation

Comprehensive guides are available:

- **[QUICK_START.md](QUICK_START.md)** - Installation and setup
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Complete migration details
- **[SCREEN_MIGRATION_REFERENCE.md](SCREEN_MIGRATION_REFERENCE.md)** - Screen component updates
- **[CRITICAL_PHASE_COMPLETE.md](CRITICAL_PHASE_COMPLETE.md)** - Modernization summary

## 🔄 Recent Updates

### Phase 1: Critical Modernization (Completed)

- ✅ Updated to React Native 0.79
- ✅ Migrated to React Navigation 6
- ✅ Modernized push notifications (Notifee)
- ✅ Added TypeScript support
- ✅ Updated all configurations
- ✅ Added 15+ missing dependencies

### Next Steps

1. Update screen components (navigation params)
2. Remove xstream dependencies
3. Migrate to TypeScript
4. Implement Zustand state management

See `MIGRATION_GUIDE.md` for detailed roadmap.

## 🏗️ Architecture

### Navigation
- React Navigation 6 (Native Stack)
- Type-safe navigation (TypeScript ready)
- Custom transitions

### State Management
- Zustand ready (not yet implemented)
- React hooks for local state
- Context API for global state

### Push Notifications
- Firebase Cloud Messaging
- Notifee for local notifications
- Background and foreground handling

### SDK Integration
- Qiscus SDK Core v2.12.5
- Custom hooks for SDK operations
- Event-driven architecture

## 🤝 Contributing

1. Follow the code style (ESLint + Prettier)
2. Write tests for new features
3. Update documentation
4. Use conventional commits

## 📄 License

[Your License Here]

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review the migration guides
3. Clear caches and rebuild
4. Check Firebase configuration
5. Verify all dependencies are installed

## 🔗 Resources

- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Firebase Setup](https://rnfirebase.io/)
- [Notifee Documentation](https://notifee.app/)
- [Qiscus Documentation](https://documentation.qiscus.com/)

## 📊 Project Status

- **React Native Version:** 0.79.2
- **Navigation:** React Navigation 6
- **State Management:** In migration (xstream → Zustand)
- **TypeScript:** Configured, migration in progress
- **Testing:** Jest + React Native Testing Library

---

**Built with ❤️ using React Native 0.79**
