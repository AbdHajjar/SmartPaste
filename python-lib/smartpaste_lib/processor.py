"""
SmartPaste Content Processor
Simplified interface for content processing
"""

import sys
import os
from typing import Dict, Any, Optional
import logging

# Add parent directories to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from .core import SmartPasteAPI


class ContentProcessor:
    """
    Simplified content processor interface
    Easy-to-use wrapper around SmartPasteAPI
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize content processor
        
        Args:
            config: Optional configuration dictionary
        """
        self.api = SmartPasteAPI(config)
        self.logger = logging.getLogger(__name__)
    
    def process(self, content: str) -> Dict[str, Any]:
        """
        Process content and return enriched results
        
        Args:
            content: Content to process
            
        Returns:
            dict: Processing results
        """
        return self.api.process_content(content)
    
    def process_url(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Process URL content specifically
        
        Args:
            url: URL to process
            
        Returns:
            dict: URL processing results
        """
        return self.api.process_with_handler(url, 'url')
    
    def process_text(self, text: str) -> Optional[Dict[str, Any]]:
        """
        Process text content specifically
        
        Args:
            text: Text to process
            
        Returns:
            dict: Text processing results
        """
        return self.api.process_with_handler(text, 'text')
    
    def process_number(self, number_text: str) -> Optional[Dict[str, Any]]:
        """
        Process number/measurement content specifically
        
        Args:
            number_text: Number text to process
            
        Returns:
            dict: Number processing results
        """
        return self.api.process_with_handler(number_text, 'number')
    
    def process_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Process email content specifically
        
        Args:
            email: Email to process
            
        Returns:
            dict: Email processing results
        """
        return self.api.process_with_handler(email, 'email')
    
    def process_code(self, code: str) -> Optional[Dict[str, Any]]:
        """
        Process code content specifically
        
        Args:
            code: Code to process
            
        Returns:
            dict: Code processing results
        """
        return self.api.process_with_handler(code, 'code')
    
    def get_enriched_content(self, content: str) -> str:
        """
        Get enriched version of content
        
        Args:
            content: Original content
            
        Returns:
            str: Enriched content
        """
        result = self.process(content)
        return result.get('enriched_content', content)
    
    def is_url(self, content: str) -> bool:
        """
        Check if content is a URL
        
        Args:
            content: Content to check
            
        Returns:
            bool: True if content is URL
        """
        result = self.process_url(content)
        return result is not None
    
    def is_email(self, content: str) -> bool:
        """
        Check if content is an email
        
        Args:
            content: Content to check
            
        Returns:
            bool: True if content is email
        """
        result = self.process_email(content)
        return result is not None
    
    def get_content_types(self, content: str) -> list:
        """
        Get detected content types
        
        Args:
            content: Content to analyze
            
        Returns:
            list: List of detected content types
        """
        result = self.process(content)
        return result.get('detected_types', [])
    
    def get_summary(self, content: str) -> Optional[str]:
        """
        Get summary of content if available
        
        Args:
            content: Content to summarize
            
        Returns:
            str: Summary or None if not available
        """
        result = self.process(content)
        
        # Check for URL summary
        if 'url' in result.get('handlers', {}):
            url_result = result['handlers']['url']
            return url_result.get('summary') or url_result.get('description')
        
        # Check for text summary
        if 'text' in result.get('handlers', {}):
            text_result = result['handlers']['text']
            return text_result.get('summary')
        
        return None
    
    def get_metadata(self, content: str) -> Dict[str, Any]:
        """
        Get metadata for content
        
        Args:
            content: Content to analyze
            
        Returns:
            dict: Content metadata
        """
        result = self.process(content)
        metadata = {
            'content_types': result.get('detected_types', []),
            'processing_time': result.get('processing_time', 0),
            'timestamp': result.get('timestamp'),
            'handlers_used': len(result.get('handlers', {}))
        }
        
        # Add handler-specific metadata
        for handler_name, handler_result in result.get('handlers', {}).items():
            if isinstance(handler_result, dict):
                for key, value in handler_result.items():
                    if key not in ['enriched_content', 'original_content']:
                        metadata[f'{handler_name}_{key}'] = value
        
        return metadata