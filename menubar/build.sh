#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

APP_NAME="GhostDev.app"
BINARY_NAME="GhostDev"

echo "🔨 Compiling GhostDev Native Menu Bar App with swiftc..."
swiftc -O -target arm64-apple-macos12.0 main.swift -o "$BINARY_NAME"

echo "📦 Creating macOS .app bundle..."
rm -rf "$APP_NAME"
mkdir -p "$APP_NAME/Contents/MacOS"
mkdir -p "$APP_NAME/Contents/Resources"

mv "$BINARY_NAME" "$APP_NAME/Contents/MacOS/$BINARY_NAME"

cat << 'EOF' > "$APP_NAME/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>GhostDev</string>
    <key>CFBundleIdentifier</key>
    <string>com.githubcattest.ghostdev</string>
    <key>CFBundleName</key>
    <string>GhostDev</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>0.1.0</string>
    <key>LSUIElement</key>
    <true/>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
EOF

echo "🔏 Ad-hoc code signing (100% free, no Apple Developer account required)..."
codesign --force --deep --sign - "$APP_NAME"

echo "✔ Built successfully at $SCRIPT_DIR/$APP_NAME"
