# SmartPaste - GitHub Copilot Instructions

This is SmartPaste, a context-aware AI clipboard assistant built in Python. The project monitors clipboard content and intelligently enriches it with contextual information.

## Project Overview

SmartPaste is designed as a modular, extensible system with the following key components:

### Architecture
- **Main Application** (`smartpaste/main.py`): Entry point, clipboard monitoring loop, configuration management
- **Content Handlers** (`smartpaste/handlers/`): Specialized processors for different content types
- **Utilities** (`smartpaste/utils/`): Helper modules for I/O, NLP, and time operations
- **Tests** (`tests/`): Comprehensive test suite with pytest

### Core Features
1. **URL Handler**: Extracts titles, generates summaries, identifies keywords from web pages
2. **Number Handler**: Automatic unit conversions (temperature, length, weight, volume)
3. **Text Handler**: Language detection, text summarization, content analysis
4. **Image Handler**: OCR text extraction from images (optional)

## Development Guidelines

### Code Style
- Use **type annotations** for all function parameters and return values
- Follow **PEP 8** style guidelines
- Include comprehensive **docstrings** for all classes and methods
- Use **descriptive variable names** and clear logic flow

### Error Handling
- Gracefully handle missing optional dependencies (langdetect, pytesseract, etc.)
- Log errors appropriately but don't crash the application
- Provide fallback functionality when possible

### Testing
- Write **unit tests** for all handlers and utility functions
- Use **pytest fixtures** for common test data
- Mock external dependencies (web requests, clipboard access)
- Test edge cases and error conditions

### Configuration
- All features should be configurable via `config.yaml`
- Provide sensible defaults in code
- Support both enabling/disabling features and fine-tuning parameters

## When Contributing Code

### Adding New Content Handlers
1. Create handler class in `smartpaste/handlers/new_handler.py`
2. Implement `process(content: str) -> Optional[Dict[str, Any]]` method
3. Add configuration options to `config.example.yaml`
4. Register in `smartpaste/handlers/__init__.py`
5. Write comprehensive tests in `tests/test_new_handler.py`

### Handler Return Format
All handlers should return a dictionary with these keys:
- `original_content`: The original clipboard content
- `enriched_content`: Enhanced version for potential clipboard replacement
- Additional keys specific to the handler (e.g., `title`, `summary`, `conversions`)

### Utility Functions
- **IOUtils**: File operations, markdown generation, data persistence
- **NLPUtils**: Text processing, language detection, keyword extraction
- **TimeboxUtils**: Date/time formatting, file organization

### Dependencies
- **Core**: pyperclip, pyyaml, click, requests, beautifulsoup4, readability-lxml
- **NLP**: langdetect, sentence-transformers, scikit-learn
- **Optional**: pytesseract, pillow (for OCR)
- **Development**: pytest, black, mypy, flake8

## Common Patterns

### Safe Import Pattern
```python
try:
    import optional_library
    LIBRARY_AVAILABLE = True
except ImportError:
    LIBRARY_AVAILABLE = False
```

### Handler Structure
```python
class ExampleHandler:
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.logger = logging.getLogger(__name__)
    
    def process(self, content: str) -> Optional[Dict[str, Any]]:
        # Process content and return enriched result
        pass
```

### Configuration Access
```python
# Use .get() with defaults for all config access
self.enabled = self.config.get("enabled", True)
self.timeout = self.config.get("timeout", 10)
```

## Focus Areas for AI Assistance

1. **Handler Improvements**: Better text summarization, more unit types, enhanced OCR
2. **New Content Types**: Code detection, email parsing, mathematical expressions
3. **Performance**: Async processing, caching, memory optimization
4. **User Experience**: Better error messages, progress indicators, status feedback
5. **Integration**: Plugin system, API endpoints, cloud synchronization

## Testing Strategy

- **Unit Tests**: Individual handler logic, utility functions
- **Integration Tests**: Full application workflow, configuration loading
- **Mock Tests**: External services, clipboard operations, file system
- **Edge Cases**: Empty content, malformed data, network failures

Remember: SmartPaste should be helpful, non-intrusive, and respect user privacy. All processing happens locally unless explicitly configured otherwise.