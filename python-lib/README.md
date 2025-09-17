# SmartPaste Multi-Platform Repository

🚀 **Intelligent clipboard assistant across all your devices**

A comprehensive, multi-platform solution that transforms how you work with clipboard content through AI-powered analysis and cross-device synchronization.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/AbdHajjar/SmartPaste)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/AbdHajjar/SmartPaste/build-and-release.yml)
![Desktop](https://img.shields.io/badge/desktop-Windows%7CmacOS%7CLinux-blue.svg)
![Mobile](https://img.shields.io/badge/mobile-iOS%7CAndroid-green.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![PyPI](https://img.shields.io/pypi/v/smartpaste-ai)
![GitHub Downloads](https://img.shields.io/github/downloads/AbdHajjar/SmartPaste/total)

## 🎯 Quick Download

<div align="center">

### 🌐 [**Official Website**](https://abdhajjar.github.io/SmartPaste/) | 📱 [**Latest Releases**](https://github.com/AbdHajjar/SmartPaste/releases/latest)

| Platform | Download | Install Command |
|----------|----------|-----------------|
| 🖥️ **Windows** | [![Windows](https://img.shields.io/badge/Download-Windows-0078d4?style=for-the-badge&logo=windows)](https://github.com/AbdHajjar/SmartPaste/releases/latest) | `winget install SmartPaste` |
| 🍎 **macOS** | [![macOS](https://img.shields.io/badge/Download-macOS-000000?style=for-the-badge&logo=apple)](https://github.com/AbdHajjar/SmartPaste/releases/latest) | `brew install smartpaste` |
| 🐧 **Linux** | [![Linux](https://img.shields.io/badge/Download-Linux-FCC624?style=for-the-badge&logo=linux)](https://github.com/AbdHajjar/SmartPaste/releases/latest) | `sudo snap install smartpaste` |
| � **Android** | [![Android](https://img.shields.io/badge/Download-Android-3DDC84?style=for-the-badge&logo=android)](https://github.com/AbdHajjar/SmartPaste/releases/latest) | Install APK directly |
| 🍎 **iOS** | [![iOS](https://img.shields.io/badge/Download-iOS-000000?style=for-the-badge&logo=apple)](https://github.com/AbdHajjar/SmartPaste/releases/latest) | Install IPA via Xcode |
| 🐍 **Python** | [![PyPI](https://img.shields.io/badge/Install-PyPI-3776ab?style=for-the-badge&logo=python)](https://pypi.org/project/smartpaste-ai/) | `pip install smartpaste-ai` |

</div>

## � Overview

SmartPaste provides intelligent clipboard content analysis and enrichment across **Desktop**, **Mobile**, and as a **Python Library**. Whether you're copying URLs, text, numbers, images, or code, SmartPaste automatically analyzes and enhances your content with relevant information.

### 🎯 **Platform Coverage**
- 🖥️ **Desktop App**: Native applications for Windows, macOS, and Linux
- 📱 **Mobile App**: iOS and Android applications with share extensions
- 🐍 **Python Library**: Core functionality as installable package
- 🌐 **Web Interface**: Browser-based access and configuration

## 📁 Repository Structure

```
SmartPaste/
├── 📱 mobile/              # React Native mobile app (iOS/Android)
├── 🖥️ desktop/             # Electron desktop app (Windows/macOS/Linux)  
├── 🐍 python-lib/          # Core Python library (PyPI package)
├── 🔗 shared/              # Shared assets, configs, and documentation
├── 📚 docs/                # Project documentation and guides
├── 🧪 tests/               # Cross-platform integration tests
├── ⚙️ .github/             # GitHub workflows and templates
└── 📦 Distribution files
```

## ✨ Core Features

### 🧠 **Intelligent Content Analysis**
- **URL Processing**: Extract titles, summaries, metadata, and keywords
- **Text Analysis**: Language detection, summarization, and translation
- **Number Processing**: Automatic unit conversions and calculations  
- **Image Analysis**: OCR text extraction and image recognition
- **Code Enhancement**: Syntax highlighting, formatting, and language detection
- **Email Parsing**: Contact extraction and structured formatting
- **Math Processing**: Expression evaluation and symbolic math

### 🔄 **Cross-Platform Sync**
- **Real-time Sync**: Instant synchronization across all devices
- **Conflict Resolution**: Smart handling of concurrent changes
- **Offline Support**: Queue changes when offline, sync when reconnected
- **Selective Sync**: Choose what content to sync between devices

## 🚀 Quick Start

### 🌟 Instant Try - No Installation Required
**[Download Latest Release →](https://github.com/AbdHajjar/SmartPaste/releases/latest)**  
Get native apps for all platforms instantly!

### 💻 Desktop Installation

#### Option 1: Download Pre-built Apps (Recommended)
Visit our [**Downloads Page**](https://abdhajjar.github.io/SmartPaste/) or [**GitHub Releases**](https://github.com/AbdHajjar/SmartPaste/releases/latest)

- **Windows**: Download `.exe` installer or portable `.zip`
- **macOS**: Download `.dmg` package or app bundle
- **Linux**: Download `.AppImage`, `.deb`, or `.rpm` package

#### Option 2: Package Managers
```bash
# Windows (Winget)
winget install SmartPaste

# macOS (Homebrew)
brew install smartpaste

# Linux (Snap)
sudo snap install smartpaste

# Universal (Python)
pip install smartpaste-ai
```

### � Mobile Installation

#### Android
1. Download the `.apk` file from [releases](https://github.com/AbdHajjar/SmartPaste/releases/latest)
2. Enable "Unknown Sources" in Android settings
3. Install the APK file

#### iOS
1. Download the `.ipa` file from [releases](https://github.com/AbdHajjar/SmartPaste/releases/latest)
2. Install via Xcode or enterprise distribution
3. Trust the developer certificate in iOS settings

### �🐍 Python Installation

#### From PyPI (Recommended)
```bash
# Install SmartPaste AI
pip install smartpaste-ai

# Run SmartPaste
smartpaste --help
```

#### From Source
```bash
# Clone the repository
git clone https://github.com/AbdHajjar/smartpaste.git
cd smartpaste

# Install dependencies
pip install -e .

# Copy example configuration
cp config.example.yaml config.yaml

# Run SmartPaste
smartpaste
```

### 🎯 Basic Usage

1. **Start monitoring**: Run `smartpaste` in your terminal or launch the desktop/mobile app
2. **Copy anything**: URLs, text, numbers with units - SmartPaste handles it all
3. **Check your files**: Find enriched content in `./smartpaste_data/YYYY-MM-DD.md`

## ✨ Features

### 🌐 URL Enhancement
```
Input:  https://example.com/article
Output: [Article Title]
        Summary: Brief description of the article content...
        Keywords: technology, innovation, future
        Link: https://example.com/article
```

### 🔢 Unit Conversion
```
Input:  Temperature is 25°C
Output: Temperature is 25°C
        
        Conversions:
        25°C = 77.0 °F, 298.15 K
```

### 📝 Text Analysis
```
Input:  Long article or text content...
Output: [English] TL;DR: Concise summary of the main points...
        
        [Original content follows...]
```

### 🖼️ OCR Text Extraction (Optional)
```
Input:  [Image with text]
Output: Image Text: Extracted text from the image using OCR
```

## ⚙️ Configuration

SmartPaste is highly configurable. Edit `config.yaml` to customize:

### General Settings
```yaml
general:
  output_directory: "./smartpaste_data"  # Where to save files
  replace_clipboard: false               # Replace clipboard with enriched content
  check_interval: 0.5                   # Clipboard check frequency (seconds)
  max_content_length: 10000             # Maximum content length to process
```

### Feature Toggles
```yaml
features:
  url_handler: true      # Enable URL processing
  number_handler: true   # Enable unit conversions
  text_handler: true     # Enable text analysis
  image_handler: false   # Enable OCR (requires pytesseract)
```

### Handler-Specific Settings
```yaml
url_handler:
  extract_title: true
  generate_summary: true
  extract_keywords: true
  max_keywords: 3
  request_timeout: 10

text_handler:
  detect_language: true
  generate_summary: true
  min_text_length: 50
  supported_languages: ["en", "de", "fr", "es", "it"]
```

## 📦 Dependencies

### Core Dependencies
- **pyperclip** - Clipboard access
- **pyyaml** - Configuration management
- **click** - Command-line interface
- **requests** - Web content fetching
- **beautifulsoup4** - HTML parsing
- **readability-lxml** - Content extraction
- **langdetect** - Language detection
- **sentence-transformers** - Advanced NLP
- **scikit-learn** - Machine learning utilities

### Optional Dependencies
- **pytesseract** - OCR functionality (install with `pip install smartpaste-ai[ocr]`)
- **pillow** - Image processing

### Development Dependencies
- **pytest** - Testing framework
- **black** - Code formatting
- **mypy** - Type checking
- **flake8** - Linting

## 🛠️ Development

### Setting Up Development Environment

```bash
# Clone and install in development mode
git clone https://github.com/AbdHajjar/smartpaste.git
cd smartpaste
pip install -e ".[dev,ocr]"

# Run tests
pytest

# Format code
black .

# Type checking
mypy smartpaste/

# Linting
flake8 smartpaste/
```

### Project Structure

```
smartpaste/
├── smartpaste/           # Main package
│   ├── __init__.py
│   ├── main.py          # Entry point and main application
│   ├── handlers/        # Content type handlers
│   │   ├── __init__.py
│   │   ├── url.py       # URL processing
│   │   ├── number.py    # Unit conversions
│   │   ├── text.py      # Text analysis
│   │   └── image.py     # OCR processing
│   └── utils/           # Utility modules
│       ├── __init__.py
│       ├── io.py        # File I/O operations
│       ├── nlp.py       # NLP utilities
│       └── timebox.py   # Time/date utilities
├── tests/               # Test suite
├── pyproject.toml       # Project configuration
├── config.example.yaml  # Example configuration
└── README.md
```

### Running Tests

```bash
# Run all tests
pytest

# Run specific test categories
pytest -m unit           # Unit tests only
pytest -m integration    # Integration tests only
pytest -m "not slow"     # Skip slow tests

# Run with coverage
pytest --cov=smartpaste --cov-report=html
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Adding New Content Handlers

1. Create a new handler in `smartpaste/handlers/`:
```python
class MyHandler:
    def __init__(self, config=None):
        self.config = config or {}
    
    def process(self, content):
        # Process content and return enriched result
        return {
            "original_content": content,
            "processed_data": "...",
            "enriched_content": "..."
        }
```

2. Register it in `smartpaste/handlers/__init__.py`
3. Add configuration options to `config.example.yaml`
4. Write tests in `tests/test_myhandler.py`

### Improvement Ideas
- **New content types**: Code snippets, mathematical formulas, geographic coordinates
- **Export formats**: HTML, PDF, JSON exports
- **Cloud integration**: Sync with Google Drive, Dropbox, etc.
- **AI enhancements**: Better summarization, sentiment analysis, topic modeling
- **Performance**: Background processing, caching, indexing

## 📋 Roadmap

### Version 0.2 (Next Release)
- [ ] Improved text summarization with transformer models
- [ ] Plugin system for custom handlers
- [ ] Web dashboard for browsing clipboard history
- [ ] Export functionality (HTML, PDF)

### Version 0.3 (Future)
- [ ] Cloud synchronization
- [ ] Mobile companion app
- [ ] Advanced search and filtering
- [ ] Custom AI model integration

### Version 1.0 (Stable)
- [ ] Full Windows/macOS/Linux support
- [ ] Installer packages
- [ ] Professional documentation
- [ ] Performance optimizations

## 🔧 System Requirements

- **Python**: 3.10 or higher
- **Operating System**: Windows, macOS, Linux
- **Memory**: 256MB RAM minimum
- **Storage**: 50MB disk space
- **Optional**: Tesseract OCR for image text extraction

## 📚 Examples

### Example Output File (`2024-01-15.md`)

```markdown
# SmartPaste - 2024-01-15

Auto-generated clipboard content analysis.

---

## 14:32:15 - url

**Source:** clipboard

**Title:** Revolutionary AI Breakthrough Announced
**Summary:** Scientists have developed a new AI system that can understand context better than previous models...
**Keywords:** artificial intelligence, breakthrough, technology
**Link:** [https://example.com/ai-news](https://example.com/ai-news)

---

## 14:35:22 - number

**Source:** clipboard

**Original:** 72 °F

**Conversions:**
- 22.22 °C
- 295.37 K

---

## 14:38:45 - text

**Source:** clipboard

**Language:** English
**Summary:** Discussion about the benefits of automation in modern workflows and productivity improvements.
**Word Count:** 284

[Original text content...]

---
```

## 🆘 Troubleshooting

### Common Issues

**Q: SmartPaste isn't detecting clipboard changes**
A: Check that no other applications are blocking clipboard access. Try running as administrator (Windows) or granting accessibility permissions (macOS).

**Q: OCR isn't working**
A: Install Tesseract OCR: `pip install smartpaste-ai[ocr]` and ensure Tesseract is in your system PATH.

**Q: Language detection is incorrect**
A: Language detection works best with longer text samples (50+ characters). Short texts may be misidentified.

**Q: Web requests are timing out**
A: Increase `request_timeout` in your config.yaml or check your internet connection.

### Getting Help

- 🌐 **Official Website**: [SmartPaste.app](https://abdhajjar.github.io/SmartPaste/)
- � **Documentation**: [GitHub Wiki](https://github.com/AbdHajjar/SmartPaste/wiki)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/AbdHajjar/SmartPaste/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/AbdHajjar/SmartPaste/discussions)
- � **Email Support**: [contact@smartpaste.ai](mailto:contact@smartpaste.ai)

### 🔗 Useful Links

- 🏠 [**Project Homepage**](https://abdhajjar.github.io/SmartPaste/) - Official website with downloads
- 📱 [**Mobile Apps**](https://github.com/AbdHajjar/SmartPaste/releases/latest) - Download APK and IPA files
- 🐍 [**PyPI Package**](https://pypi.org/project/smartpaste-ai/) - Python package on PyPI
- 📦 [**Latest Releases**](https://github.com/AbdHajjar/SmartPaste/releases) - Download desktop and mobile apps
- 🛠️ [**Development Setup**](https://github.com/AbdHajjar/SmartPaste/blob/main/CONTRIBUTING.md) - For contributors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **readability-lxml** for clean content extraction
- **sentence-transformers** for advanced NLP capabilities
- **pytesseract** for OCR functionality
- **The open-source community** for amazing tools and libraries

---

**Made with ❤️ by the SmartPaste community**

*Transform your clipboard into an intelligent knowledge assistant!*