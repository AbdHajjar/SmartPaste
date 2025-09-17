"""
Settings Window for SmartPaste AI

Beautiful modern settings interface with tabbed configuration options.
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from typing import Dict, Any, Optional
import yaml
from pathlib import Path

try:
    import customtkinter as ctk
    CUSTOMTKINTER_AVAILABLE = True
except ImportError:
    CUSTOMTKINTER_AVAILABLE = False


class SettingsWindow:
    """
    Modern settings window with tabbed interface for configuring SmartPaste AI.
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize the settings window."""
        self.window: Optional[tk.Toplevel] = None
        self.config_path = config_path or "config.yaml"
        self.config_data: Dict[str, Any] = {}
        self.widgets: Dict[str, tk.Widget] = {}
        
        # Configure modern theme if available
        if CUSTOMTKINTER_AVAILABLE:
            ctk.set_appearance_mode("system")
            ctk.set_default_color_theme("blue")
        
        self.load_config()
    
    def load_config(self) -> None:
        """Load configuration from file."""
        try:
            config_file = Path(self.config_path)
            if config_file.exists():
                with open(config_file, 'r', encoding='utf-8') as f:
                    self.config_data = yaml.safe_load(f) or {}
            else:
                self.config_data = self.get_default_config()
        except Exception as e:
            print(f"Error loading config: {e}")
            self.config_data = self.get_default_config()
    
    def get_default_config(self) -> Dict[str, Any]:
        """Get default configuration."""
        return {
            'app': {
                'check_interval': 1.0,
                'output_dir': 'smartpaste_data',
                'auto_start_gui': True,
                'minimize_to_tray': True
            },
            'handlers': {
                'url': {
                    'enabled': True,
                    'timeout': 10,
                    'extract_summary': True,
                    'min_content_length': 100
                },
                'text': {
                    'enabled': True,
                    'min_length': 10,
                    'detect_language': True,
                    'generate_summary': True
                },
                'number': {
                    'enabled': True,
                    'temperature_units': ['celsius', 'fahrenheit', 'kelvin'],
                    'length_units': ['meters', 'feet', 'inches'],
                    'weight_units': ['kilograms', 'pounds']
                },
                'image': {
                    'enabled': False,
                    'ocr_enabled': False,
                    'save_images': True
                },
                'code': {
                    'enabled': True,
                    'detect_language': True,
                    'format_code': True
                },
                'email': {
                    'enabled': True,
                    'validate_addresses': True,
                    'extract_domains': True
                }
            },
            'ai': {
                'provider': 'local',
                'model': 'sentence-transformers',
                'api_key': '',
                'temperature': 0.7,
                'max_tokens': 1000
            },
            'privacy': {
                'encrypt_data': False,
                'auto_delete_after_days': 0,
                'exclude_patterns': []
            }
        }
    
    def save_config(self) -> None:
        """Save configuration to file."""
        try:
            config_file = Path(self.config_path)
            config_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(config_file, 'w', encoding='utf-8') as f:
                yaml.dump(self.config_data, f, default_flow_style=False, indent=2)
            
            messagebox.showinfo("Success", "Settings saved successfully!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save settings: {e}")
    
    def create_window(self) -> None:
        """Create and configure the settings window."""
        if CUSTOMTKINTER_AVAILABLE:
            self.window = ctk.CTkToplevel()
            self.window.title("⚙️ SmartPaste AI Settings")
            self.window.geometry("800x600")
        else:
            self.window = tk.Toplevel()
            self.window.title("SmartPaste AI Settings")
            self.window.geometry("800x600")
        
        self.window.transient()
        self.window.grab_set()
        self.window.resizable(True, True)
        
        # Create header
        self.create_header()
        
        # Create tabbed interface
        self.create_tabs()
        
        # Create buttons
        self.create_buttons()
        
        # Center window
        self.center_window()
    
    def create_header(self) -> None:
        """Create the header."""
        if CUSTOMTKINTER_AVAILABLE:
            header_frame = ctk.CTkFrame(self.window)
            header_frame.pack(fill="x", padx=10, pady=(10, 5))
            
            title_label = ctk.CTkLabel(
                header_frame,
                text="⚙️ SmartPaste AI Settings",
                font=ctk.CTkFont(size=24, weight="bold")
            )
            title_label.pack(pady=15)
        else:
            header_frame = ttk.Frame(self.window)
            header_frame.pack(fill="x", padx=10, pady=(10, 5))
            
            title_label = ttk.Label(
                header_frame,
                text="⚙️ SmartPaste AI Settings",
                font=("Arial", 18, "bold")
            )
            title_label.pack(pady=15)
    
    def create_tabs(self) -> None:
        """Create the tabbed interface."""
        if CUSTOMTKINTER_AVAILABLE:
            self.notebook = ctk.CTkTabview(self.window)
            self.notebook.pack(fill="both", expand=True, padx=10, pady=5)
            
            # Create tabs
            self.create_general_tab()
            self.create_handlers_tab()
            self.create_ai_tab()
            self.create_privacy_tab()
        else:
            self.notebook = ttk.Notebook(self.window)
            self.notebook.pack(fill="both", expand=True, padx=10, pady=5)
            
            # Create tabs
            self.create_general_tab()
            self.create_handlers_tab()
            self.create_ai_tab()
            self.create_privacy_tab()
    
    def create_general_tab(self) -> None:
        """Create the general settings tab."""
        if CUSTOMTKINTER_AVAILABLE:
            tab = self.notebook.add("🏠 General")
            frame = ctk.CTkScrollableFrame(tab)
            frame.pack(fill="both", expand=True, padx=10, pady=10)
        else:
            frame = ttk.Frame(self.notebook)
            self.notebook.add(frame, text="General")
            
            # Add scrollbar
            canvas = tk.Canvas(frame)
            scrollbar = ttk.Scrollbar(frame, orient="vertical", command=canvas.yview)
            scrollable_frame = ttk.Frame(canvas)
            
            scrollable_frame.bind(
                "<Configure>",
                lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
            )
            
            canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
            canvas.configure(yscrollcommand=scrollbar.set)
            
            canvas.pack(side="left", fill="both", expand=True)
            scrollbar.pack(side="right", fill="y")
            frame = scrollable_frame
        
        # App settings
        self.create_setting_group(frame, "Application Settings")
        
        self.widgets['check_interval'] = self.create_number_setting(
            frame, "Check Interval (seconds):", 
            self.config_data.get('app', {}).get('check_interval', 1.0),
            "How often to check clipboard for changes"
        )
        
        self.widgets['output_dir'] = self.create_folder_setting(
            frame, "Output Directory:",
            self.config_data.get('app', {}).get('output_dir', 'smartpaste_data'),
            "Where to save processed clipboard data"
        )
        
        self.widgets['auto_start_gui'] = self.create_checkbox_setting(
            frame, "Auto-start GUI mode",
            self.config_data.get('app', {}).get('auto_start_gui', True),
            "Automatically start in GUI mode"
        )
        
        self.widgets['minimize_to_tray'] = self.create_checkbox_setting(
            frame, "Minimize to system tray",
            self.config_data.get('app', {}).get('minimize_to_tray', True),
            "Minimize to system tray instead of taskbar"
        )
    
    def create_handlers_tab(self) -> None:
        """Create the content handlers tab."""
        if CUSTOMTKINTER_AVAILABLE:
            tab = self.notebook.add("🔧 Handlers")
            frame = ctk.CTkScrollableFrame(tab)
            frame.pack(fill="both", expand=True, padx=10, pady=10)
        else:
            frame = ttk.Frame(self.notebook)
            self.notebook.add(frame, text="Handlers")
        
        # Handler enable/disable checkboxes
        handlers_config = self.config_data.get('handlers', {})
        
        self.create_setting_group(frame, "Content Handlers")
        
        for handler_name in ['url', 'text', 'number', 'image', 'code', 'email']:
            handler_config = handlers_config.get(handler_name, {})
            enabled = handler_config.get('enabled', True)
            
            self.widgets[f'{handler_name}_enabled'] = self.create_checkbox_setting(
                frame, f"{handler_name.title()} Handler",
                enabled,
                f"Enable {handler_name} content processing"
            )
        
        # URL Handler specific settings
        self.create_setting_group(frame, "URL Handler Settings")
        url_config = handlers_config.get('url', {})
        
        self.widgets['url_timeout'] = self.create_number_setting(
            frame, "Request Timeout (seconds):",
            url_config.get('timeout', 10),
            "Timeout for web requests"
        )
        
        self.widgets['url_extract_summary'] = self.create_checkbox_setting(
            frame, "Extract page summaries",
            url_config.get('extract_summary', True),
            "Generate summaries of web pages"
        )
        
        # Text Handler specific settings
        self.create_setting_group(frame, "Text Handler Settings")
        text_config = handlers_config.get('text', {})
        
        self.widgets['text_min_length'] = self.create_number_setting(
            frame, "Minimum text length:",
            text_config.get('min_length', 10),
            "Minimum length to process text"
        )
        
        self.widgets['text_detect_language'] = self.create_checkbox_setting(
            frame, "Detect language",
            text_config.get('detect_language', True),
            "Automatically detect text language"
        )
    
    def create_ai_tab(self) -> None:
        """Create the AI settings tab."""
        if CUSTOMTKINTER_AVAILABLE:
            tab = self.notebook.add("🤖 AI")
            frame = ctk.CTkScrollableFrame(tab)
            frame.pack(fill="both", expand=True, padx=10, pady=10)
        else:
            frame = ttk.Frame(self.notebook)
            self.notebook.add(frame, text="AI")
        
        ai_config = self.config_data.get('ai', {})
        
        self.create_setting_group(frame, "AI Provider Settings")
        
        self.widgets['ai_provider'] = self.create_dropdown_setting(
            frame, "AI Provider:",
            ai_config.get('provider', 'local'),
            ['local', 'openai', 'anthropic', 'google'],
            "AI service provider"
        )
        
        self.widgets['ai_api_key'] = self.create_text_setting(
            frame, "API Key:",
            ai_config.get('api_key', ''),
            "API key for external AI services (leave empty for local)",
            password=True
        )
        
        self.widgets['ai_temperature'] = self.create_number_setting(
            frame, "Temperature:",
            ai_config.get('temperature', 0.7),
            "AI creativity level (0.0 = conservative, 1.0 = creative)"
        )
        
        self.widgets['ai_max_tokens'] = self.create_number_setting(
            frame, "Max Tokens:",
            ai_config.get('max_tokens', 1000),
            "Maximum tokens for AI responses"
        )
    
    def create_privacy_tab(self) -> None:
        """Create the privacy settings tab."""
        if CUSTOMTKINTER_AVAILABLE:
            tab = self.notebook.add("🔐 Privacy")
            frame = ctk.CTkScrollableFrame(tab)
            frame.pack(fill="both", expand=True, padx=10, pady=10)
        else:
            frame = ttk.Frame(self.notebook)
            self.notebook.add(frame, text="Privacy")
        
        privacy_config = self.config_data.get('privacy', {})
        
        self.create_setting_group(frame, "Data Protection")
        
        self.widgets['encrypt_data'] = self.create_checkbox_setting(
            frame, "Encrypt stored data",
            privacy_config.get('encrypt_data', False),
            "Encrypt clipboard data files"
        )
        
        self.widgets['auto_delete_days'] = self.create_number_setting(
            frame, "Auto-delete after (days):",
            privacy_config.get('auto_delete_after_days', 0),
            "Automatically delete old data (0 = never)"
        )
        
        # Exclude patterns
        self.create_setting_group(frame, "Content Exclusions")
        
        exclude_text = "\\n".join(privacy_config.get('exclude_patterns', []))
        self.widgets['exclude_patterns'] = self.create_multiline_setting(
            frame, "Exclude patterns (one per line):",
            exclude_text,
            "Regex patterns for content to never process"
        )
    
    def create_setting_group(self, parent: tk.Widget, title: str) -> None:
        """Create a settings group header."""
        if CUSTOMTKINTER_AVAILABLE:
            group_label = ctk.CTkLabel(
                parent,
                text=title,
                font=ctk.CTkFont(size=16, weight="bold")
            )
            group_label.pack(anchor="w", padx=5, pady=(20, 10))
        else:
            group_label = ttk.Label(parent, text=title, font=("Arial", 12, "bold"))
            group_label.pack(anchor="w", padx=5, pady=(20, 10))
    
    def create_checkbox_setting(self, parent: tk.Widget, text: str, 
                               initial_value: bool, tooltip: str = "") -> tk.BooleanVar:
        """Create a checkbox setting."""
        var = tk.BooleanVar(value=initial_value)
        
        if CUSTOMTKINTER_AVAILABLE:
            checkbox = ctk.CTkCheckBox(parent, text=text, variable=var)
            checkbox.pack(anchor="w", padx=20, pady=5)
        else:
            checkbox = ttk.Checkbutton(parent, text=text, variable=var)
            checkbox.pack(anchor="w", padx=20, pady=5)
        
        return var
    
    def create_number_setting(self, parent: tk.Widget, label: str,
                             initial_value: float, tooltip: str = "") -> tk.DoubleVar:
        """Create a number input setting."""
        frame = ttk.Frame(parent)
        frame.pack(fill="x", padx=20, pady=5)
        
        ttk.Label(frame, text=label).pack(side="left")
        
        var = tk.DoubleVar(value=initial_value)
        if CUSTOMTKINTER_AVAILABLE:
            entry = ctk.CTkEntry(frame, textvariable=var, width=100)
        else:
            entry = ttk.Entry(frame, textvariable=var, width=15)
        entry.pack(side="right")
        
        return var
    
    def create_text_setting(self, parent: tk.Widget, label: str,
                           initial_value: str, tooltip: str = "",
                           password: bool = False) -> tk.StringVar:
        """Create a text input setting."""
        frame = ttk.Frame(parent)
        frame.pack(fill="x", padx=20, pady=5)
        
        ttk.Label(frame, text=label).pack(side="left")
        
        var = tk.StringVar(value=initial_value)
        if CUSTOMTKINTER_AVAILABLE:
            entry = ctk.CTkEntry(frame, textvariable=var, show="*" if password else "")
        else:
            entry = ttk.Entry(frame, textvariable=var, show="*" if password else "")
        entry.pack(side="right", fill="x", expand=True, padx=(10, 0))
        
        return var
    
    def create_dropdown_setting(self, parent: tk.Widget, label: str,
                               initial_value: str, options: list,
                               tooltip: str = "") -> tk.StringVar:
        """Create a dropdown setting."""
        frame = ttk.Frame(parent)
        frame.pack(fill="x", padx=20, pady=5)
        
        ttk.Label(frame, text=label).pack(side="left")
        
        var = tk.StringVar(value=initial_value)
        if CUSTOMTKINTER_AVAILABLE:
            combo = ctk.CTkComboBox(frame, variable=var, values=options)
        else:
            combo = ttk.Combobox(frame, textvariable=var, values=options, state="readonly")
        combo.pack(side="right")
        
        return var
    
    def create_folder_setting(self, parent: tk.Widget, label: str,
                             initial_value: str, tooltip: str = "") -> tk.StringVar:
        """Create a folder selection setting."""
        frame = ttk.Frame(parent)
        frame.pack(fill="x", padx=20, pady=5)
        
        ttk.Label(frame, text=label).pack(side="left")
        
        var = tk.StringVar(value=initial_value)
        entry = ttk.Entry(frame, textvariable=var)
        entry.pack(side="left", fill="x", expand=True, padx=(10, 5))
        
        def browse_folder():
            folder = filedialog.askdirectory(initialdir=var.get())
            if folder:
                var.set(folder)
        
        ttk.Button(frame, text="Browse...", command=browse_folder).pack(side="right")
        
        return var
    
    def create_multiline_setting(self, parent: tk.Widget, label: str,
                                initial_value: str, tooltip: str = "") -> tk.Text:
        """Create a multiline text setting."""
        ttk.Label(parent, text=label).pack(anchor="w", padx=20, pady=(10, 5))
        
        text_widget = tk.Text(parent, height=5, width=50)
        text_widget.pack(fill="x", padx=20, pady=5)
        text_widget.insert("1.0", initial_value)
        
        return text_widget
    
    def create_buttons(self) -> None:
        """Create the action buttons."""
        if CUSTOMTKINTER_AVAILABLE:
            button_frame = ctk.CTkFrame(self.window)
            button_frame.pack(fill="x", padx=10, pady=10)
            
            ctk.CTkButton(
                button_frame,
                text="💾 Save Settings",
                command=self.save_settings,
                width=120
            ).pack(side="right", padx=5)
            
            ctk.CTkButton(
                button_frame,
                text="🔄 Reset to Defaults",
                command=self.reset_to_defaults,
                width=120
            ).pack(side="right", padx=5)
            
            ctk.CTkButton(
                button_frame,
                text="❌ Cancel",
                command=self.window.destroy,
                width=80
            ).pack(side="right", padx=5)
        else:
            button_frame = ttk.Frame(self.window)
            button_frame.pack(fill="x", padx=10, pady=10)
            
            ttk.Button(button_frame, text="Save Settings", command=self.save_settings).pack(side="right", padx=5)
            ttk.Button(button_frame, text="Reset to Defaults", command=self.reset_to_defaults).pack(side="right", padx=5)
            ttk.Button(button_frame, text="Cancel", command=self.window.destroy).pack(side="right", padx=5)
    
    def save_settings(self) -> None:
        """Save all settings from widgets to config."""
        try:
            # Update config data from widgets
            self.config_data['app'] = {
                'check_interval': self.widgets['check_interval'].get(),
                'output_dir': self.widgets['output_dir'].get(),
                'auto_start_gui': self.widgets['auto_start_gui'].get(),
                'minimize_to_tray': self.widgets['minimize_to_tray'].get()
            }
            
            # Handler settings
            handlers = {}
            for handler in ['url', 'text', 'number', 'image', 'code', 'email']:
                handlers[handler] = {'enabled': self.widgets[f'{handler}_enabled'].get()}
            
            # Specific handler settings
            handlers['url'].update({
                'timeout': self.widgets['url_timeout'].get(),
                'extract_summary': self.widgets['url_extract_summary'].get()
            })
            
            handlers['text'].update({
                'min_length': self.widgets['text_min_length'].get(),
                'detect_language': self.widgets['text_detect_language'].get()
            })
            
            self.config_data['handlers'] = handlers
            
            # AI settings
            self.config_data['ai'] = {
                'provider': self.widgets['ai_provider'].get(),
                'api_key': self.widgets['ai_api_key'].get(),
                'temperature': self.widgets['ai_temperature'].get(),
                'max_tokens': int(self.widgets['ai_max_tokens'].get())
            }
            
            # Privacy settings
            exclude_patterns = self.widgets['exclude_patterns'].get("1.0", "end-1c").strip().split("\\n")
            exclude_patterns = [p.strip() for p in exclude_patterns if p.strip()]
            
            self.config_data['privacy'] = {
                'encrypt_data': self.widgets['encrypt_data'].get(),
                'auto_delete_after_days': int(self.widgets['auto_delete_days'].get()),
                'exclude_patterns': exclude_patterns
            }
            
            # Save to file
            self.save_config()
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save settings: {e}")
    
    def reset_to_defaults(self) -> None:
        """Reset all settings to default values."""
        result = messagebox.askyesno(
            "Reset Settings",
            "Are you sure you want to reset all settings to defaults?\\n\\nThis cannot be undone."
        )
        
        if result:
            self.config_data = self.get_default_config()
            self.window.destroy()
            self.show()  # Recreate window with default values
    
    def center_window(self) -> None:
        """Center the window on screen."""
        self.window.update_idletasks()
        width = self.window.winfo_width()
        height = self.window.winfo_height()
        x = (self.window.winfo_screenwidth() // 2) - (width // 2)
        y = (self.window.winfo_screenheight() // 2) - (height // 2)
        self.window.geometry(f"{width}x{height}+{x}+{y}")
    
    def show(self) -> None:
        """Show the settings window."""
        self.create_window()
        self.window.focus_set()
        self.window.lift()


if __name__ == "__main__":
    # Test the settings window
    root = tk.Tk()
    root.withdraw()  # Hide the root window
    
    settings_window = SettingsWindow()
    settings_window.show()
    
    root.mainloop()