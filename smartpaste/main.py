#!/usr/bin/env python3
"""
SmartPaste - A context-aware AI clipboard assistant.

This module provides the main entry point for SmartPaste, including
the clipboard monitoring loop and content processing pipeline.
"""

import sys
import time
import logging
import signal
import asyncio
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Optional, Dict, Any
from dataclasses import dataclass, field
from datetime import datetime

import click
import yaml
import pyperclip

from .utils.io import IOUtils
from .utils.nlp import NLPUtils
from .utils.timebox import TimeboxUtils
from .utils.cache import get_content_cache, get_general_cache
from .utils.async_processor import get_content_processor
from .utils.automation import get_workflow_automation
from .handlers import URLHandler, NumberHandler, TextHandler, ImageHandler, CodeHandler, EmailHandler, MathHandler


@dataclass
class ProcessingResult:
    """Result of content processing operation."""
    success: bool
    content_type: str
    processed_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    processing_time: float = 0.0
    handler_name: str = ""


@dataclass
class AppStats:
    """Application statistics tracking."""
    total_processed: int = 0
    successful_processed: int = 0
    failed_processed: int = 0
    urls_processed: int = 0
    numbers_processed: int = 0
    texts_processed: int = 0
    images_processed: int = 0
    code_processed: int = 0
    emails_processed: int = 0
    math_processed: int = 0
    start_time: datetime = field(default_factory=datetime.now)
    
    def get_success_rate(self) -> float:
        """Calculate success rate percentage."""
        if self.total_processed == 0:
            return 0.0
        return (self.successful_processed / self.total_processed) * 100
    
    def get_runtime(self) -> float:
        """Get runtime in seconds."""
        return (datetime.now() - self.start_time).total_seconds()


class ClipboardManager:
    """Simple clipboard manager for SmartPaste integration."""
    
    def __init__(self):
        """Initialize clipboard manager."""
        self.logger = logging.getLogger(__name__)
    
    def get_clipboard_content(self) -> Optional[str]:
        """Get current clipboard content."""
        try:
            return pyperclip.paste()
        except Exception as e:
            self.logger.error(f"Error accessing clipboard: {e}")
            return None
    
    def set_clipboard_content(self, content: str) -> bool:
        """Set clipboard content."""
        try:
            pyperclip.copy(content)
            return True
        except Exception as e:
            self.logger.error(f"Error setting clipboard: {e}")
            return False


class SmartPasteApp:
    """Main application class for SmartPaste with async processing and stats tracking."""
    
    def __init__(self, config_path: Optional[str] = None) -> None:
        """Initialize SmartPaste application.
        
        Args:
            config_path: Path to configuration file. If None, uses default locations.
        """
        self.config = self._load_config(config_path)
        self._setup_logging()
        self._setup_handlers()
        self._last_clipboard_content: Optional[str] = None
        self._running = False
        self._stats = AppStats()
        self._executor = None
        self._max_workers = self.config.get("advanced", {}).get("max_workers", 4)
        self._processing_lock = threading.Lock()
        
        # Initialize clipboard manager
        self.clipboard_manager = ClipboardManager()
        
        # Initialize caching system
        self.content_cache = get_content_cache()
        self.general_cache = get_general_cache()
        
        # Initialize async processor
        self.async_processor = get_content_processor()
        
        # Initialize workflow automation
        self.workflow_automation = get_workflow_automation()
        
        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _load_config(self, config_path: Optional[str] = None) -> Dict[str, Any]:
        """Load configuration from YAML file."""
        if config_path is None:
            # Try common config locations
            config_paths = [
                Path("config.yaml"),
                Path("~/.smartpaste/config.yaml").expanduser(),
                Path.cwd() / "config.yaml"
            ]
            config_path = next((p for p in config_paths if p.exists()), None)
        
        if config_path and Path(config_path).exists():
            with open(config_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        else:
            # Return default configuration
            return self._get_default_config()
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default configuration when no config file is found."""
        return {
            "general": {
                "output_directory": "./smartpaste_data",
                "replace_clipboard": False,
                "check_interval": 0.5,
                "max_content_length": 10000
            },
            "features": {
                "url_handler": True,
                "number_handler": True,
                "text_handler": True,
                "image_handler": False
            },
            "logging": {
                "level": "INFO",
                "file": None
            }
        }
    
    def _setup_logging(self) -> None:
        """Setup logging based on configuration."""
        log_config = self.config.get("logging", {})
        level = getattr(logging, log_config.get("level", "INFO").upper())
        
        handlers = []
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(
            logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        )
        handlers.append(console_handler)
        
        # File handler if specified
        if log_config.get("file"):
            file_handler = logging.FileHandler(log_config["file"])
            file_handler.setFormatter(
                logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            )
            handlers.append(file_handler)
        
        logging.basicConfig(level=level, handlers=handlers)
        self.logger = logging.getLogger(__name__)
    
    def _setup_handlers(self) -> None:
        """Initialize content handlers based on configuration."""
        self.handlers = {}
        features = self.config.get("features", {})
        
        if features.get("url_handler", True):
            self.handlers["url"] = URLHandler(self.config.get("url_handler", {}))
        
        if features.get("number_handler", True):
            self.handlers["number"] = NumberHandler(self.config.get("number_handler", {}))
        
        if features.get("text_handler", True):
            self.handlers["text"] = TextHandler(self.config.get("text_handler", {}))
        
        if features.get("image_handler", False):
            try:
                self.handlers["image"] = ImageHandler(self.config.get("image_handler", {}))
            except ImportError:
                self.logger.warning("Image handler disabled: pytesseract not available")
        
        if features.get("code_handler", True):
            self.handlers["code"] = CodeHandler(self.config.get("code_handler", {}))
        
        if features.get("email_handler", True):
            self.handlers["email"] = EmailHandler(self.config.get("email_handler", {}))
        
        if features.get("math_handler", True):
            self.handlers["math"] = MathHandler(self.config.get("math_handler", {}))
        
        self.logger.info(f"Initialized {len(self.handlers)} content handlers: {list(self.handlers.keys())}")
        
        self.logger.info(f"Initialized handlers: {list(self.handlers.keys())}")
    
    def _signal_handler(self, signum: int, frame) -> None:
        """Handle shutdown signals gracefully."""
        self.logger.info(f"Received signal {signum}, shutting down...")
        self.stop()
    
    def _detect_content_type(self, content: str) -> str:
        """Detect the type of clipboard content with enhanced detection."""
        content = content.strip()
        
        # URL detection
        if content.startswith(("http://", "https://", "www.")):
            return "url"
        
        # Email detection
        if "@" in content and ("email" in self.handlers):
            # Basic email pattern check
            import re
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            if re.search(email_pattern, content):
                return "email"
        
        # Math detection
        if "math" in self.handlers:
            # Check for mathematical expressions
            import re
            math_indicators = [
                r'[\d\s\+\-\*/\(\)\.]+\s*=',  # equations
                r'\d+\s*[\+\-\*/]\s*\d+',     # basic arithmetic
                r'(sin|cos|tan|log|sqrt)\s*\(',  # functions
                r'\d+\s*\^\s*\d+',            # powers
                r'\d+/\d+',                   # fractions
                r'\d+\.?\d*%',                # percentages
            ]
            for pattern in math_indicators:
                if re.search(pattern, content, re.IGNORECASE):
                    return "math"
        
        # Code detection
        if "code" in self.handlers:
            # Check for programming code indicators
            import re
            code_indicators = [
                r'(def|function|class|import|include)\s+',
                r'[{}\[\]();]',
                r'(if|for|while|switch)\s*\(',
                r'//.*|/\*.*\*/|#.*',  # comments
                r'[a-zA-Z_]\w*\s*\(',  # function calls
            ]
            for pattern in code_indicators:
                if re.search(pattern, content):
                    return "code"
        
        # Number with unit detection
        if NLPUtils.contains_number_with_unit(content):
            return "number"
        
        # Image detection (if we have base64 or binary indicators)
        if content.startswith("data:image/") or len(content) > 1000 and not content.isprintable():
            return "image" if "image" in self.handlers else "text"
        
        # Default to text
        return "text"
    
    def _process_content(self, content: str) -> ProcessingResult:
        """Process clipboard content through appropriate handler with caching and async support."""
        start_time = time.time()
        content_type = self._detect_content_type(content)
        
        result = ProcessingResult(
            success=False,
            content_type=content_type,
            handler_name=content_type
        )
        
        # Check cache first
        cached_result = self.content_cache.get_processed_result(content)
        if cached_result:
            result.success = True
            result.processed_data = cached_result
            result.processing_time = time.time() - start_time
            self.logger.debug(f"Retrieved {content_type} from cache")
            return result
        
        if content_type not in self.handlers:
            result.error_message = f"No handler available for content type: {content_type}"
            self.logger.debug(result.error_message)
            return result
        
        try:
            handler = self.handlers[content_type]
            
            # Use async processing for supported content types
            use_async = self.config.get("performance", {}).get("async_processing", True)
            
            if use_async and content_type in ['url', 'image', 'code']:
                # Submit async task
                task_id = self.async_processor.process_content_async(
                    content=content,
                    content_type=content_type,
                    handler_func=handler.process,
                    timeout=30.0
                )
                
                # Wait for result
                task_result = self.async_processor.get_result(task_id, timeout=30.0)
                
                if task_result and task_result.success:
                    processed_data = task_result.result
                else:
                    processed_data = None
                    result.error_message = task_result.error if task_result else "Async processing timeout"
            else:
                # Synchronous processing
                processed_data = handler.process(content)
            
            if processed_data:
                processed_data["content_type"] = content_type
                processed_data["timestamp"] = TimeboxUtils.get_current_timestamp()
                processed_data["source"] = "clipboard"
                
                result.success = True
                result.processed_data = processed_data
                
                # Cache the result
                self.content_cache.cache_processed_result(content, processed_data)
                
                # Update stats
                with self._processing_lock:
                    self._stats.total_processed += 1
                    self._stats.successful_processed += 1
                    
                    # Update type-specific counters
                    if content_type == "url":
                        self._stats.urls_processed += 1
                    elif content_type == "number":
                        self._stats.numbers_processed += 1
                    elif content_type == "text":
                        self._stats.texts_processed += 1
                    elif content_type == "image":
                        self._stats.images_processed += 1
                    elif content_type == "code":
                        self._stats.code_processed += 1
                    elif content_type == "email":
                        self._stats.emails_processed += 1
                    elif content_type == "math":
                        self._stats.math_processed += 1
                        
            else:
                result.error_message = f"Handler returned no result for {content_type}"
                with self._processing_lock:
                    self._stats.total_processed += 1
                    self._stats.failed_processed += 1
                
        except Exception as e:
            result.error_message = f"Error processing {content_type} content: {str(e)}"
            self.logger.error(result.error_message, exc_info=True)
            with self._processing_lock:
                self._stats.total_processed += 1
                self._stats.failed_processed += 1
        
        result.processing_time = time.time() - start_time
        return result
    
    def _process_content_async(self, content: str) -> ProcessingResult:
        """Process content using thread pool for non-blocking operation."""
        if not self._executor:
            self._executor = ThreadPoolExecutor(max_workers=self._max_workers)
        
        try:
            future = self._executor.submit(self._process_content, content)
            # Set a reasonable timeout
            timeout = self.config.get("general", {}).get("processing_timeout", 30)
            return future.result(timeout=timeout)
        except Exception as e:
            self.logger.error(f"Async processing failed: {e}")
            return ProcessingResult(
                success=False,
                content_type="unknown",
                error_message=f"Async processing failed: {str(e)}"
            )
    
    def _save_result(self, result: ProcessingResult) -> bool:
        """Save processed result to markdown file."""
        if not result.processed_data:
            return False
            
        try:
            output_dir = Path(self.config["general"]["output_directory"])
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Create daily markdown file
            date_str = TimeboxUtils.get_date_string()
            file_path = output_dir / f"{date_str}.md"
            
            IOUtils.append_to_markdown(file_path, result.processed_data, self.config.get("markdown", {}))
            
            self.logger.debug(f"Saved result to {file_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error saving result: {e}")
            return False
    
    def _show_progress(self) -> None:
        """Display processing statistics and progress."""
        if self._stats.total_processed > 0:
            runtime = self._stats.get_runtime()
            success_rate = self._stats.get_success_rate()
            
            self.logger.info(
                f"📊 Stats: {self._stats.total_processed} processed "
                f"({self._stats.successful_processed} success, {self._stats.failed_processed} failed) "
                f"| Success rate: {success_rate:.1f}% "
                f"| Runtime: {runtime:.0f}s "
                f"| Types: URLs({self._stats.urls_processed}) "
                f"Numbers({self._stats.numbers_processed}) "
                f"Text({self._stats.texts_processed}) "
                f"Images({self._stats.images_processed}) "
                f"Code({self._stats.code_processed}) "
                f"Email({self._stats.emails_processed}) "
                f"Math({self._stats.math_processed})"
            )
    
    def _update_clipboard(self, result: Dict[str, Any]) -> None:
        """Update clipboard with enriched content if configured."""
        if not self.config["general"].get("replace_clipboard", False):
            return
        
        try:
            enriched_content = result.get("enriched_content")
            if enriched_content:
                pyperclip.copy(enriched_content)
                self.logger.info("Updated clipboard with enriched content")
        except Exception as e:
            self.logger.error(f"Error updating clipboard: {e}")
    
    def run(self) -> None:
        """Start the clipboard monitoring loop with enhanced processing."""
        self.logger.info("🚀 Starting SmartPaste clipboard monitor...")
        self._running = True
        
        # Initialize clipboard content
        try:
            self._last_clipboard_content = self.clipboard_manager.get_clipboard_content()
        except Exception as e:
            self.logger.error(f"Error accessing clipboard: {e}")
            return
        
        # Start async processor
        self.async_processor.start()
        
        check_interval = self.config["general"].get("check_interval", 0.5)
        max_length = self.config["general"].get("max_content_length", 10000)
        concurrent_processing = self.config.get("advanced", {}).get("concurrent_processing", False)
        progress_interval = self.config.get("general", {}).get("progress_interval", 60)  # Show stats every minute
        
        last_progress_time = time.time()
        
        # Initialize thread pool if concurrent processing is enabled
        if concurrent_processing:
            self._executor = ThreadPoolExecutor(max_workers=self._max_workers)
            self.logger.info(f"🔧 Concurrent processing enabled with {self._max_workers} workers")
        
        while self._running:
            try:
                # Check for new clipboard content
                current_content = self.clipboard_manager.get_clipboard_content()
                
                if (current_content != self._last_clipboard_content and 
                    current_content and 
                    len(current_content) <= max_length):
                    
                    self.logger.debug(f"📋 New clipboard content detected: {len(current_content)} chars")
                    
                    # Process the content (async or sync based on config)
                    if concurrent_processing:
                        result = self._process_content_async(current_content)
                    else:
                        result = self._process_content(current_content)
                    
                    if result.success and result.processed_data:
                        # Save to markdown
                        save_success = self._save_result(result)
                        
                        if save_success:
                            self.logger.info(
                                f"✅ Processed {result.content_type} content "
                                f"in {result.processing_time:.2f}s"
                            )
                        else:
                            self.logger.warning("❌ Processing succeeded but saving failed")
                        
                        # Update clipboard if configured
                        if result.processed_data:
                            self._update_clipboard(result.processed_data)
                        
                        # Process through workflow automation
                        automation_result = self.workflow_automation.process_content(
                            content=current_content,
                            content_type=result.content_type,
                            source_app=None  # Could be enhanced to detect source app
                        )
                        
                        if automation_result['triggered_rules']:
                            self.logger.info(
                                f"🤖 Triggered {len(automation_result['triggered_rules'])} automation rules"
                            )
                    else:
                        self.logger.warning(f"❌ Failed to process content: {result.error_message}")
                    
                    self._last_clipboard_content = current_content
                
                # Show periodic progress updates
                current_time = time.time()
                if current_time - last_progress_time >= progress_interval:
                    self._show_progress()
                    last_progress_time = current_time
                
                time.sleep(check_interval)
                
            except KeyboardInterrupt:
                break
            except Exception as e:
                self.logger.error(f"💥 Error in main loop: {e}", exc_info=True)
                time.sleep(check_interval)
        
        # Cleanup
        if self._executor:
            self.logger.info("🔄 Shutting down thread pool...")
            self._executor.shutdown(wait=True)
        
        # Stop async processor
        self.async_processor.stop()
        
        # Show cache statistics
        cache_info = self.content_cache.get_cache_info()
        self.logger.info(f"📊 Cache stats: Memory cache hit rate: {cache_info['memory_cache']['stats']['hit_rate']:.1f}%")
        
        # Show automation statistics
        automation_stats = self.workflow_automation.get_stats()
        self.logger.info(f"🤖 Automation: {automation_stats['stats']['rules_triggered']} rules triggered, {automation_stats['stats']['content_processed']} items processed")
        
        self.logger.info("🛑 SmartPaste stopped")
        self._show_progress()  # Final stats
        
        self.logger.info("SmartPaste stopped.")
    
    def stop(self) -> None:
        """Stop the clipboard monitoring."""
        self._running = False
    
    def process_content(self, content: str) -> Optional[Dict[str, Any]]:
        """Process content and return the result for external use (GUI integration)."""
        result = self._process_content(content)
        
        if result.success and result.processed_data:
            # Save to markdown
            self._save_result(result)
            return result.processed_data
        
        return None


@click.command()
@click.option(
    "--config",
    "-c",
    help="Path to configuration file",
    type=click.Path(exists=True),
    default=None
)
@click.option(
    "--verbose",
    "-v",
    is_flag=True,
    help="Enable verbose logging"
)
@click.option(
    "--gui",
    "-g",
    is_flag=True,
    help="Start in GUI mode with system tray"
)
@click.option(
    "--cli",
    is_flag=True,
    help="Force CLI mode (no GUI)"
)
@click.version_option()
def main(config: Optional[str], verbose: bool, gui: bool, cli: bool) -> None:
    """SmartPaste - A context-aware AI clipboard assistant.
    
    SmartPaste monitors your clipboard, enriches content contextually,
    and saves organized markdown files with intelligent content analysis.
    
    Modes:
    - GUI mode: --gui or default if GUI dependencies are installed
    - CLI mode: --cli or fallback if GUI not available
    """
    if verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Determine mode preference
    if cli:
        # Force CLI mode
        start_cli_mode(config)
    elif gui:
        # Force GUI mode
        start_gui_mode(config)
    else:
        # Auto-detect best mode
        try:
            # Check if GUI dependencies are available
            from smartpaste.gui.main import SmartPasteGUI
            # Try to start in GUI mode
            start_gui_mode(config)
        except ImportError:
            # Fall back to CLI mode
            click.echo("ℹ️  GUI dependencies not available. Starting in CLI mode.")
            click.echo("   Install GUI support with: pip install smartpaste-ai[gui]")
            start_cli_mode(config)


def start_cli_mode(config: Optional[str]) -> None:
    """Start SmartPaste in CLI mode."""
    try:
        app = SmartPasteApp(config)
        app.run()
    except KeyboardInterrupt:
        click.echo("\\nShutting down SmartPaste...")
        sys.exit(0)
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)


def start_gui_mode(config: Optional[str]) -> None:
    """Start SmartPaste in GUI mode."""
    try:
        from smartpaste.gui.main import SmartPasteGUI
        gui_app = SmartPasteGUI(config_path=config)
        gui_app.start_gui_mode()
    except ImportError:
        click.echo("❌ GUI dependencies not installed.")
        click.echo("   Install with: pip install smartpaste-ai[gui]")
        sys.exit(1)
    except KeyboardInterrupt:
        click.echo("\\nShutting down SmartPaste...")
        sys.exit(0)
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)


if __name__ == "__main__":
    main()