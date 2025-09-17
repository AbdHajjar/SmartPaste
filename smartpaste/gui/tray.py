"""
System Tray Application for SmartPaste AI

Provides a beautiful system tray icon with context menu and quick actions.
"""

import os
import sys
import time
import threading
import webbrowser
from pathlib import Path
from typing import Optional, Callable, Dict, Any
import logging

try:
    import pystray
    from pystray import MenuItem, Icon
    from PIL import Image, ImageDraw, ImageFont
    PYSTRAY_AVAILABLE = True
except ImportError:
    PYSTRAY_AVAILABLE = False

from ..main import SmartPasteApp


class SystemTrayApp:
    """
    Modern system tray application for SmartPaste AI.
    
    Features:
    - Beautiful custom icon
    - Context menu with quick actions
    - Status indicators
    - Integration with main SmartPaste functionality
    """
    
    def __init__(self, smartpaste_app=None, on_start_monitoring=None, 
                 on_stop_monitoring=None, on_exit=None, config_path: Optional[str] = None, 
                 verbose: bool = False):
        """Initialize the system tray application."""
        self.logger = logging.getLogger(__name__)
        self.config_path = config_path
        self.verbose = verbose
        self.icon: Optional[Icon] = None
        self.smartpaste_app = smartpaste_app
        self.is_monitoring = False
        self.status_callbacks: Dict[str, Callable] = {}
        
        # Callback functions for external control
        self.on_start_monitoring = on_start_monitoring
        self.on_stop_monitoring = on_stop_monitoring
        self.on_exit = on_exit
        
        if not PYSTRAY_AVAILABLE:
            raise ImportError(
                "GUI dependencies not installed. Install with: "
                "pip install smartpaste-ai[gui]"
            )
    
    def create_icon_image(self, size: int = 64, active: bool = True) -> Image.Image:
        """
        Create a beautiful custom icon for the system tray.
        
        Args:
            size: Icon size in pixels
            active: Whether SmartPaste is actively monitoring
            
        Returns:
            PIL Image for the icon
        """
        # Create a new image with transparency
        image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(image)
        
        # Colors
        bg_color = (67, 126, 235, 255) if active else (128, 128, 128, 255)  # Blue or gray
        clipboard_color = (255, 255, 255, 255)  # White
        ai_color = (255, 215, 0, 255)  # Gold for AI accent
        
        # Draw background circle
        margin = 4
        draw.ellipse([margin, margin, size-margin, size-margin], fill=bg_color)
        
        # Draw clipboard icon
        clipboard_width = size // 3
        clipboard_height = size // 2.2
        clipboard_x = (size - clipboard_width) // 2
        clipboard_y = (size - clipboard_height) // 2
        
        # Clipboard main body
        draw.rectangle([
            clipboard_x, clipboard_y + 4,
            clipboard_x + clipboard_width, clipboard_y + clipboard_height
        ], fill=clipboard_color)
        
        # Clipboard clip
        clip_width = clipboard_width // 2
        clip_height = 6
        clip_x = clipboard_x + (clipboard_width - clip_width) // 2
        draw.rectangle([
            clip_x, clipboard_y,
            clip_x + clip_width, clipboard_y + clip_height
        ], fill=clipboard_color)
        
        # AI indicator (small star)
        if active:
            star_size = 8
            star_x = size - star_size - 4
            star_y = 4
            self._draw_star(draw, star_x, star_y, star_size, ai_color)
        
        return image
    
    def _draw_star(self, draw: ImageDraw.Draw, x: int, y: int, size: int, color: tuple):
        """Draw a small star for AI indicator."""
        points = []
        for i in range(10):
            angle = i * 36  # 360/10 degrees
            if i % 2 == 0:
                radius = size // 2
            else:
                radius = size // 4
            
            import math
            px = x + size//2 + radius * math.cos(math.radians(angle - 90))
            py = y + size//2 + radius * math.sin(math.radians(angle - 90))
            points.append((px, py))
        
        draw.polygon(points, fill=color)
    
    def create_menu(self) -> pystray.Menu:
        """Create the system tray context menu."""
        return pystray.Menu(
            MenuItem(
                "SmartPaste AI",
                None,
                enabled=False
            ),
            MenuItem(
                "─" * 20,
                None,
                enabled=False
            ),
            MenuItem(
                f"{'⏸️ Pause' if self.is_monitoring else '▶️ Start'} Monitoring",
                self.toggle_monitoring
            ),
            MenuItem(
                "📋 Clipboard History",
                self.show_clipboard_history
            ),
            MenuItem(
                "📁 Open Data Folder",
                self.open_data_folder
            ),
            MenuItem(
                "─" * 20,
                None,
                enabled=False
            ),
            MenuItem(
                "⚙️ Settings",
                self.show_settings
            ),
            MenuItem(
                "📖 Documentation",
                self.open_documentation
            ),
            MenuItem(
                "🐛 Report Issue",
                self.report_issue
            ),
            MenuItem(
                "─" * 20,
                None,
                enabled=False
            ),
            MenuItem(
                "❌ Quit SmartPaste AI",
                self.quit_application
            )
        )
    
    def toggle_monitoring(self, icon: Icon, item: MenuItem):
        """Toggle clipboard monitoring on/off."""
        if self.is_monitoring:
            self.stop_monitoring()
        else:
            self.start_monitoring()
        
        # Update icon and menu
        self.update_icon()
    
    def start_monitoring(self):
        """Start clipboard monitoring in background thread."""
        if not self.is_monitoring and self.smartpaste_app:
            self.is_monitoring = True
            self.logger.info("Starting clipboard monitoring...")
            
            # Start monitoring in separate thread
            monitoring_thread = threading.Thread(
                target=self._run_monitoring,
                daemon=True
            )
            monitoring_thread.start()
    
    def stop_monitoring(self):
        """Stop clipboard monitoring."""
        if self.is_monitoring:
            self.is_monitoring = False
            self.logger.info("Stopped clipboard monitoring")
    
    def _run_monitoring(self):
        """Run the monitoring loop in background thread."""
        try:
            if self.smartpaste_app:
                # Use the existing monitoring functionality from SmartPasteApp
                last_content = None
                check_interval = 1.0
                
                while self.is_monitoring:
                    try:
                        current_content = self.smartpaste_app.clipboard_manager.get_clipboard_content()
                        
                        if current_content and current_content != last_content:
                            # Process content
                            result = self.smartpaste_app.process_content(current_content)
                            if result:
                                self.update_status(f"Processed: {result.get('content_type', 'content')}")
                            
                            last_content = current_content
                        
                        time.sleep(check_interval)
                        
                    except Exception as e:
                        self.logger.error(f"Monitoring error: {e}")
                        time.sleep(check_interval)
                        
        except Exception as e:
            self.logger.error(f"Error in monitoring loop: {e}")
            self.is_monitoring = False
            self.update_icon()
    
    def update_status(self, status_text: str):
        """Update the system tray status."""
        try:
            # Update tooltip or handle status updates
            if self.icon:
                self.icon.title = f"SmartPaste AI - {status_text}"
            self.logger.debug(f"Status: {status_text}")
        except Exception as e:
            self.logger.error(f"Error updating status: {e}")
    
    def update_icon(self):
        """Update the system tray icon and menu."""
        try:
            if self.icon:
                # Update icon image based on monitoring state
                new_image = self.create_icon_image(active=self.is_monitoring)
                self.icon.icon = new_image
                self.icon.menu = self.create_menu()
                # Update title
                status = "Active" if self.is_monitoring else "Paused"
                self.icon.title = f"SmartPaste AI - {status}"
        except Exception as e:
            self.logger.error(f"Error updating icon: {e}")
    
    def show_clipboard_history(self, icon: Icon, item: MenuItem):
        """Show clipboard history window."""
        try:
            from .clipboard_history import ClipboardHistoryWindow
            history_window = ClipboardHistoryWindow()
            history_window.show()
        except Exception as e:
            self.logger.error(f"Error showing clipboard history: {e}")
    
    def show_settings(self, icon: Icon, item: MenuItem):
        """Show settings window."""
        try:
            from .settings import SettingsWindow
            settings_window = SettingsWindow(self.config_path)
            settings_window.show()
        except Exception as e:
            self.logger.error(f"Error showing settings: {e}")
    
    def open_data_folder(self, icon: Icon, item: MenuItem):
        """Open the SmartPaste data folder."""
        try:
            data_folder = Path.cwd() / "smartpaste_data"
            if not data_folder.exists():
                data_folder.mkdir(exist_ok=True)
            
            # Open folder in file explorer
            if sys.platform == "win32":
                os.startfile(data_folder)
            elif sys.platform == "darwin":
                os.system(f"open '{data_folder}'")
            else:
                os.system(f"xdg-open '{data_folder}'")
                
        except Exception as e:
            self.logger.error(f"Error opening data folder: {e}")
    
    def open_documentation(self, icon: Icon, item: MenuItem):
        """Open SmartPaste documentation."""
        webbrowser.open("https://abdhajjar.github.io/SmartPaste/")
    
    def report_issue(self, icon: Icon, item: MenuItem):
        """Open GitHub issues page."""
        webbrowser.open("https://github.com/AbdHajjar/SmartPaste/issues")
    
    def quit_application(self, icon: Icon, item: MenuItem):
        """Quit the application."""
        self.logger.info("Quitting SmartPaste AI...")
        self.stop_monitoring()
        
        # Call external exit callback
        if self.on_exit:
            self.on_exit()
        
        if self.icon:
            self.icon.stop()
        
        # Give some time for cleanup
        threading.Timer(0.5, sys.exit).start()
    
    def run(self):
        """Run the system tray application."""
        try:
            # Initialize SmartPaste core
            self.smartpaste_app = SmartPasteApp(
                config_path=self.config_path
            )
            
            # Create and configure icon
            icon_image = self.create_icon_image(active=False)
            menu = self.create_menu()
            
            self.icon = Icon(
                name="SmartPaste AI",
                icon=icon_image,
                title="SmartPaste AI - Intelligent Clipboard Assistant",
                menu=menu
            )
            
            self.logger.info("Starting SmartPaste AI system tray...")
            
            # Auto-start monitoring
            self.start_monitoring()
            
            # Run the icon (this blocks until quit)
            self.icon.run()
            
        except KeyboardInterrupt:
            self.logger.info("Received interrupt signal")
            self.quit_application(None, None)
        except Exception as e:
            self.logger.error(f"Error running system tray app: {e}")
            raise


def main():
    """Entry point for GUI mode."""
    import argparse
    
    parser = argparse.ArgumentParser(description="SmartPaste AI - GUI Mode")
    parser.add_argument("-c", "--config", help="Path to configuration file")
    parser.add_argument("-v", "--verbose", action="store_true", help="Enable verbose logging")
    
    args = parser.parse_args()
    
    # Configure logging
    level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    try:
        app = SystemTrayApp(config_path=args.config, verbose=args.verbose)
        app.run()
    except ImportError as e:
        print(f"Error: {e}")
        print("Install GUI dependencies with: pip install smartpaste-ai[gui]")
        sys.exit(1)
    except Exception as e:
        print(f"Error starting SmartPaste AI GUI: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()