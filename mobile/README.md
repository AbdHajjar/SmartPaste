# SmartPaste Mobile App

Native mobile application for iOS and Android built with React Native.

## 📱 Features

### Intelligent Clipboard
- **Real-time Analysis**: Instant content processing
- **Smart Suggestions**: AI-powered content enhancement
- **History Management**: Complete clipboard history
- **Quick Actions**: One-tap processing and sharing

### Cross-Device Sync
- **Cloud Sync**: Seamless synchronization across devices
- **Desktop Integration**: Connect with desktop application
- **Web Access**: Browser-based interface
- **Offline Mode**: Full functionality without connection

### Mobile-Optimized
- **Share Extension**: Process content from any app
- **Notification Actions**: Quick access from notifications
- **Widget Support**: Home screen widgets (iOS 14+, Android)
- **Shortcuts**: Siri Shortcuts (iOS) and App Shortcuts (Android)

### Privacy & Security
- **Local Processing**: On-device content analysis
- **Encrypted Storage**: Secure data encryption
- **Privacy Controls**: Granular privacy settings
- **Biometric Lock**: Face ID, Touch ID, Fingerprint

## 📦 Installation

### Direct Download
- **Android APK**: Download from [releases](https://github.com/AbdHajjar/SmartPaste/releases)
- **iOS IPA**: Available for enterprise/developer accounts

## 🚀 Quick Start

1. **Install & Open**: Download SmartPaste
2. **Grant Permissions**: Enable clipboard access and notifications
3. **Copy Content**: Copy text, links, or images in any app
4. **Smart Processing**: SmartPaste automatically analyzes content
5. **Quick Actions**: Tap suggestions or use share extension

## ⚙️ Setup & Configuration

### Initial Setup
1. **Permissions**: Grant clipboard and notification access
2. **Sync Account**: Create account for cross-device sync (optional)
3. **Preferences**: Configure content handlers and privacy settings
4. **Shortcuts**: Set up Siri Shortcuts or App Shortcuts

### Content Handlers
- **URLs**: Extract titles, summaries, and metadata
- **Text**: Language detection, translation, summarization
- **Numbers**: Unit conversions and calculations
- **Images**: OCR text extraction and analysis
- **Code**: Syntax highlighting and formatting
- **Emails**: Contact extraction and formatting

## 🔧 Development

### Prerequisites
```bash
# Install React Native CLI
npm install -g react-native-cli

# Install dependencies for iOS (macOS only)
pod install

# Install Android Studio and SDK
```

### Setup
```bash
# Clone repository
git clone https://github.com/AbdHajjar/SmartPaste.git
cd SmartPaste/mobile

# Install dependencies
npm install

# iOS setup (macOS only)
cd ios && pod install && cd ..

# Start Metro bundler
npm start
```

### Running
```bash
# Run on iOS simulator
npm run ios

# Run on Android emulator/device
npm run android

# Run on specific device
npx react-native run-ios --device "iPhone"
npx react-native run-android --deviceId YOUR_DEVICE_ID
```

### Building
```bash
# Build Android APK
npm run build:android

# Build iOS (requires Xcode)
npm run build:ios

# Create bundles
npm run bundle:android
npm run bundle:ios
```

## 📱 Platform-Specific Features

### iOS Features
- **Share Extension**: Process content from any app via share sheet
- **Siri Shortcuts**: Voice commands for quick actions
- **Widget**: Home screen widget showing recent clipboard items
- **Live Activities**: Dynamic Island integration (iOS 16+)
- **Focus Modes**: Respect Do Not Disturb settings

### Android Features
- **Share Receiver**: Handle shared content from other apps
- **Quick Settings Tile**: Toggle monitoring from Quick Settings
- **App Shortcuts**: Long-press app icon for quick actions
- **Adaptive Icons**: Dynamic icon theming
- **Accessibility**: TalkBack and accessibility service support

## 🔌 Architecture

### Core Components
```
mobile/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/         # Screen components
│   ├── services/        # API and business logic
│   ├── utils/           # Helper functions
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript definitions
├── android/             # Android-specific code
├── ios/                 # iOS-specific code
└── assets/              # Images, fonts, etc.
```

### State Management
```javascript
// React Context for global state
import { ClipboardProvider } from './src/context/ClipboardContext';
import { SyncProvider } from './src/context/SyncContext';

function App() {
  return (
    <SyncProvider>
      <ClipboardProvider>
        <Navigation />
      </ClipboardProvider>
    </SyncProvider>
  );
}
```

### Background Processing
```javascript
// Background clipboard monitoring
import BackgroundJob from 'react-native-background-job';

BackgroundJob.on('clipboardChange', (content) => {
  processClipboardContent(content);
});
```

## 🔄 Sync Integration

### Cloud Sync
- **Real-time Updates**: Instant sync across devices
- **Conflict Resolution**: Smart merge of concurrent changes
- **Offline Queue**: Queue changes when offline
- **Selective Sync**: Choose what to sync

### Desktop Integration
```javascript
// WebSocket connection to desktop app
import WebSocket from 'ws';

const desktopSync = new WebSocket('ws://localhost:8080');
desktopSync.on('message', (data) => {
  const update = JSON.parse(data);
  handleDesktopUpdate(update);
});
```

## 🎨 UI/UX Features

### Material Design (Android)
- **Material You**: Dynamic color theming
- **Motion**: Smooth animations and transitions
- **Typography**: Material Design typography scale

### Human Interface Guidelines (iOS)
- **SF Symbols**: Native icon system
- **Dynamic Type**: Accessibility font scaling
- **Haptic Feedback**: Tactile feedback system

### Dark Mode
- **System Integration**: Follow system dark mode
- **Manual Toggle**: Override system setting
- **Adaptive Colors**: Dynamic color adaptation

## 🔒 Privacy & Security

### Data Protection
- **Local Encryption**: AES-256 encryption for sensitive data
- **Keychain Storage**: Secure credential storage
- **Biometric Authentication**: Face ID, Touch ID, Fingerprint
- **App Lock**: PIN/Pattern lock for app access

### Privacy Controls
- **Sensitive Content**: Filter out passwords, credit cards
- **App Exclusions**: Exclude specific apps from monitoring
- **Data Retention**: Configurable history retention
- **Analytics Opt-out**: Disable usage analytics

## 🤝 Contributing

See the main repository [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.