# 🚀 Workflow Cheatsheet

Quick reference for common development tasks.

## 📦 Installation & Setup

### First Time Setup
```bash
# 1. Clone and install
git clone <repo>
cd qiscus-chat-sdk-rn-sample
npm install

# 2. iOS setup (Mac only)
cd ios
pod install
cd ..

# 3. Add Firebase config files
# iOS: GoogleService-Info.plist → ios/qiscuschatsdkrn/
# Android: google-services.json → android/app/

# 4. Run
npm start
npm run android  # or npm run ios
```

### After Pulling Updates
```bash
# If package.json changed
npm install
cd ios && pod install && cd ..

# If only code changed
npm start
```

## 🔄 Node Modules Reset

### ⚠️ IMPORTANT: Script Execution Order

**Why order matters:**
- `./gradlew clean` needs files from `node_modules/@react-native/gradle-plugin`
- Must run gradle BEFORE deleting node_modules
- Our scripts handle this automatically!

### Quick Reference

```bash
# 1. Fastest - Cache only (no reinstall)
npm run reset

# 2. Fast - Clean builds (keeps node_modules)
npm run clean:android
npm run clean:ios

# 3. Medium - Clean everything except node_modules
npm run clean:cache

# 4. Full - Clean all builds + node_modules
npm run clean:all

# 5. Nuclear - Clean + reinstall + pods
npm run fresh
```

### Detailed Breakdown

#### 1️⃣ Reset Metro Cache (Fastest - 5 seconds)
```bash
npm run reset
# Clears: Metro bundler cache only
# Keeps: Everything else
# Use when: Code changes, hot reload issues
```

#### 2️⃣ Clean Android Build (Fast - 10-30 seconds)
```bash
npm run clean:android
# Clears: Android build folder
# Keeps: node_modules, iOS, caches
# Use when: Android build issues
```

#### 3️⃣ Clean iOS Pods (Fast - 5 seconds)
```bash
npm run clean:ios
# Clears: iOS Pods, Podfile.lock
# Keeps: node_modules, Android, caches
# Use when: iOS build issues
# Note: Run 'pod install' after
```

#### 4️⃣ Clean Caches (Medium - 10 seconds)
```bash
npm run clean:cache
# Clears: Watchman, temp files, Metro cache
# Keeps: node_modules, builds
# Use when: Weird caching issues
```

#### 5️⃣ Clean Node Modules (Medium - 10 seconds)
```bash
npm run clean
# Clears: node_modules, package-lock.json
# Keeps: Builds, caches
# Use when: Dependency issues
# Note: Run 'npm install' after
```

#### 6️⃣ Clean All (Full - 1 minute)
```bash
npm run clean:all
# Order: Android → iOS → Cache → node_modules
# Clears: Everything!
# Use when: Major issues, after updates
# Note: Run 'npm install' after
```

#### 7️⃣ Fresh Install (Nuclear - 2-5 minutes)
```bash
npm run fresh
# Does: clean:all + npm install + pod install
# Clears: Everything and reinstalls
# Use when: Major dependency changes, broken state
```

## 🎯 When to Use What

### Daily Development
```bash
# Just start developing
npm start
npm run android  # or ios

# Hot reload not working?
npm run reset
```

### After Git Pull
```bash
# Check if package.json changed
git diff HEAD@{1} package.json

# If yes:
npm install
cd ios && pod install && cd ..

# If no:
npm start
```

### Dependency Changes
```bash
# You added/removed packages
npm install
cd ios && pod install && cd ..

# Teammate added/removed packages
npm ci  # Faster, uses lock file
cd ios && pod install && cd ..
```

### Build Issues
```bash
# Android build fails
npm run clean:android
npm run android

# iOS build fails
npm run clean:ios
cd ios && pod install && cd ..
npm run ios

# Both failing
npm run clean:all
npm install
cd ios && pod install && cd ..
```

### Nuclear Option
```bash
# Everything is broken
npm run fresh

# Still broken? Super nuclear:
npm run clean:all
npm cache clean --force
npm install
cd ios && pod deintegrate && pod install && cd ..
npx react-native start --reset-cache
```

## 🚨 Common Mistakes

### ❌ DON'T DO THIS:
```bash
# Wrong order - gradle will fail!
rm -rf node_modules
cd android && ./gradlew clean  # ERROR!
```

### ✅ DO THIS INSTEAD:
```bash
# Correct order
cd android && ./gradlew clean && cd ..
rm -rf node_modules
# Or just use: npm run clean:all
```

### ❌ DON'T DO THIS:
```bash
# Unnecessary full reset for code changes
npm run fresh  # Wastes 5 minutes!
```

### ✅ DO THIS INSTEAD:
```bash
# Just clear cache
npm run reset  # Takes 5 seconds!
```

## 📊 Performance Comparison

| Command | Time | What it clears |
|---------|------|----------------|
| `npm run reset` | 5s | Metro cache |
| `npm run clean:ios` | 5s | iOS pods |
| `npm run clean:cache` | 10s | All caches |
| `npm run clean:android` | 30s | Android build |
| `npm run clean` | 10s | node_modules |
| `npm run clean:all` | 1m | Everything |
| `npm run fresh` | 2-5m | Everything + reinstall |

## 🔍 Troubleshooting

### Error: "gradle-plugin does not exist"
```bash
# You deleted node_modules before running gradle clean
# Solution: Install first
npm install
# Now you can use clean scripts
```

### Error: "Module not found"
```bash
# Missing dependencies
npm install
npx react-native start --reset-cache
```

### Error: "Command PhaseScriptExecution failed"
```bash
# iOS pods issue
cd ios
pod deintegrate
pod install
cd ..
```

### Metro bundler stuck
```bash
# Clear cache and restart
npm run reset
npm start
```

## 💡 Pro Tips

1. **Use `npm ci` for speed** when lock file exists
   ```bash
   npm ci  # 3-10x faster than npm install
   ```

2. **Don't reset unnecessarily**
   - Code changes → Just save and hot reload
   - Metro issues → `npm run reset`
   - Build issues → `npm run clean:android` or `clean:ios`
   - Dependency issues → `npm run fresh`

3. **Check what changed before resetting**
   ```bash
   git diff HEAD@{1} package.json
   # If nothing changed, don't reinstall!
   ```

4. **Use watchman for better performance**
   ```bash
   brew install watchman  # Mac
   ```

5. **Clear specific caches only**
   ```bash
   # Just Metro
   rm -rf $TMPDIR/metro-*
   
   # Just Watchman
   watchman watch-del-all
   ```

## 🎓 Learning the Order

Remember: **BAGS** (Build, Android, Gradle, Save)
1. **B**uild clean (gradle needs node_modules)
2. **A**fter that, clear caches
3. **G**et rid of node_modules last
4. **S**ave time by using our scripts!

Or just remember: **Clean builds BEFORE deleting node_modules!**

## 📝 Quick Decision Tree

```
Issue?
├─ Code not updating?
│  └─ npm run reset (5s)
├─ Android build fails?
│  └─ npm run clean:android (30s)
├─ iOS build fails?
│  └─ npm run clean:ios + pod install (1m)
├─ Module not found?
│  └─ npm install (1-2m)
├─ Everything broken?
│  └─ npm run fresh (2-5m)
└─ Still broken?
   └─ Nuclear option (5-10m)
```

---

**Remember:** Our scripts are smart and run in the correct order. Trust them! 🚀
