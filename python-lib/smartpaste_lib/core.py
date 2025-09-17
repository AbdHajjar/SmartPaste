"""
SmartPaste API Core Module
Main API interface for the SmartPaste library
"""

import sys
import os
from typing import Dict, Any, Optional, List
import logging

# Add parent directories to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from smartpaste.handlers import URLHandler, TextHandler, NumberHandler, EmailHandler, CodeHandler
from smartpaste.utils.cache import CacheManager
from smartpaste.utils.io import IOUtils


class SmartPasteAPI:
    """
    Main API class for SmartPaste functionality
    Provides high-level interface for content processing
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize SmartPaste API
        
        Args:
            config: Optional configuration dictionary
        """
        self.config = config or {}
        self.logger = logging.getLogger(__name__)
        
        # Initialize components
        self.cache_manager = CacheManager()
        self.io_utils = IOUtils()
        
        # Initialize handlers
        self.handlers = self._initialize_handlers()
        
    def _initialize_handlers(self) -> Dict[str, Any]:
        """Initialize all content handlers"""
        handlers = {}
        
        # Get handler configurations
        handler_config = self.config.get('handlers', {})
        
        # Initialize each handler if enabled
        if handler_config.get('url', {}).get('enabled', True):
            handlers['url'] = URLHandler(handler_config.get('url', {}))
            
        if handler_config.get('text', {}).get('enabled', True):
            handlers['text'] = TextHandler(handler_config.get('text', {}))
            
        if handler_config.get('number', {}).get('enabled', True):
            handlers['number'] = NumberHandler(handler_config.get('number', {}))
            
        if handler_config.get('email', {}).get('enabled', True):
            handlers['email'] = EmailHandler(handler_config.get('email', {}))
            
        if handler_config.get('code', {}).get('enabled', True):
            handlers['code'] = CodeHandler(handler_config.get('code', {}))
        
        return handlers
    
    def process_content(self, content: str) -> Dict[str, Any]:
        """
        Process content with all applicable handlers
        
        Args:
            content: Content to process
            
        Returns:
            dict: Processing results
        """
        try:
            # Check cache first
            cache_key = self.cache_manager.generate_key(content)
            cached_result = self.cache_manager.get(cache_key)
            
            if cached_result:
                self.logger.debug(f"Cache hit for content: {content[:50]}...")
                return cached_result
            
            # Process with handlers
            result = {
                'original_content': content,
                'enriched_content': content,
                'detected_types': [],
                'handlers': {},
                'timestamp': self.io_utils.get_timestamp(),
                'processing_time': 0
            }
            
            import time
            start_time = time.time()
            
            # Try each handler
            for name, handler in self.handlers.items():
                try:
                    handler_result = handler.process(content)
                    if handler_result:
                        result['detected_types'].append(name)
                        result['handlers'][name] = handler_result
                        
                        # Update enriched content if handler provides enhancement
                        if 'enriched_content' in handler_result:
                            result['enriched_content'] = handler_result['enriched_content']
                            
                except Exception as e:
                    self.logger.warning(f"Handler {name} failed: {e}")
                    continue
            
            # Calculate processing time
            result['processing_time'] = time.time() - start_time
            
            # Cache result
            self.cache_manager.set(cache_key, result)
            
            self.logger.info(f"Processed content with {len(result['detected_types'])} handlers")
            return result
            
        except Exception as e:
            self.logger.error(f"Error processing content: {e}")
            return {
                'original_content': content,
                'enriched_content': content,
                'detected_types': [],
                'handlers': {},
                'error': str(e),
                'timestamp': self.io_utils.get_timestamp()
            }
    
    def process_with_handler(self, content: str, handler_name: str) -> Optional[Dict[str, Any]]:
        """
        Process content with specific handler
        
        Args:
            content: Content to process
            handler_name: Name of handler to use
            
        Returns:
            dict: Handler result or None if handler not found
        """
        if handler_name not in self.handlers:
            self.logger.error(f"Handler not found: {handler_name}")
            return None
        
        try:
            handler = self.handlers[handler_name]
            return handler.process(content)
        except Exception as e:
            self.logger.error(f"Error in handler {handler_name}: {e}")
            return None
    
    def get_available_handlers(self) -> List[str]:
        """
        Get list of available handler names
        
        Returns:
            list: Available handler names
        """
        return list(self.handlers.keys())
    
    def get_handler_info(self, handler_name: str) -> Optional[Dict[str, Any]]:
        """
        Get information about specific handler
        
        Args:
            handler_name: Name of handler
            
        Returns:
            dict: Handler information or None if not found
        """
        if handler_name not in self.handlers:
            return None
        
        handler = self.handlers[handler_name]
        return {
            'name': handler_name,
            'class': handler.__class__.__name__,
            'description': handler.__class__.__doc__,
            'config': getattr(handler, 'config', {})
        }
    
    def update_config(self, new_config: Dict[str, Any]):
        """
        Update configuration and reinitialize handlers
        
        Args:
            new_config: New configuration dictionary
        """
        self.config.update(new_config)
        self.handlers = self._initialize_handlers()
        self.logger.info("Configuration updated and handlers reinitialized")
    
    def clear_cache(self):
        """Clear processing cache"""
        self.cache_manager.clear_cache()
        self.logger.info("Cache cleared")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics
        
        Returns:
            dict: Cache statistics
        """
        return self.cache_manager.get_cache_stats()
    
    def export_results(self, results: Dict[str, Any], format: str = 'json', 
                      file_path: Optional[str] = None) -> str:
        """
        Export processing results
        
        Args:
            results: Processing results to export
            format: Export format ('json', 'yaml', 'markdown')
            file_path: Optional file path to save to
            
        Returns:
            str: Exported content
        """
        return self.io_utils.export_data(results, format, file_path)