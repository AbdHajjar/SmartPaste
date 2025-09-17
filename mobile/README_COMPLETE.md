# SmartPaste Mobile

**Intelligent Clipboard Assistant for iOS and Android**

SmartPaste Mobile brings the power of intelligent clipboard processing to your mobile device. Automatically enrich your clipboard content with contextual information, from web page titles to unit conversions and text analysis.

## ✨ Features

### 🎯 Core Functionality
- **Real-time Clipboard Monitoring** - Automatic content detection and processing
- **Intelligent Content Analysis** - AI-powered content understanding
- **Cross-Platform Sync** - Seamless synchronization between devices
- **Rich History Management** - Search, filter, and organize clipboard history

### 🔧 Content Processors
- **🔗 URL Processing** - Extract titles, summaries, and metadata from web pages
- **📝 Text Analysis** - Language detection, summarization, and keyword extraction
- **🔢 Number Conversion** - Automatic unit conversions (temperature, length, weight, volume)
- **🖼️ Image OCR** - Extract text from images using advanced OCR
- **💻 Code Detection** - Analyze and format code snippets
- **📧 Email Processing** - Parse and validate email addresses
- **🧮 Math Processing** - Evaluate mathematical expressions

### 📱 Mobile Features
- **Native Clipboard Integration** - Deep system integration for seamless operation
- **Background Processing** - Continue working while content is processed
- **Share Extension** - Process content shared from other apps
- **Offline Support** - Core functionality works without internet connection
- **Privacy-First** - All processing happens locally by default

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AbdHajjar/SmartPaste.git
   cd SmartPaste/mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Run the app**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   ```

## 🏗️ Architecture

### App Structure
```
src/
├── components/          # Reusable UI components
├── screens/            # App screens and navigation
├── context/            # React Context providers
├── services/           # Core services and APIs
├── utils/              # Helper utilities
└── styles/             # Themes and styling
```

### Key Components

#### 🏠 Home Screen
- Real-time clipboard monitoring toggle
- Current clipboard content display
- Quick processing actions
- Statistics and activity overview

#### 📚 History Screen
- Comprehensive clipboard history
- Advanced search and filtering
- Content type categorization
- Bulk operations and sharing

#### ⚙️ Settings Screen
- Processor configuration
- Privacy and sync settings
- Performance optimization
- Data management tools

#### 🔄 Processing Screen
- Live processing visualization
- Progress tracking with animations
- Detailed results display
- Error handling and retry options

#### 📤 Share Extension Screen
- Handle content from other apps
- Quick processing workflow
- Clipboard integration
- One-tap sharing back to apps

### Services

#### 📋 ClipboardService
- Native clipboard integration
- Real-time monitoring
- Content type detection
- Cross-platform compatibility

#### 🔔 NotificationService
- Processing status notifications
- Result summaries
- Error alerts
- Background operation updates

#### 🔄 ProcessingService
- Content analysis orchestration
- Handler management
- Result caching
- Performance optimization

#### 🌐 SyncService
- Cross-device synchronization
- Conflict resolution
- Cloud integration
- Local backup management

## ⚡ Performance

### Optimizations
- **Lazy Loading** - Components load on demand
- **Efficient Rendering** - FlatList virtualization for large datasets
- **Memory Management** - Smart cache invalidation and cleanup
- **Background Processing** - Non-blocking content analysis
- **Native Modules** - Performance-critical operations in native code

### Memory Usage
- Typical RAM usage: 50-80MB
- Cache size: Configurable (25-200MB)
- History limit: Configurable (50-500 items)

## 🔧 Configuration

### Default Settings
```yaml
general:
  autoStart: false
  showNotifications: true
  enableHistory: true

processing:
  enableUrlProcessing: true
  enableTextProcessing: true
  enableNumberProcessing: true
  enableImageProcessing: true # iOS default, Android configurable
  enableCodeProcessing: true
  enableEmailProcessing: true
  enableMathProcessing: true

privacy:
  maxHistoryItems: 100
  clearHistoryOnExit: false
  backgroundProcessing: true

performance:
  cacheSize: 50 # MB
  processingTimeout: 30 # seconds
  urlTimeout: 10 # seconds
```

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance
```

### Test Coverage
- Unit tests: 85%+
- Integration tests: 70%+
- E2E tests: Core user flows

## 📦 Building

### Development Build
```bash
# Debug build
npm run build:debug

# Release build
npm run build:release
```

### Production Build
```bash
# Android APK
npm run build:android

# iOS Archive
npm run build:ios

# Bundle assets
npm run bundle:android
npm run bundle:ios
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and add tests
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request

### Code Standards
- **ESLint** - Code linting and formatting
- **Prettier** - Code style consistency
- **TypeScript** - Type safety (optional but recommended)
- **Testing** - Unit tests for all new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

### Documentation
- [User Guide](../docs/mobile-guide.md)
- [API Documentation](../docs/api.md)
- [Troubleshooting](../docs/troubleshooting.md)

### Community
- [GitHub Issues](https://github.com/AbdHajjar/SmartPaste/issues)
- [Discord Community](https://discord.gg/smartpaste)
- [Reddit](https://reddit.com/r/SmartPaste)

### Professional Support
- Email: support@smartpaste.dev
- Enterprise: enterprise@smartpaste.dev

---

Made with ❤️ by the SmartPaste Team