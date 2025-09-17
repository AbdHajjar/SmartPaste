# SmartPaste Desktop Application

Native desktop application built with Electron for Windows, macOS, and Linux.

## 🚀 Features

### Native Desktop Integration
- **System Tray**: Always accessible from system tray
- **Global Hotkeys**: Quick access with keyboard shortcuts
- **Startup**: Auto-start with operating system
- **Notifications**: Native OS notifications

### Advanced Clipboard Management
- **Real-time Monitoring**: Instant clipboard content analysis
- **History Management**: Track and search clipboard history
- **Content Preview**: Rich preview of clipboard content
- **Smart Categorization**: Auto-organize by content type

### Cross-Platform Sync
- **Cloud Sync**: Synchronize across all devices
- **Mobile Integration**: Connect with mobile app
- **Web Access**: Access through web interface
- **Offline Mode**: Full functionality without internet

## 📦 Installation

### Download
- **Windows**: Download `.exe` installer from [releases](https://github.com/AbdHajjar/SmartPaste/releases)
- **macOS**: Download `.dmg` from [releases](https://github.com/AbdHajjar/SmartPaste/releases)  
- **Linux**: Download `.AppImage`, `.deb`, or `.rpm` from [releases](https://github.com/AbdHajjar/SmartPaste/releases)

### Package Managers
```bash
# Windows (Chocolatey)
choco install smartpaste

# macOS (Homebrew)
brew install --cask smartpaste

# Linux (Snap)
sudo snap install smartpaste
```

## 🎯 Quick Start

1. **Install & Launch**: Download and install SmartPaste
2. **System Tray**: Look for SmartPaste icon in system tray
3. **Copy Content**: Copy any text, URL, or image
4. **Smart Analysis**: SmartPaste automatically analyzes and enriches content
5. **Access Results**: Right-click tray icon to view results

## ⚙️ Configuration

### Settings Panel
- **General**: Startup, notifications, hotkeys
- **Content Handlers**: Enable/disable specific content types
- **Sync**: Cloud sync configuration
- **Privacy**: Data handling preferences

### Keyboard Shortcuts
- `Ctrl/Cmd + Shift + V`: Show clipboard history
- `Ctrl/Cmd + Shift + S`: Quick settings
- `Ctrl/Cmd + Shift + P`: Process current clipboard

## 🔧 Development

### Prerequisites
```bash
# Install Node.js 18+
node --version
npm --version
```

### Setup
```bash
# Clone repository
git clone https://github.com/AbdHajjar/SmartPaste.git
cd SmartPaste/desktop

# Install dependencies
npm install

# Start development
npm run dev
```

### Building
```bash
# Build for current platform
npm run build

# Build for specific platforms
npm run build:win     # Windows
npm run build:mac     # macOS
npm run build:linux   # Linux

# Build for all platforms
npm run dist
```

### Project Structure
```
desktop/
├── src/
│   ├── main.js           # Main Electron process
│   ├── renderer/         # Renderer processes
│   ├── utils/            # Utility functions
│   └── components/       # UI components
├── assets/               # Icons and resources
├── build/               # Build configuration
└── dist/                # Built applications
```

## 🎨 Architecture

### Main Process
- **Clipboard Monitoring**: Background clipboard watching
- **System Integration**: Tray, notifications, startup
- **IPC Communication**: Coordinate with renderer processes
- **Core Processing**: Content analysis and enrichment

### Renderer Process
- **UI Interface**: Settings, history, preview windows
- **Data Visualization**: Charts, graphs, content display
- **User Interaction**: Settings, preferences, manual triggers

### Communication
- **WebSocket**: Real-time communication with backend
- **IPC**: Inter-process communication within Electron
- **File System**: Local data storage and caching

## 🔌 Integration

### Python Backend
```javascript
// Communicate with Python SmartPaste core
const { spawn } = require('child_process');

const python = spawn('python', ['-m', 'smartpaste', '--json']);
python.stdout.on('data', (data) => {
  const result = JSON.parse(data);
  handleProcessedContent(result);
});
```

### System APIs
```javascript
// System clipboard integration
const { clipboard } = require('electron');

// Monitor clipboard changes
let lastClipboard = '';
setInterval(() => {
  const current = clipboard.readText();
  if (current !== lastClipboard) {
    lastClipboard = current;
    processNewContent(current);
  }
}, 500);
```

## 📱 Mobile Integration

The desktop app connects seamlessly with the SmartPaste mobile app:
- **Shared History**: Access clipboard history across devices
- **Remote Triggers**: Start processing from mobile
- **Sync Status**: Real-time sync indicators

## 🔒 Privacy & Security

- **Local Processing**: Core analysis happens locally
- **Encrypted Sync**: End-to-end encryption for cloud sync
- **Privacy Mode**: Disable specific content types
- **Data Control**: Full control over data retention

## 🤝 Contributing

See the main repository [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.