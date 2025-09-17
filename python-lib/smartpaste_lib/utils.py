"""
SmartPaste Library Utilities
Helper classes and functions for the SmartPaste library
"""

import sys
import os
import json
import yaml
from typing import Dict, Any, Optional
import hashlib
import time
import logging

# Add parent directories to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from smartpaste.utils.cache import CacheManager as CoreCacheManager
from smartpaste.utils.io import IOUtils as CoreIOUtils


class ConfigManager:
    """Configuration management for SmartPaste library"""
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize configuration manager
        
        Args:
            config_path: Optional path to configuration file
        """
        self.config_path = config_path
        self.config = self._load_default_config()
        
        if config_path and os.path.exists(config_path):
            self.load_config(config_path)
    
    def _load_default_config(self) -> Dict[str, Any]:
        """Load default configuration"""
        return {
            'handlers': {
                'url': {
                    'enabled': True,
                    'timeout': 10,
                    'extract_metadata': True,
                    'generate_summary': True
                },
                'text': {
                    'enabled': True,
                    'detect_language': True,
                    'summarize': True,
                    'min_length': 100
                },
                'number': {
                    'enabled': True,
                    'convert_temperature': True,
                    'convert_length': True,
                    'convert_weight': True
                },
                'email': {
                    'enabled': True,
                    'validate': True
                },
                'code': {
                    'enabled': True,
                    'detect_language': True
                }
            },
            'cache': {
                'enabled': True,
                'max_size': 100,
                'expire_after': 3600
            },
            'logging': {
                'level': 'INFO',
                'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            }
        }
    
    def load_config(self, config_path: str) -> bool:
        """
        Load configuration from file
        
        Args:
            config_path: Path to configuration file
            
        Returns:
            bool: True if successful
        """
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                if config_path.endswith('.yaml') or config_path.endswith('.yml'):
                    file_config = yaml.safe_load(f)
                else:
                    file_config = json.load(f)
            
            # Merge with default config
            self._merge_config(self.config, file_config)
            self.config_path = config_path
            return True
            
        except Exception as e:
            logging.error(f"Error loading config from {config_path}: {e}")
            return False
    
    def save_config(self, config_path: Optional[str] = None) -> bool:
        """
        Save configuration to file
        
        Args:
            config_path: Optional path to save to (uses current path if not provided)
            
        Returns:
            bool: True if successful
        """
        save_path = config_path or self.config_path
        if not save_path:
            return False
        
        try:
            with open(save_path, 'w', encoding='utf-8') as f:
                if save_path.endswith('.yaml') or save_path.endswith('.yml'):
                    yaml.dump(self.config, f, default_flow_style=False)
                else:
                    json.dump(self.config, f, indent=2)
            return True
            
        except Exception as e:
            logging.error(f"Error saving config to {save_path}: {e}")
            return False
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        Get configuration value by key
        
        Args:
            key: Configuration key (supports dot notation)
            default: Default value if key not found
            
        Returns:
            Configuration value
        """
        keys = key.split('.')
        value = self.config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def set(self, key: str, value: Any):
        """
        Set configuration value by key
        
        Args:
            key: Configuration key (supports dot notation)
            value: Value to set
        """
        keys = key.split('.')
        config_dict = self.config
        
        for k in keys[:-1]:
            if k not in config_dict:
                config_dict[k] = {}
            config_dict = config_dict[k]
        
        config_dict[keys[-1]] = value
    
    def _merge_config(self, base: Dict[str, Any], update: Dict[str, Any]):
        """Recursively merge configuration dictionaries"""
        for key, value in update.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                self._merge_config(base[key], value)
            else:
                base[key] = value


class CacheManager:
    """Cache management wrapper"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize cache manager"""
        self.config = config or {}
        self._core_cache = CoreCacheManager()
    
    def get(self, key: str) -> Optional[Any]:
        """Get item from cache"""
        return self._core_cache.get(key)
    
    def set(self, key: str, value: Any, expire_after: Optional[int] = None):
        """Set item in cache"""
        self._core_cache.set(key, value, expire_after)
    
    def delete(self, key: str):
        """Delete item from cache"""
        self._core_cache.delete(key)
    
    def clear(self):
        """Clear all cache"""
        self._core_cache.clear_cache()
    
    def get_size(self) -> int:
        """Get cache size"""
        return self._core_cache.get_cache_size()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return self._core_cache.get_cache_stats()
    
    def generate_key(self, content: str) -> str:
        """Generate cache key for content"""
        return self._core_cache.generate_key(content)


class FormatUtils:
    """Formatting utilities"""
    
    @staticmethod
    def format_json(data: Dict[str, Any], indent: int = 2) -> str:
        """Format data as JSON"""
        return json.dumps(data, indent=indent, ensure_ascii=False)
    
    @staticmethod
    def format_yaml(data: Dict[str, Any]) -> str:
        """Format data as YAML"""
        return yaml.dump(data, default_flow_style=False, allow_unicode=True)
    
    @staticmethod
    def format_markdown(data: Dict[str, Any]) -> str:
        """Format data as Markdown"""
        lines = []
        
        if 'original_content' in data:
            lines.append("# SmartPaste Processing Result")
            lines.append("")
            lines.append("## Original Content")
            lines.append(f"```\n{data['original_content']}\n```")
            lines.append("")
        
        if 'enriched_content' in data and data['enriched_content'] != data.get('original_content'):
            lines.append("## Enriched Content")
            lines.append(f"```\n{data['enriched_content']}\n```")
            lines.append("")
        
        if 'detected_types' in data and data['detected_types']:
            lines.append("## Detected Types")
            for type_name in data['detected_types']:
                lines.append(f"- {type_name}")
            lines.append("")
        
        if 'handlers' in data:
            lines.append("## Handler Results")
            for handler_name, handler_data in data['handlers'].items():
                lines.append(f"### {handler_name.title()}")
                if isinstance(handler_data, dict):
                    for key, value in handler_data.items():
                        if key not in ['original_content', 'enriched_content']:
                            lines.append(f"- **{key}**: {value}")
                lines.append("")
        
        return '\n'.join(lines)
    
    @staticmethod
    def format_text(data: Dict[str, Any]) -> str:
        """Format data as plain text"""
        lines = []
        
        lines.append("SmartPaste Processing Result")
        lines.append("=" * 30)
        
        if 'original_content' in data:
            lines.append(f"Original: {data['original_content'][:100]}...")
        
        if 'enriched_content' in data:
            lines.append(f"Enriched: {data['enriched_content']}")
        
        if 'detected_types' in data:
            lines.append(f"Types: {', '.join(data['detected_types'])}")
        
        if 'processing_time' in data:
            lines.append(f"Processing Time: {data['processing_time']:.3f}s")
        
        return '\n'.join(lines)
    
    @staticmethod
    def format_data(data: Dict[str, Any], format_type: str) -> str:
        """
        Format data in specified format
        
        Args:
            data: Data to format
            format_type: Format type ('json', 'yaml', 'markdown', 'text')
            
        Returns:
            str: Formatted data
        """
        if format_type == 'json':
            return FormatUtils.format_json(data)
        elif format_type == 'yaml':
            return FormatUtils.format_yaml(data)
        elif format_type == 'markdown':
            return FormatUtils.format_markdown(data)
        elif format_type == 'text':
            return FormatUtils.format_text(data)
        else:
            return str(data)


class TimestampUtils:
    """Timestamp utilities"""
    
    @staticmethod
    def get_timestamp() -> float:
        """Get current timestamp"""
        return time.time()
    
    @staticmethod
    def format_timestamp(timestamp: float, format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
        """Format timestamp as string"""
        return time.strftime(format_str, time.localtime(timestamp))
    
    @staticmethod
    def get_iso_timestamp() -> str:
        """Get ISO format timestamp"""
        from datetime import datetime
        return datetime.now().isoformat()


class HashUtils:
    """Hash utilities"""
    
    @staticmethod
    def hash_content(content: str) -> str:
        """Generate hash for content"""
        return hashlib.sha256(content.encode('utf-8')).hexdigest()
    
    @staticmethod
    def hash_short(content: str, length: int = 8) -> str:
        """Generate short hash for content"""
        return HashUtils.hash_content(content)[:length]


# Export all utilities
__all__ = [
    'ConfigManager',
    'CacheManager', 
    'FormatUtils',
    'TimestampUtils',
    'HashUtils',
]