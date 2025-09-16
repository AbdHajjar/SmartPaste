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
from pathlib import Path
from typing import Optional, Dict, Any

import click
import yaml
import pyperclip

from .utils.io import IOUtils
from .utils.nlp import NLPUtils
from .utils.timebox import TimeboxUtils
from .handlers import URLHandler, NumberHandler, TextHandler, ImageHandler


class SmartPasteApp:
    """Main application class for SmartPaste."""
    
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
        
        self.logger.info(f"Initialized handlers: {list(self.handlers.keys())}")
    
    def _signal_handler(self, signum: int, frame) -> None:
        """Handle shutdown signals gracefully."""
        self.logger.info(f"Received signal {signum}, shutting down...")
        self.stop()
    
    def _detect_content_type(self, content: str) -> str:
        """Detect the type of clipboard content."""
        content = content.strip()
        
        # URL detection
        if content.startswith(("http://", "https://", "www.")):
            return "url"
        
        # Number with unit detection
        if NLPUtils.contains_number_with_unit(content):
            return "number"
        
        # Image detection (if we have base64 or binary indicators)
        if content.startswith("data:image/") or len(content) > 1000 and not content.isprintable():
            return "image" if "image" in self.handlers else "text"
        
        # Default to text
        return "text"
    
    def _process_content(self, content: str) -> Optional[Dict[str, Any]]:
        """Process clipboard content through appropriate handler."""
        content_type = self._detect_content_type(content)
        
        if content_type not in self.handlers:
            self.logger.debug(f"No handler for content type: {content_type}")
            return None
        
        try:
            handler = self.handlers[content_type]
            result = handler.process(content)
            
            if result:
                result["content_type"] = content_type
                result["timestamp"] = TimeboxUtils.get_current_timestamp()
                result["source"] = "clipboard"
                
            return result
            
        except Exception as e:
            self.logger.error(f"Error processing {content_type} content: {e}")
            return None
    
    def _save_result(self, result: Dict[str, Any]) -> None:
        """Save processed result to markdown file."""
        try:
            output_dir = Path(self.config["general"]["output_directory"])
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Create daily markdown file
            date_str = TimeboxUtils.get_date_string()
            file_path = output_dir / f"{date_str}.md"
            
            IOUtils.append_to_markdown(file_path, result, self.config.get("markdown", {}))
            
            self.logger.info(f"Saved result to {file_path}")
            
        except Exception as e:
            self.logger.error(f"Error saving result: {e}")
    
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
        """Start the clipboard monitoring loop."""
        self.logger.info("Starting SmartPaste clipboard monitor...")
        self._running = True
        
        # Initialize clipboard content
        try:
            self._last_clipboard_content = pyperclip.paste()
        except Exception as e:
            self.logger.error(f"Error accessing clipboard: {e}")
            return
        
        check_interval = self.config["general"].get("check_interval", 0.5)
        max_length = self.config["general"].get("max_content_length", 10000)
        
        while self._running:
            try:
                # Check for new clipboard content
                current_content = pyperclip.paste()
                
                if (current_content != self._last_clipboard_content and 
                    current_content and 
                    len(current_content) <= max_length):
                    
                    self.logger.debug(f"New clipboard content detected: {len(current_content)} chars")
                    
                    # Process the content
                    result = self._process_content(current_content)
                    
                    if result:
                        # Save to markdown
                        self._save_result(result)
                        
                        # Update clipboard if configured
                        self._update_clipboard(result)
                    
                    self._last_clipboard_content = current_content
                
                time.sleep(check_interval)
                
            except KeyboardInterrupt:
                break
            except Exception as e:
                self.logger.error(f"Error in main loop: {e}")
                time.sleep(check_interval)
        
        self.logger.info("SmartPaste stopped.")
    
    def stop(self) -> None:
        """Stop the clipboard monitoring."""
        self._running = False


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
@click.version_option()
def main(config: Optional[str], verbose: bool) -> None:
    """SmartPaste - A context-aware AI clipboard assistant.
    
    SmartPaste monitors your clipboard, enriches content contextually,
    and saves organized markdown files with intelligent content analysis.
    """
    if verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        app = SmartPasteApp(config)
        app.run()
    except KeyboardInterrupt:
        click.echo("\\nShutting down SmartPaste...")
        sys.exit(0)
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)


if __name__ == "__main__":
    main()