#!/bin/bash

# Build and Install Release APK (works with Metro running)
# This script builds a release APK and installs it on connected device
# You can keep Metro bundler running in another terminal

echo "🚀 Building Release APK..."
echo ""

# Check if Metro is running
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Metro bundler is running on port 8081"
    echo "   The app will connect to Metro for live reload"
else
    echo "⚠️  Metro bundler is NOT running"
    echo "   Start Metro in another terminal: npm start"
    echo "   Or the app will use bundled JS"
fi

echo ""
echo "📦 Building release APK..."

cd android

# Build release APK
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Release APK built successfully!"
    echo ""
    echo "📍 APK Location:"
    echo "   android/app/build/outputs/apk/release/app-release.apk"
    echo ""
    
    # Check if device is connected
    if adb devices | grep -q "device$"; then
        echo "📱 Installing on connected device..."
        ./gradlew installRelease
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Release APK installed successfully!"
            echo ""
            echo "🎉 Done! You can now:"
            echo "   1. Open the app on your device"
            echo "   2. It will connect to Metro if running"
            echo "   3. Make code changes and reload"
            echo ""
            
            # Play sound on Mac
            say "Release build complete and installed" 2>/dev/null
        else
            echo ""
            echo "❌ Failed to install APK"
            echo "   Install manually from:"
            echo "   android/app/build/outputs/apk/release/app-release.apk"
        fi
    else
        echo "⚠️  No device connected"
        echo ""
        echo "📦 APK built but not installed"
        echo "   Connect a device and run: npm run build:apk:release:install"
        echo "   Or install manually from:"
        echo "   android/app/build/outputs/apk/release/app-release.apk"
    fi
else
    echo ""
    echo "❌ Build failed!"
    echo "   Check the error messages above"
fi

cd ..
