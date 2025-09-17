# SmartPaste Multi-Platform Development Guide

This comprehensive guide covers development setup, architecture, and contribution guidelines for the SmartPaste multi-platform ecosystem.

## 🏗️ Architecture Overview

SmartPaste is built as a multi-platform ecosystem with shared core functionality:

```
smartpaste/
├── smartpaste/           # Core Python library
├── desktop/             # Electron desktop application  
├── mobile/              # React Native mobile app
├── python-lib/          # PyPI package wrapper
├── shared/              # Shared TypeScript sync core
└── .github/             # CI/CD workflows
```

### Core Components

1. **SmartPaste Core** (`smartpaste/`): Python-based content processing engine
2. **Desktop App** (`desktop/`): Electron app with system tray integration
3. **Mobile App** (`mobile/`): React Native app for iOS/Android
4. **Python Library** (`python-lib/`): Installable package for developers
5. **Sync Core** (`shared/`): TypeScript-based synchronization layer

## 🛠️ Development Environment Setup

### Prerequisites

- **Node.js** 18+ (for desktop and mobile apps)
- **Python** 3.8+ (for core library and CLI)
- **Git** (version control)
- **Platform SDKs** (for mobile development):
  - **iOS**: Xcode 14+ with iOS 13+ SDK
  - **Android**: Android Studio with SDK 24+

### Repository Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/smartpaste.git
cd smartpaste

# Install root dependencies (workspace management)
npm install

# Install Python core dependencies
pip install -e .[dev]

# Install desktop dependencies
cd desktop && npm install && cd ..

# Install mobile dependencies  
cd mobile && npm install && cd ..

# Install Python library dependencies
cd python-lib && pip install -e .[dev] && cd ..
```

### Environment Configuration

Create `.env` files for each platform:

#### Desktop (.env)
```env
# Development settings
NODE_ENV=development
PYTHON_PATH=../smartpaste
ENABLE_DEV_TOOLS=true
AUTO_UPDATE=false

# API endpoints
SYNC_API_URL=http://localhost:3001
ANALYTICS_ENABLED=false
```

#### Mobile (.env)
```env
# Development settings
NODE_ENV=development
API_BASE_URL=http://localhost:3001
ENABLE_FLIPPER=true

# Platform-specific
ANDROID_PACKAGE_NAME=com.smartpaste.dev
IOS_BUNDLE_ID=com.smartpaste.dev
```

#### Python Library (.env)
```env
# Development settings
SMARTPASTE_ENV=development
LOG_LEVEL=DEBUG
CACHE_DIR=./dev_cache
CONFIG_FILE=./dev_config.yaml
```

## 🏃‍♂️ Running Development Builds

### Desktop Application

```bash
cd desktop

# Start Electron in development mode
npm run dev

# Run with specific Python environment
PYTHON_PATH=/path/to/python npm run dev

# Build for current platform
npm run build

# Build for all platforms
npm run build:all
```

### Mobile Application

```bash
cd mobile

# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on physical device
npm run ios -- --device
npm run android -- --device-id DEVICE_ID
```

### Python Library

```bash
# Run SmartPaste CLI in development
python -m smartpaste

# Run with specific config
python -m smartpaste --config dev_config.yaml

# Run in monitor mode
python -m smartpaste monitor --verbose

# Run tests
pytest tests/ -v

# Type checking
mypy smartpaste/
```

### Sync Development Server

```bash
cd shared

# Compile TypeScript
npm run build

# Run sync server for development
npm run dev:server

# Run sync tests
npm run test

# Type checking
npm run type-check
```

## 🧪 Testing Strategy

### Automated Testing

#### Python Core Tests
```bash
# Run all tests
pytest

# Run specific test categories
pytest tests/test_handlers/ -v          # Handler tests
pytest tests/test_utils/ -v             # Utility tests
pytest tests/test_integration/ -v       # Integration tests

# Run with coverage
pytest --cov=smartpaste --cov-report=html

# Performance tests
pytest tests/test_performance/ -v --benchmark-only
```

#### Desktop App Tests
```bash
cd desktop

# Unit tests
npm test

# E2E tests with Spectron
npm run test:e2e

# Integration tests
npm run test:integration
```

#### Mobile App Tests
```bash
cd mobile

# Unit tests with Jest
npm test

# E2E tests with Detox
npm run test:e2e:ios
npm run test:e2e:android

# Component tests
npm run test:components
```

#### Sync Core Tests
```bash
cd shared

# TypeScript tests
npm test

# Integration tests across platforms
npm run test:integration

# Performance tests
npm run test:performance
```

### Manual Testing

#### Desktop Testing Checklist
- [ ] System tray integration works
- [ ] Clipboard monitoring activates
- [ ] Content processing functions correctly
- [ ] Sync with mobile devices works
- [ ] Settings persistence works
- [ ] Auto-updater functions (in production builds)

#### Mobile Testing Checklist
- [ ] Background clipboard monitoring
- [ ] Push notifications work
- [ ] Sync with desktop works
- [ ] Offline functionality
- [ ] Battery optimization compliance
- [ ] Platform-specific UI guidelines

#### Cross-Platform Testing
- [ ] Data sync between all platforms
- [ ] Conflict resolution works correctly
- [ ] Offline/online transitions
- [ ] Performance under load
- [ ] Security/encryption validation

## 🏗️ Build and Distribution

### Desktop Builds

```bash
cd desktop

# Development build
npm run build:dev

# Production builds for all platforms
npm run build:prod

# Platform-specific builds
npm run build:windows
npm run build:macos  
npm run build:linux

# Create installers
npm run dist
```

Build outputs:
- **Windows**: `.exe` installer, `.appx` package
- **macOS**: `.dmg` installer, `.app` bundle  
- **Linux**: `.AppImage`, `.deb`, `.rpm` packages

### Mobile Builds

#### iOS Build
```bash
cd mobile

# Development build
npm run build:ios:dev

# Production build  
npm run build:ios:prod

# Build for App Store
npm run build:ios:release
```

#### Android Build
```bash
cd mobile

# Development APK
npm run build:android:dev

# Production APK
npm run build:android:prod

# Android App Bundle for Play Store
npm run build:android:release
```

### Python Library Distribution

```bash
cd python-lib

# Build distribution packages
python setup.py sdist bdist_wheel

# Upload to Test PyPI
twine upload --repository testpypi dist/*

# Upload to PyPI
twine upload dist/*
```

### Docker Images

```bash
# Build Docker images
docker build -t smartpaste:latest .

# Build multi-platform images
docker buildx build --platform linux/amd64,linux/arm64 -t smartpaste:latest .

# Push to registry
docker push smartpaste:latest
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

1. **`desktop.yml`**: Desktop app builds and distribution
2. **`mobile.yml`**: Mobile app builds and store publishing
3. **`python-lib.yml`**: Python package testing and PyPI publishing
4. **`sync.yml`**: Cross-platform integration testing
5. **`release.yml`**: Coordinated multi-platform releases

### Triggering Builds

```bash
# Trigger all workflows
git tag v1.0.0
git push origin v1.0.0

# Trigger specific workflow
gh workflow run desktop.yml

# Trigger with parameters
gh workflow run release.yml -f version=1.0.1 -f prerelease=false
```

### Release Process

1. **Update version numbers** in all platform configurations
2. **Update CHANGELOG.md** with release notes
3. **Create and push git tag** (`v1.0.0`)
4. **Monitor CI/CD workflows** for successful builds
5. **Verify distribution** across all platforms
6. **Update documentation** and website

## 🔧 Development Tools and Scripts

### Code Quality Tools

```bash
# Python code formatting
black smartpaste/
isort smartpaste/

# JavaScript/TypeScript formatting
npm run format

# Linting
flake8 smartpaste/        # Python
npm run lint              # JS/TS

# Type checking
mypy smartpaste/          # Python
npm run type-check        # TypeScript
```

### Development Scripts

#### `scripts/dev-setup.sh`
```bash
#!/bin/bash
# Complete development environment setup
./scripts/dev-setup.sh
```

#### `scripts/build-all.sh`
```bash
#!/bin/bash
# Build all platforms for release
./scripts/build-all.sh v1.0.0
```

#### `scripts/test-all.sh`
```bash
#!/bin/bash
# Run all tests across platforms
./scripts/test-all.sh
```

## 📚 Contributing Guidelines

### Code Style

#### Python
- Follow **PEP 8** style guide
- Use **type annotations** for all functions
- Maximum line length: **88 characters** (Black default)
- Use **docstrings** for all classes and methods
- Sort imports with **isort**

#### JavaScript/TypeScript
- Use **Prettier** for code formatting
- Follow **ESLint** rules in `.eslintrc.js`
- Use **TypeScript** for type safety
- Prefer **functional components** in React
- Use **async/await** over promises

#### Documentation
- Update **README.md** for new features
- Add **inline comments** for complex logic
- Update **API documentation** for changes
- Include **examples** in docstrings

### Git Workflow

1. **Fork** the repository
2. **Create feature branch**: `git checkout -b feature/your-feature`
3. **Make changes** with clear commit messages
4. **Add tests** for new functionality
5. **Run quality checks**: `npm run lint && pytest`
6. **Submit pull request** with description

### Commit Message Format

```
feat(desktop): add system tray context menu

- Add right-click context menu to system tray
- Include options for settings and quit
- Update tray icon based on sync status

Closes #123
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
Scopes: `desktop`, `mobile`, `python`, `sync`, `ci`, `docs`

## 🐛 Debugging and Troubleshooting

### Common Issues

#### Desktop App
```bash
# Enable debug logging
DEBUG=smartpaste:* npm run dev

# Check Python integration
node -e "console.log(require('child_process').execSync('python --version').toString())"

# Clear Electron cache
rm -rf ~/.cache/smartpaste-desktop
```

#### Mobile App
```bash
# React Native debugging
npx react-native log-ios     # iOS logs
npx react-native log-android # Android logs

# Metro bundler issues
npx react-native start --reset-cache

# Clear React Native cache
rm -rf ~/.cache/react-native-*
```

#### Python Library
```bash
# Enable debug logging
SMARTPASTE_LOG_LEVEL=DEBUG python -m smartpaste

# Check dependencies
pip check

# Clear cache
rm -rf ~/.cache/smartpaste
```

### Performance Profiling

#### Python Profiling
```bash
# Profile with cProfile
python -m cProfile -o profile.stats -m smartpaste

# Analyze profile
python -c "import pstats; pstats.Stats('profile.stats').sort_stats('cumulative').print_stats(20)"

# Memory profiling with memory_profiler
mprof run python -m smartpaste
mprof plot
```

#### JavaScript Profiling
```bash
# Electron main process
node --inspect main.js

# React Native performance
npx react-native run-ios --configuration Release
# Use Flipper for performance monitoring
```

## 📖 Documentation

### API Documentation

Generate API docs:
```bash
# Python API docs with Sphinx
cd docs && sphinx-build -b html . _build

# TypeScript API docs with TypeDoc
npm run docs:generate

# Serve documentation locally
python -m http.server 8000 -d docs/_build/html
```

### User Documentation

- **User Guide**: `docs/user-guide.md`
- **Installation**: `docs/installation.md`
- **Configuration**: `docs/configuration.md`
- **API Reference**: `docs/api/`
- **Troubleshooting**: `docs/troubleshooting.md`

## 🔐 Security Considerations

### Development Security

1. **Never commit secrets** to version control
2. **Use environment variables** for sensitive data
3. **Validate all inputs** in handlers
4. **Sanitize clipboard content** before processing
5. **Use HTTPS** for all network requests
6. **Implement rate limiting** for API calls

### Production Security

1. **Code signing** for desktop applications
2. **App store security reviews** for mobile apps
3. **Dependency vulnerability scanning**
4. **Regular security updates**
5. **End-to-end encryption** for sync data
6. **Privacy-first data handling**

## 📈 Monitoring and Analytics

### Development Monitoring

```bash
# Monitor resource usage
top -p $(pgrep -f smartpaste)

# Monitor network activity
netstat -an | grep smartpaste

# Monitor file system activity
lsof -p $(pgrep -f smartpaste)
```

### Production Analytics

- **Error tracking**: Sentry integration
- **Performance monitoring**: Application insights
- **Usage analytics**: Privacy-focused metrics
- **Crash reporting**: Platform-specific tools

## 🤝 Community and Support

### Getting Help

1. **Read documentation**: [docs.smartpaste.app](https://docs.smartpaste.app)
2. **Search existing issues**: GitHub Issues
3. **Ask in Discord**: [Community chat](https://discord.gg/smartpaste)
4. **Create detailed bug reports**: Include logs and reproduction steps

### Contributing

1. **Start with good first issues**: Look for `good-first-issue` label
2. **Join discussions**: Participate in feature discussions
3. **Help with documentation**: Improve guides and examples
4. **Review pull requests**: Help maintain code quality
5. **Report bugs**: Help improve stability

---

This development guide covers the essential aspects of working with the SmartPaste multi-platform ecosystem. For specific questions or additional help, please refer to the documentation or reach out to the community.

Happy coding! 🚀