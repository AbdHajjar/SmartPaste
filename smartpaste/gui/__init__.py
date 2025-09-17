"""
SmartPaste AI GUI Module

This module provides the graphical user interface for SmartPaste AI,
including system tray integration and modern desktop UI components.
"""

from .tray import SystemTrayApp
from .clipboard_history import ClipboardHistoryWindow
from .settings import SettingsWindow

__all__ = [
    'SystemTrayApp',
    'ClipboardHistoryWindow',
    'SettingsWindow'
]