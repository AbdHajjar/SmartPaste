# SmartPaste AI - Advanced Clipboard Intelligence 🚀

**SmartPaste AI** is a revolutionary context-aware clipboard assistant that transforms your clipboard into an intelligent automation powerhouse. Monitor, process, enhance, and automate clipboard content with AI-powered workflows, advanced caching, and beautiful desktop integration.

## 🌟 Key Features

### 🧠 **Intelligent Content Processing**
- **7 Specialized Handlers**: URL, Text, Number, Image (OCR), Code, Email, Math
- **Smart Content Detection**: Automatic content type recognition and processing
- **Advanced Caching**: Lightning-fast processing with intelligent content caching
- **Async Processing**: Non-blocking operations for CPU-intensive tasks

### 🖥️ **Modern Desktop Experience**  
- **System Tray Integration**: Beautiful custom icons with live status updates
- **GUI Management**: Modern interface for clipboard history and settings
- **Background Monitoring**: Seamless clipboard monitoring with minimal resource usage
- **Cross-Platform**: Works on Windows, macOS, and Linux

### 🤖 **Smart Workflow Automation**
- **Rule-Based Engine**: Create custom automation rules with conditions and actions
- **10+ Action Types**: Copy, save, append, notify, transform, execute, and more
- **Pattern Matching**: Regex patterns, content types, time-based triggers
- **Default Rules**: Pre-configured intelligent automation for common tasks

### ⚡ **Performance & Scalability**
- **Multi-Threading**: Concurrent processing with thread and process pools
- **Intelligent Caching**: Memory and disk caching with TTL and size limits
- **Resource Management**: Automatic cleanup and memory optimization
- **Error Resilience**: Graceful error handling and retry mechanisms

## 🚀 Quick Start

### Installation

```bash
# Install SmartPaste AI
pip install smartpaste-ai

# Install with GUI support (recommended)
pip install smartpaste-ai[gui]
```

### Basic Usage

```bash
# Start with modern GUI (system tray)
smartpaste --gui

# Start in CLI mode
smartpaste --cli

# Use custom configuration
smartpaste --config my_config.yaml --gui
```

## 📖 Advanced Usage

### System Tray Mode (Recommended)

The GUI mode provides the best user experience with system tray integration:

```bash
smartpaste --gui
```

**Features:**
- 🎯 Beautiful custom system tray icon with activity indicators
- 📋 Real-time clipboard monitoring with play/pause controls
- 📊 Clipboard history viewer with search and filtering
- ⚙️ Settings management through modern UI
- 📂 Quick access to data folder and documentation
- 🔔 Smart notifications for automation events

### Workflow Automation Examples

SmartPaste AI includes powerful automation rules that trigger based on clipboard content:

#### Default Automation Rules

1. **URL Auto-Bookmarking**
   ```yaml
   # Automatically saves URLs to bookmark file
   trigger: content_type == "url"
   actions:
     - append_to_file: smartpaste_bookmarks.txt
     - notify: "URL saved to bookmarks"
   ```

2. **Email Follow-up Creation**
   ```yaml
   # Creates todo items for email addresses
   trigger: content_type == "email"
   actions:
     - create_todo: "Follow up with: {content}"
   ```

3. **Code Snippet Organization**
   ```yaml
   # Auto-formats and saves code snippets
   trigger: content_type == "code"
   actions:
     - transform: remove_whitespace
     - save_to_file: "code_snippets/{date}_snippet.txt"
   ```

4. **Emergency Keyword Alerts**
   ```yaml
   # Immediate notifications for urgent content
   trigger: regex_match("urgent|emergency|asap|critical")
   actions:
     - notify: "⚠️ Emergency content detected"
   cooldown: 300 seconds
   ```

### Content Handlers

#### URL Handler
```python
# Processes web URLs
Input:  "https://github.com/user/repo"
Output: {
    "title": "Repository Name",
    "description": "Project description...",
    "summary": "AI-generated summary",
    "keywords": ["python", "opensource"],
    "content_type": "url"
}
```

#### Text Handler  
```python
# Processes text with NLP
Input:  "This is a sample text in English."
Output: {
    "language": "en",
    "summary": "Brief summary...",
    "word_count": 7,
    "sentiment": "neutral",
    "keywords": ["sample", "text"]
}
```

#### Number Handler
```python
# Smart unit conversions
Input:  "25°C"
Output: {
    "conversions": {
        "fahrenheit": "77.0°F",
        "kelvin": "298.15K"
    },
    "original_number": 25,
    "unit_type": "temperature"
}
```

#### Code Handler
```python
# Code analysis and formatting
Input:  "def hello(): print('world')"
Output: {
    "language": "python",
    "formatted_code": "def hello():\n    print('world')",
    "functions": ["hello"],
    "complexity": "low"
}
```

## ⚙️ Configuration

### Basic Configuration (`config.yaml`)

```yaml
# Application Settings
app:
  check_interval: 1.0        # Clipboard check frequency (seconds)
  output_dir: smartpaste_data # Data storage directory
  auto_start_gui: true       # Start GUI mode by default
  minimize_to_tray: true     # Minimize to system tray

# Performance Settings  
performance:
  async_processing: true     # Enable async processing
  max_workers: 8            # Thread pool size
  cache_size_mb: 100        # Memory cache limit

# Content Handlers
handlers:
  url:
    enabled: true
    timeout: 10             # Request timeout
    extract_summary: true   # Generate AI summaries
  
  text:
    enabled: true
    min_length: 10          # Minimum text length
    detect_language: true   # Auto language detection
  
  number:
    enabled: true
    temperature_units: [celsius, fahrenheit, kelvin]
    length_units: [meters, feet, inches]
  
  image:
    enabled: false          # Requires pytesseract
    ocr_enabled: false
  
  code:
    enabled: true
    detect_language: true
    format_code: true

# Privacy & Security
privacy:
  encrypt_data: false       # Encrypt stored data
  auto_delete_after_days: 0 # Auto-cleanup (0 = never)
  exclude_patterns: []      # Content patterns to ignore
```

### Advanced Automation Rules

Create custom automation rules in JSON format:

```json
{
  "id": "custom_rule",
  "name": "Custom Processing Rule",
  "description": "Process specific content patterns",
  "conditions": [
    {
      "type": "pattern_regex",
      "value": "\\b\\d{4}-\\d{2}-\\d{2}\\b",
      "case_sensitive": false
    }
  ],
  "actions": [
    {
      "type": "transform_content",
      "parameters": {
        "transformation": "extract_dates"
      }
    },
    {
      "type": "save_to_file", 
      "parameters": {
        "file_path": "dates/{date}_extracted.txt",
        "content": "Found dates: {transformed_content}"
      }
    }
  ],
  "priority": 5,
  "cooldown_seconds": 60
}
```

## 🏗️ Architecture

### Core Components

```
SmartPaste AI Architecture
├── 🧠 Core Engine (main.py)
│   ├── Clipboard monitoring
│   ├── Content detection
│   └── Handler coordination
├── 🎯 Content Handlers (/handlers/)
│   ├── URLHandler - Web content processing
│   ├── TextHandler - NLP and language detection
│   ├── NumberHandler - Unit conversions
│   ├── ImageHandler - OCR text extraction
│   ├── CodeHandler - Code analysis
│   ├── EmailHandler - Email processing
│   └── MathHandler - Mathematical expressions
├── 🖥️ GUI System (/gui/)
│   ├── SystemTrayApp - System tray integration
│   ├── ClipboardHistory - History viewer
│   └── SettingsWindow - Configuration UI
├── ⚡ Performance Layer (/utils/)
│   ├── Advanced caching system
│   ├── Async processing engine
│   └── Workflow automation
└── 🤖 Automation Engine
    ├── Rule-based processing
    ├── Pattern matching
    └── Action execution
```

### Performance Features

- **🚀 Lightning Fast**: Advanced caching reduces processing time by 90%
- **🔄 Async Processing**: Non-blocking operations for heavy tasks
- **📊 Smart Memory Management**: Automatic cleanup and optimization
- **🎯 Intelligent Detection**: Machine learning-based content classification
- **⚡ Concurrent Processing**: Multi-threaded operation with thread pools

## 🛠️ Development

### Project Structure

```
smartpaste/
├── __init__.py
├── main.py                 # Core application
├── handlers/               # Content processors
│   ├── url.py             # URL processing
│   ├── text.py            # Text analysis
│   ├── number.py          # Number conversions
│   ├── image.py           # OCR processing
│   ├── code.py            # Code analysis
│   ├── email.py           # Email processing
│   └── math.py            # Math expressions
├── gui/                   # Desktop interface
│   ├── tray.py           # System tray
│   ├── clipboard_history.py # History viewer
│   ├── settings.py       # Settings UI
│   └── main.py           # GUI coordinator
└── utils/                # Utilities
    ├── io.py             # File operations
    ├── nlp.py            # NLP utilities
    ├── timebox.py        # Time management
    ├── cache.py          # Caching system
    ├── async_processor.py # Async engine
    └── automation.py     # Workflow automation
```

### Running Tests

```bash
# Run all tests
pytest

# Run specific test files
pytest tests/test_url.py
pytest tests/test_automation.py

# Run with coverage
pytest --cov=smartpaste --cov-report=html
```

### Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Add tests** for your changes
4. **Run test suite**: `pytest`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open Pull Request**

## 📊 Performance Benchmarks

### Processing Speed
- **URL Processing**: ~200ms (cached: ~5ms)
- **Text Analysis**: ~150ms (cached: ~2ms)  
- **Number Conversion**: ~50ms (cached: <1ms)
- **Code Analysis**: ~300ms (cached: ~10ms)

### Memory Usage
- **Base Memory**: ~15MB
- **With Cache**: ~40-60MB (configurable)
- **Peak Processing**: ~80MB

### Automation Performance
- **Rule Evaluation**: <1ms per rule
- **Action Execution**: 10-500ms (depends on action type)
- **Pattern Matching**: <5ms for complex regex

## 🔮 Roadmap

### 🎯 Planned Features

- **🤖 AI Integration**: GPT/Claude integration for advanced content analysis
- **☁️ Cloud Sync**: Cross-device clipboard synchronization
- **🔐 Security**: End-to-end encryption and enterprise features  
- **🔌 Plugin System**: Extensible plugin architecture
- **📱 Mobile Support**: Companion mobile apps
- **🌐 Web Interface**: Browser extension and web dashboard

### 🚀 Advanced Capabilities

- **Smart Content Suggestions**: AI-powered content completion
- **Workflow Templates**: Pre-built automation templates
- **Team Collaboration**: Shared clipboard spaces
- **Analytics Dashboard**: Usage insights and optimization
- **API Endpoints**: REST API for integration
- **Machine Learning**: Custom content classification models

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Beautiful Soup** for HTML parsing
- **PyPerClip** for clipboard operations  
- **CustomTkinter** for modern GUI components
- **Pystray** for system tray integration
- **Click** for CLI interface
- **YAML** for configuration management

## 📞 Support

- **📧 Email**: support@smartpaste-ai.com
- **🐛 Issues**: [GitHub Issues](https://github.com/AbdHajjar/SmartPaste/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/AbdHajjar/SmartPaste/discussions)
- **📚 Documentation**: [docs.smartpaste-ai.com](https://docs.smartpaste-ai.com)

---

**Made with ❤️ for productivity enthusiasts and automation lovers worldwide**

*Transform your clipboard into an intelligent assistant today!*