"""
Main GUI Launcher for SmartPaste AI

Provides seamless integration between CLI and GUI modes.
"""

import sys
import threading
import time
from pathlib import Path
from typing import Optional

from smartpaste.main import SmartPasteApp

try:
    from smartpaste.gui.tray import SystemTrayApp
    GUI_AVAILABLE = True
except ImportError:
    GUI_AVAILABLE = False


class SmartPasteGUI:
    """
    Main GUI application controller that manages both CLI and GUI modes.
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize the GUI application."""
        self.config_path = config_path
        self.smartpaste_app: Optional[SmartPasteApp] = None
        self.tray_app: Optional[SystemTrayApp] = None
        self.monitoring_thread: Optional[threading.Thread] = None
        self.running = False
        
    def start_gui_mode(self) -> None:
        """Start in GUI mode with system tray."""
        if not GUI_AVAILABLE:
            print("❌ GUI dependencies not installed. Install with: pip install smartpaste-ai[gui]")
            sys.exit(1)
        
        print("🚀 Starting SmartPaste AI in GUI mode...")
        
        # Initialize SmartPaste core
        self.smartpaste_app = SmartPasteApp(config_path=self.config_path)
        
        # Initialize system tray
        self.tray_app = SystemTrayApp(
            smartpaste_app=self.smartpaste_app,
            on_start_monitoring=self.start_monitoring,
            on_stop_monitoring=self.stop_monitoring,
            on_exit=self.shutdown
        )
        
        # Start monitoring in background
        self.start_monitoring()
        
        # Run system tray (this blocks until exit)
        try:
            self.tray_app.run()
        except KeyboardInterrupt:
            print("\\n🛑 Shutting down...")
        finally:
            self.shutdown()
    
    def start_cli_mode(self) -> None:
        """Start in CLI mode (original behavior)."""
        print("🚀 Starting SmartPaste AI in CLI mode...")
        
        # Initialize SmartPaste core
        self.smartpaste_app = SmartPasteApp(config_path=self.config_path)
        
        # Run CLI monitoring loop
        try:
            self.smartpaste_app.run()
        except KeyboardInterrupt:
            print("\\n🛑 Shutting down...")
        finally:
            self.shutdown()
    
    def start_monitoring(self) -> None:
        """Start clipboard monitoring in background thread."""
        if self.running:
            return
        
        self.running = True
        self.monitoring_thread = threading.Thread(
            target=self._monitoring_loop,
            daemon=True,
            name="SmartPaste-Monitor"
        )
        self.monitoring_thread.start()
        print("✅ Clipboard monitoring started")
    
    def stop_monitoring(self) -> None:
        """Stop clipboard monitoring."""
        if not self.running:
            return
        
        self.running = False
        if self.monitoring_thread and self.monitoring_thread.is_alive():
            self.monitoring_thread.join(timeout=2.0)
        print("⏹️ Clipboard monitoring stopped")
    
    def _monitoring_loop(self) -> None:
        """Background monitoring loop."""
        if not self.smartpaste_app:
            return
        
        last_content = None
        check_interval = self.smartpaste_app.config.get('app', {}).get('check_interval', 1.0)
        
        while self.running:
            try:
                current_content = self.smartpaste_app.clipboard_manager.get_clipboard_content()
                
                if current_content and current_content != last_content:
                    # Process new clipboard content
                    result = self.smartpaste_app.process_content(current_content)
                    
                    if result:
                        print(f"📋 Processed: {result.get('handler_type', 'unknown')} content")
                        
                        # Update system tray with latest activity
                        if self.tray_app:
                            self.tray_app.update_status(f"Last: {result.get('handler_type', 'content')}")
                    
                    last_content = current_content
                
                time.sleep(check_interval)
                
            except Exception as e:
                print(f"❌ Monitoring error: {e}")
                time.sleep(check_interval)
    
    def shutdown(self) -> None:
        """Clean shutdown of all components."""
        print("🔄 Shutting down SmartPaste AI...")
        
        # Stop monitoring
        self.stop_monitoring()
        
        # Cleanup tray app
        if self.tray_app:
            self.tray_app.stop()
        
        # Cleanup SmartPaste app
        if self.smartpaste_app:
            # Save any pending data
            pass
        
        print("✅ Shutdown complete")


def main():
    """Main entry point for GUI mode."""
    import argparse
    
    parser = argparse.ArgumentParser(description="SmartPaste AI - GUI Mode")
    parser.add_argument(
        '--config',
        type=str,
        help='Path to configuration file'
    )
    parser.add_argument(
        '--cli',
        action='store_true',
        help='Force CLI mode (no GUI)'
    )
    parser.add_argument(
        '--gui',
        action='store_true',
        help='Force GUI mode'
    )
    
    args = parser.parse_args()
    
    # Initialize GUI application
    gui_app = SmartPasteGUI(config_path=args.config)
    
    # Determine mode
    if args.cli:
        gui_app.start_cli_mode()
    elif args.gui or (GUI_AVAILABLE and not args.cli):
        gui_app.start_gui_mode()
    else:
        gui_app.start_cli_mode()


if __name__ == "__main__":
    main()