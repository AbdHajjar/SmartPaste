"""
SmartPaste Library Handler Wrappers
Wrapper classes for core SmartPaste handlers
"""

import sys
import os
from typing import Dict, Any, Optional

# Add parent directories to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from smartpaste.handlers.url import URLHandler as CoreURLHandler
from smartpaste.handlers.text import TextHandler as CoreTextHandler
from smartpaste.handlers.number import NumberHandler as CoreNumberHandler
from smartpaste.handlers.email import EmailHandler as CoreEmailHandler
from smartpaste.handlers.code import CodeHandler as CoreCodeHandler


class BaseProcessor:
    """Base class for content processors"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize processor with configuration"""
        self.config = config or {}
        self._handler = None
    
    def process(self, content: str) -> Optional[Dict[str, Any]]:
        """Process content with the handler"""
        if self._handler is None:
            raise NotImplementedError("Handler not initialized")
        return self._handler.process(content)


class URLProcessor(BaseProcessor):
    """URL content processor"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__(config)
        self._handler = CoreURLHandler(self.config)
    
    def extract_title(self, url: str) -> Optional[str]:
        """Extract title from URL"""
        result = self.process(url)
        return result.get('title') if result else None
    
    def extract_description(self, url: str) -> Optional[str]:
        """Extract description from URL"""
        result = self.process(url)
        return result.get('description') if result else None
    
    def extract_keywords(self, url: str) -> Optional[list]:
        """Extract keywords from URL"""
        result = self.process(url)
        return result.get('keywords') if result else None
    
    def get_summary(self, url: str) -> Optional[str]:
        """Get summary from URL"""
        result = self.process(url)
        return result.get('summary') if result else None


class TextProcessor(BaseProcessor):
    """Text content processor"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__(config)
        self._handler = CoreTextHandler(self.config)
    
    def detect_language(self, text: str) -> Optional[str]:
        """Detect language of text"""
        result = self.process(text)
        return result.get('language') if result else None
    
    def get_word_count(self, text: str) -> int:
        """Get word count of text"""
        result = self.process(text)
        return result.get('word_count', 0) if result else 0
    
    def get_character_count(self, text: str) -> int:
        """Get character count of text"""
        result = self.process(text)
        return result.get('character_count', 0) if result else 0
    
    def summarize(self, text: str) -> Optional[str]:
        """Summarize text"""
        result = self.process(text)
        return result.get('summary') if result else None
    
    def extract_keywords(self, text: str) -> Optional[list]:
        """Extract keywords from text"""
        result = self.process(text)
        return result.get('keywords') if result else None


class NumberProcessor(BaseProcessor):
    """Number/measurement processor"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__(config)
        self._handler = CoreNumberHandler(self.config)
    
    def convert_temperature(self, value: float, from_unit: str, to_unit: str) -> Optional[float]:
        """Convert temperature units"""
        # Create test content with the value and unit
        content = f"{value}°{from_unit.upper()}"
        result = self.process(content)
        
        if result and 'conversions' in result:
            for conversion in result['conversions']:
                if to_unit.lower() in conversion.lower():
                    # Extract number from conversion string
                    import re
                    match = re.search(r'([\d.]+)', conversion)
                    if match:
                        return float(match.group(1))
        return None
    
    def convert_length(self, value: float, from_unit: str, to_unit: str) -> Optional[float]:
        """Convert length units"""
        content = f"{value}{from_unit}"
        result = self.process(content)
        
        if result and 'conversions' in result:
            for conversion in result['conversions']:
                if to_unit in conversion:
                    import re
                    match = re.search(r'([\d.]+)', conversion)
                    if match:
                        return float(match.group(1))
        return None
    
    def convert_weight(self, value: float, from_unit: str, to_unit: str) -> Optional[float]:
        """Convert weight units"""
        content = f"{value}{from_unit}"
        result = self.process(content)
        
        if result and 'conversions' in result:
            for conversion in result['conversions']:
                if to_unit in conversion:
                    import re
                    match = re.search(r'([\d.]+)', conversion)
                    if match:
                        return float(match.group(1))
        return None
    
    def get_conversions(self, number_text: str) -> Optional[list]:
        """Get all available conversions"""
        result = self.process(number_text)
        return result.get('conversions') if result else None


class EmailProcessor(BaseProcessor):
    """Email processor"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__(config)
        self._handler = CoreEmailHandler(self.config)
    
    def validate_email(self, email: str) -> bool:
        """Validate email address"""
        result = self.process(email)
        return result.get('is_valid', False) if result else False
    
    def extract_domain(self, email: str) -> Optional[str]:
        """Extract domain from email"""
        result = self.process(email)
        return result.get('domain') if result else None
    
    def extract_local_part(self, email: str) -> Optional[str]:
        """Extract local part from email"""
        result = self.process(email)
        return result.get('local_part') if result else None


class CodeProcessor(BaseProcessor):
    """Code processor"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__(config)
        self._handler = CoreCodeHandler(self.config)
    
    def detect_language(self, code: str) -> Optional[str]:
        """Detect programming language"""
        result = self.process(code)
        return result.get('language') if result else None
    
    def is_code(self, content: str) -> bool:
        """Check if content is code"""
        result = self.process(content)
        return result.get('is_code', False) if result else False
    
    def get_complexity(self, code: str) -> Optional[Dict[str, Any]]:
        """Get code complexity metrics"""
        result = self.process(code)
        return result.get('complexity') if result else None


class ImageProcessor(BaseProcessor):
    """Image processor (OCR)"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__(config)
        # Image handler would be initialized here if available
        self._handler = None
    
    def extract_text(self, image_path: str) -> Optional[str]:
        """Extract text from image using OCR"""
        # This would use the image handler if available
        if self._handler is None:
            return None
        return self._handler.process(image_path)
    
    def is_available(self) -> bool:
        """Check if image processing is available"""
        return self._handler is not None


# Export all processors
__all__ = [
    'BaseProcessor',
    'URLProcessor',
    'TextProcessor', 
    'NumberProcessor',
    'EmailProcessor',
    'CodeProcessor',
    'ImageProcessor',
]