"""
SmartPaste Python Library
Core functionality for intelligent clipboard content analysis
"""

__version__ = "1.0.0"
__author__ = "SmartPaste Team"
__email__ = "team@smartpaste.app"
__description__ = "Context-aware clipboard processing and content enrichment"

# Core imports
from .core import SmartPasteAPI
from .processor import ContentProcessor
from .handlers import (
    URLProcessor,
    TextProcessor, 
    NumberProcessor,
    EmailProcessor,
    CodeProcessor,
    ImageProcessor
)

# Utility imports
from .utils import (
    ConfigManager,
    CacheManager,
    FormatUtils
)

# Exception classes
class SmartPasteError(Exception):
    """Base exception for SmartPaste library"""
    pass

class ProcessingError(SmartPasteError):
    """Exception raised during content processing"""
    pass

class ConfigurationError(SmartPasteError):
    """Exception raised for configuration issues"""
    pass

class HandlerError(SmartPasteError):
    """Exception raised by content handlers"""
    pass

# Main API class for easy access
__all__ = [
    # Core API
    'SmartPasteAPI',
    'ContentProcessor',
    
    # Handlers
    'URLProcessor',
    'TextProcessor',
    'NumberProcessor', 
    'EmailProcessor',
    'CodeProcessor',
    'ImageProcessor',
    
    # Utilities
    'ConfigManager',
    'CacheManager',
    'FormatUtils',
    
    # Exceptions
    'SmartPasteError',
    'ProcessingError',
    'ConfigurationError',
    'HandlerError',
    
    # Metadata
    '__version__',
    '__author__',
    '__email__',
    '__description__',
]

# Convenience function for quick processing
def process_content(content: str, config: dict = None) -> dict:
    """
    Quick content processing function
    
    Args:
        content: Content to process
        config: Optional configuration dict
        
    Returns:
        dict: Processing results
        
    Example:
        >>> import smartpaste_lib
        >>> result = smartpaste_lib.process_content("https://example.com")
        >>> print(result['title'])
    """
    processor = ContentProcessor(config=config)
    return processor.process(content)

def get_clipboard_content() -> str:
    """
    Get current clipboard content
    
    Returns:
        str: Current clipboard content
        
    Example:
        >>> import smartpaste_lib
        >>> content = smartpaste_lib.get_clipboard_content()
        >>> result = smartpaste_lib.process_content(content)
    """
    try:
        import pyperclip
        return pyperclip.paste()
    except ImportError:
        raise SmartPasteError("pyperclip not available - install with: pip install pyperclip")

def process_clipboard(config: dict = None) -> dict:
    """
    Process current clipboard content
    
    Args:
        config: Optional configuration dict
        
    Returns:
        dict: Processing results
        
    Example:
        >>> import smartpaste_lib
        >>> result = smartpaste_lib.process_clipboard()
        >>> print(result)
    """
    content = get_clipboard_content()
    return process_content(content, config)

# Library initialization
def _check_dependencies():
    """Check for required dependencies"""
    required = ['pyperclip', 'requests', 'beautifulsoup4', 'pyyaml']
    missing = []
    
    for dep in required:
        try:
            __import__(dep)
        except ImportError:
            missing.append(dep)
    
    if missing:
        import warnings
        warnings.warn(
            f"Missing optional dependencies: {', '.join(missing)}. "
            f"Install with: pip install {' '.join(missing)}"
        )

# Initialize on import
_check_dependencies()