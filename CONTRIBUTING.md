# Contributing to SmartPaste

Thank you for your interest in contributing to SmartPaste! This document provides guidelines and information for contributors.

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## How to Contribute

### Reporting Bugs

Before submitting a bug report:
1. Check the [existing issues](https://github.com/AbdHajjar/smartpaste/issues) to avoid duplicates
2. Update to the latest version to see if the issue persists
3. Collect relevant information (OS, Python version, configuration, error messages)

When submitting a bug report, include:
- Clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Relevant error messages and logs
- System information (OS, Python version, dependencies)
- Configuration file (with sensitive data removed)

### Suggesting Features

Feature requests are welcome! Please:
1. Check existing issues and discussions for similar requests
2. Provide a clear description of the proposed feature
3. Explain the use case and benefits
4. Consider implementation complexity and maintenance burden

### Contributing Code

#### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/AbdHajjar/smartpaste.git
   cd smartpaste
   ```
3. **Set up development environment**:
   ```bash
   pip install -e ".[dev,ocr]"
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Guidelines

**Code Style:**
- Follow PEP 8 style guidelines
- Use type annotations for all functions
- Write comprehensive docstrings
- Use descriptive variable and function names
- Maximum line length: 88 characters (Black default)

**Code Quality:**
```bash
# Format code
black smartpaste/ tests/

# Type checking
mypy smartpaste/

# Linting
flake8 smartpaste/

# Run tests
pytest
```

**Testing:**
- Write tests for new functionality
- Maintain or improve test coverage
- Test edge cases and error conditions
- Mock external dependencies
- Use descriptive test names

#### Adding New Content Handlers

To add a new content handler:

1. **Create the handler file** in `smartpaste/handlers/`:
```python
# smartpaste/handlers/my_handler.py
from typing import Dict, Any, Optional

class MyHandler:
    """Handler for processing my content type."""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.logger = logging.getLogger(__name__)
    
    def process(self, content: str) -> Optional[Dict[str, Any]]:
        """Process content and return enriched result.
        
        Args:
            content: Input content from clipboard
            
        Returns:
            Dictionary with processed results or None if processing fails
        """
        # Implementation here
        return {
            "original_content": content,
            "enriched_content": enhanced_content,
            # Additional handler-specific keys
        }
```

2. **Register the handler** in `smartpaste/handlers/__init__.py`:
```python
from .my_handler import MyHandler

__all__ = [..., "MyHandler"]
```

3. **Add configuration** to `config.example.yaml`:
```yaml
my_handler:
  enabled: true
  option1: value1
  option2: value2
```

4. **Write comprehensive tests** in `tests/test_my_handler.py`:
```python
import pytest
from smartpaste.handlers.my_handler import MyHandler

class TestMyHandler:
    def setup_method(self):
        self.handler = MyHandler()
    
    def test_process_valid_input(self):
        result = self.handler.process("test input")
        assert result is not None
        assert "original_content" in result
```

5. **Update documentation** in README.md and docstrings

#### Submitting Changes

1. **Ensure code quality**:
   ```bash
   black smartpaste/ tests/
   mypy smartpaste/
   flake8 smartpaste/
   pytest
   ```

2. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add new handler for X content type"
   ```

3. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request** on GitHub with:
   - Clear title and description
   - Reference to related issues
   - Screenshots/examples if applicable
   - Confirmation that tests pass

## Development Setup

### Prerequisites

- Python 3.10 or higher
- Git
- (Optional) Tesseract OCR for image processing

### Local Development

```bash
# Clone the repository
git clone https://github.com/AbdHajjar/smartpaste.git
cd smartpaste

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install development dependencies
pip install -e ".[dev,ocr]"

# Run tests
pytest

# Start SmartPaste
python -m smartpaste
```

### Project Structure

```
smartpaste/
├── smartpaste/           # Main package
│   ├── __init__.py      # Package initialization
│   ├── main.py          # Application entry point
│   ├── handlers/        # Content type handlers
│   │   ├── __init__.py
│   │   ├── url.py       # URL processing
│   │   ├── number.py    # Number/unit conversion
│   │   ├── text.py      # Text analysis
│   │   └── image.py     # OCR processing
│   └── utils/           # Utility modules
│       ├── __init__.py
│       ├── io.py        # File I/O operations
│       ├── nlp.py       # NLP utilities
│       └── timebox.py   # Time/date utilities
├── tests/               # Test suite
│   ├── conftest.py      # Test configuration
│   ├── test_url.py      # URL handler tests
│   ├── test_number.py   # Number handler tests
│   └── test_text.py     # Text handler tests
├── pyproject.toml       # Project configuration
├── config.example.yaml  # Example configuration
├── README.md            # Project documentation
└── CONTRIBUTING.md      # This file
```

## Release Process

1. Update version in `pyproject.toml` and `smartpaste/__init__.py`
2. Update `CHANGELOG.md` with new version details
3. Create and push version tag: `git tag v1.0.0 && git push origin v1.0.0`
4. Create GitHub release with changelog notes
5. Build and upload to PyPI (maintainers only)

## Getting Help

- **Documentation**: Check the README and code comments
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Request reviews from maintainers

## Recognition

Contributors are recognized in:
- GitHub contributors list
- Release notes
- Project documentation

Thank you for contributing to SmartPaste! 🚀