"""
Advanced Caching System for SmartPaste AI

Provides intelligent caching, memory management, and performance optimization.
"""

import time
import hashlib
import json
import pickle
import threading
from pathlib import Path
from typing import Any, Dict, Optional, Tuple, Union
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import weakref
import logging


@dataclass
class CacheEntry:
    """Represents a cached item with metadata."""
    value: Any
    created_at: datetime
    last_accessed: datetime
    access_count: int = 0
    size_bytes: int = 0
    ttl: Optional[float] = None  # Time to live in seconds
    
    def is_expired(self) -> bool:
        """Check if the cache entry has expired."""
        if self.ttl is None:
            return False
        return (datetime.now() - self.created_at).total_seconds() > self.ttl
    
    def touch(self) -> None:
        """Update access time and count."""
        self.last_accessed = datetime.now()
        self.access_count += 1


class LRUCache:
    """
    Advanced LRU Cache with TTL, size limits, and performance monitoring.
    """
    
    def __init__(self, max_size: int = 1000, max_memory_mb: int = 100, 
                 default_ttl: Optional[float] = None):
        """Initialize the LRU cache.
        
        Args:
            max_size: Maximum number of items to cache
            max_memory_mb: Maximum memory usage in MB
            default_ttl: Default time-to-live in seconds
        """
        self.max_size = max_size
        self.max_memory_bytes = max_memory_mb * 1024 * 1024
        self.default_ttl = default_ttl
        self.cache: Dict[str, CacheEntry] = {}
        self.access_order: Dict[str, float] = {}  # key -> timestamp
        self.lock = threading.RLock()
        self.stats = CacheStats()
        self.logger = logging.getLogger(__name__)
        
        # Start cleanup thread
        self._cleanup_thread = threading.Thread(target=self._periodic_cleanup, daemon=True)
        self._cleanup_thread.start()
    
    def get(self, key: str) -> Optional[Any]:
        """Get item from cache."""
        with self.lock:
            if key not in self.cache:
                self.stats.misses += 1
                return None
            
            entry = self.cache[key]
            
            # Check if expired
            if entry.is_expired():
                del self.cache[key]
                del self.access_order[key]
                self.stats.misses += 1
                self.stats.expired += 1
                return None
            
            # Update access info
            entry.touch()
            self.access_order[key] = time.time()
            self.stats.hits += 1
            
            return entry.value
    
    def put(self, key: str, value: Any, ttl: Optional[float] = None) -> bool:
        """Put item in cache."""
        with self.lock:
            # Calculate size
            try:
                size_bytes = len(pickle.dumps(value))
            except Exception:
                size_bytes = 1024  # Fallback estimate
            
            # Check memory limit
            if size_bytes > self.max_memory_bytes:
                self.logger.warning(f"Item too large for cache: {size_bytes} bytes")
                return False
            
            # Create entry
            entry = CacheEntry(
                value=value,
                created_at=datetime.now(),
                last_accessed=datetime.now(),
                size_bytes=size_bytes,
                ttl=ttl or self.default_ttl
            )
            
            # Add to cache
            self.cache[key] = entry
            self.access_order[key] = time.time()
            self.stats.puts += 1
            
            # Enforce limits
            self._enforce_limits()
            
            return True
    
    def delete(self, key: str) -> bool:
        """Delete item from cache."""
        with self.lock:
            if key in self.cache:
                del self.cache[key]
                del self.access_order[key]
                self.stats.deletes += 1
                return True
            return False
    
    def clear(self) -> None:
        """Clear all cache entries."""
        with self.lock:
            self.cache.clear()
            self.access_order.clear()
            self.stats.clears += 1
    
    def _enforce_limits(self) -> None:
        """Enforce size and memory limits."""
        # Enforce max_size
        while len(self.cache) > self.max_size:
            self._evict_lru()
        
        # Enforce memory limit
        current_memory = sum(entry.size_bytes for entry in self.cache.values())
        while current_memory > self.max_memory_bytes and self.cache:
            evicted_size = self._evict_lru()
            current_memory -= evicted_size
    
    def _evict_lru(self) -> int:
        """Evict least recently used item."""
        if not self.access_order:
            return 0
        
        # Find LRU item
        lru_key = min(self.access_order, key=self.access_order.get)
        evicted_size = self.cache[lru_key].size_bytes
        
        del self.cache[lru_key]
        del self.access_order[lru_key]
        self.stats.evictions += 1
        
        return evicted_size
    
    def _periodic_cleanup(self) -> None:
        """Periodic cleanup of expired entries."""
        while True:
            time.sleep(60)  # Run every minute
            try:
                with self.lock:
                    expired_keys = [
                        key for key, entry in self.cache.items()
                        if entry.is_expired()
                    ]
                    
                    for key in expired_keys:
                        del self.cache[key]
                        del self.access_order[key]
                        self.stats.expired += 1
                        
            except Exception as e:
                self.logger.error(f"Error in cache cleanup: {e}")
    
    def get_stats(self) -> 'CacheStats':
        """Get cache statistics."""
        with self.lock:
            self.stats.current_size = len(self.cache)
            self.stats.current_memory_mb = sum(
                entry.size_bytes for entry in self.cache.values()
            ) / (1024 * 1024)
            return self.stats
    
    def get_info(self) -> Dict[str, Any]:
        """Get detailed cache information."""
        with self.lock:
            stats = self.get_stats()
            return {
                'stats': stats.__dict__,
                'size': len(self.cache),
                'memory_usage_mb': stats.current_memory_mb,
                'hit_rate': stats.hit_rate(),
                'top_accessed': self._get_top_accessed(5)
            }
    
    def _get_top_accessed(self, limit: int = 5) -> list:
        """Get most accessed cache entries."""
        sorted_entries = sorted(
            self.cache.items(),
            key=lambda x: x[1].access_count,
            reverse=True
        )
        
        return [
            {
                'key': key,
                'access_count': entry.access_count,
                'created_at': entry.created_at.isoformat(),
                'size_bytes': entry.size_bytes
            }
            for key, entry in sorted_entries[:limit]
        ]


@dataclass
class CacheStats:
    """Cache performance statistics."""
    hits: int = 0
    misses: int = 0
    puts: int = 0
    deletes: int = 0
    evictions: int = 0
    expired: int = 0
    clears: int = 0
    current_size: int = 0
    current_memory_mb: float = 0.0
    
    def hit_rate(self) -> float:
        """Calculate hit rate percentage."""
        total = self.hits + self.misses
        return (self.hits / total * 100) if total > 0 else 0.0


class ContentHashCache:
    """
    Specialized cache for content processing results based on content hashes.
    """
    
    def __init__(self, cache_dir: Optional[Path] = None, 
                 max_entries: int = 10000, ttl_hours: float = 24):
        """Initialize content hash cache.
        
        Args:
            cache_dir: Directory to store persistent cache
            max_entries: Maximum number of cached entries
            ttl_hours: Time to live in hours
        """
        self.cache_dir = cache_dir or Path("smartpaste_cache")
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.ttl_seconds = ttl_hours * 3600
        
        # In-memory cache for fast access
        self.memory_cache = LRUCache(
            max_size=max_entries // 10,  # Keep 10% in memory
            max_memory_mb=50,
            default_ttl=self.ttl_seconds
        )
        
        self.logger = logging.getLogger(__name__)
    
    def _hash_content(self, content: str) -> str:
        """Generate hash for content."""
        return hashlib.sha256(content.encode('utf-8')).hexdigest()
    
    def _get_cache_file(self, content_hash: str) -> Path:
        """Get cache file path for hash."""
        return self.cache_dir / f"{content_hash[:2]}" / f"{content_hash}.json"
    
    def get_processed_result(self, content: str) -> Optional[Dict[str, Any]]:
        """Get cached processing result for content."""
        content_hash = self._hash_content(content)
        
        # Try memory cache first
        result = self.memory_cache.get(content_hash)
        if result is not None:
            return result
        
        # Try disk cache
        cache_file = self._get_cache_file(content_hash)
        if cache_file.exists():
            try:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Check if expired
                cached_time = datetime.fromisoformat(data['cached_at'])
                if (datetime.now() - cached_time).total_seconds() > self.ttl_seconds:
                    cache_file.unlink()  # Delete expired cache
                    return None
                
                result = data['result']
                # Add to memory cache for faster future access
                self.memory_cache.put(content_hash, result)
                return result
                
            except Exception as e:
                self.logger.error(f"Error reading cache file {cache_file}: {e}")
                cache_file.unlink(missing_ok=True)
        
        return None
    
    def cache_processed_result(self, content: str, result: Dict[str, Any]) -> bool:
        """Cache processing result for content."""
        content_hash = self._hash_content(content)
        
        # Add to memory cache
        self.memory_cache.put(content_hash, result)
        
        # Save to disk cache
        cache_file = self._get_cache_file(content_hash)
        cache_file.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            cache_data = {
                'content_hash': content_hash,
                'cached_at': datetime.now().isoformat(),
                'result': result
            }
            
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(cache_data, f, indent=2, ensure_ascii=False)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error writing cache file {cache_file}: {e}")
            return False
    
    def cleanup_expired(self) -> int:
        """Clean up expired cache files."""
        cleaned = 0
        try:
            for cache_file in self.cache_dir.rglob("*.json"):
                try:
                    with open(cache_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    cached_time = datetime.fromisoformat(data['cached_at'])
                    if (datetime.now() - cached_time).total_seconds() > self.ttl_seconds:
                        cache_file.unlink()
                        cleaned += 1
                        
                except Exception:
                    # Delete corrupted cache files
                    cache_file.unlink(missing_ok=True)
                    cleaned += 1
                    
        except Exception as e:
            self.logger.error(f"Error during cache cleanup: {e}")
        
        return cleaned
    
    def get_cache_info(self) -> Dict[str, Any]:
        """Get cache information and statistics."""
        disk_files = len(list(self.cache_dir.rglob("*.json")))
        disk_size_mb = sum(
            f.stat().st_size for f in self.cache_dir.rglob("*.json")
        ) / (1024 * 1024)
        
        return {
            'memory_cache': self.memory_cache.get_info(),
            'disk_cache': {
                'files': disk_files,
                'size_mb': disk_size_mb,
                'directory': str(self.cache_dir)
            }
        }


# Global cache instances
_content_cache: Optional[ContentHashCache] = None
_general_cache: Optional[LRUCache] = None


def get_content_cache() -> ContentHashCache:
    """Get global content cache instance."""
    global _content_cache
    if _content_cache is None:
        _content_cache = ContentHashCache()
    return _content_cache


def get_general_cache() -> LRUCache:
    """Get global general-purpose cache instance."""
    global _general_cache
    if _general_cache is None:
        _general_cache = LRUCache(max_size=500, max_memory_mb=25)
    return _general_cache