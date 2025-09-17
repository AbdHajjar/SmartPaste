"""
Clipboard History Window for SmartPaste AI

Beautiful modern window showing clipboard history with search and filters.
"""

import tkinter as tk
from tkinter import ttk, messagebox
from typing import List, Dict, Any, Optional
import json
import os
from datetime import datetime, timedelta
from pathlib import Path
import webbrowser

try:
    import customtkinter as ctk
    CUSTOMTKINTER_AVAILABLE = True
except ImportError:
    CUSTOMTKINTER_AVAILABLE = False


class ClipboardHistoryWindow:
    """
    Modern clipboard history viewer with search and filtering capabilities.
    """
    
    def __init__(self):
        """Initialize the clipboard history window."""
        self.window: Optional[tk.Toplevel] = None
        self.history_data: List[Dict[str, Any]] = []
        self.filtered_data: List[Dict[str, Any]] = []
        self.search_var = tk.StringVar()
        self.filter_var = tk.StringVar(value="All")
        
        # Configure modern theme if available
        if CUSTOMTKINTER_AVAILABLE:
            ctk.set_appearance_mode("system")
            ctk.set_default_color_theme("blue")
    
    def load_history_data(self) -> None:
        """Load clipboard history from SmartPaste data files."""
        self.history_data = []
        data_folder = Path.cwd() / "smartpaste_data"
        
        if not data_folder.exists():
            return
        
        # Load recent markdown files
        for md_file in sorted(data_folder.glob("*.md"), reverse=True):
            try:
                content = md_file.read_text(encoding='utf-8')
                
                # Parse markdown content for clipboard entries
                entries = self._parse_markdown_content(content, md_file.name)
                self.history_data.extend(entries)
                
                # Limit to last 1000 entries for performance
                if len(self.history_data) > 1000:
                    break
                    
            except Exception as e:
                print(f"Error reading {md_file}: {e}")
        
        self.filtered_data = self.history_data.copy()
    
    def _parse_markdown_content(self, content: str, filename: str) -> List[Dict[str, Any]]:
        """Parse markdown content to extract clipboard entries."""
        entries = []
        lines = content.split('\\n')
        current_entry = None
        
        for line in lines:
            line = line.strip()
            
            # Entry timestamp
            if line.startswith('## ') and ('AM' in line or 'PM' in line):
                if current_entry:
                    entries.append(current_entry)
                
                timestamp_str = line.replace('## ', '')
                current_entry = {
                    'timestamp': timestamp_str,
                    'filename': filename,
                    'type': 'unknown',
                    'original_content': '',
                    'enriched_content': '',
                    'metadata': {}
                }
            
            # Content type detection
            elif current_entry and line.startswith('**Type:**'):
                current_entry['type'] = line.replace('**Type:**', '').strip()
            
            # Original content
            elif current_entry and line.startswith('**Original:**'):
                current_entry['original_content'] = line.replace('**Original:**', '').strip()
            
            # Enriched content  
            elif current_entry and line.startswith('**Enriched:**'):
                current_entry['enriched_content'] = line.replace('**Enriched:**', '').strip()
        
        # Don't forget the last entry
        if current_entry:
            entries.append(current_entry)
        
        return entries
    
    def create_window(self) -> None:
        """Create and configure the main window."""
        if CUSTOMTKINTER_AVAILABLE:
            self.window = ctk.CTkToplevel()
            self.window.title("📋 SmartPaste AI - Clipboard History")
            self.window.geometry("1000x700")
        else:
            self.window = tk.Toplevel()
            self.window.title("SmartPaste AI - Clipboard History")
            self.window.geometry("1000x700")
        
        self.window.transient()
        self.window.grab_set()
        
        # Configure window
        self.window.resizable(True, True)
        
        # Create UI elements
        self.create_header()
        self.create_toolbar()
        self.create_content_area()
        self.create_status_bar()
        
        # Center window
        self.center_window()
    
    def create_header(self) -> None:
        """Create the header with title and stats."""
        if CUSTOMTKINTER_AVAILABLE:
            header_frame = ctk.CTkFrame(self.window)
            header_frame.pack(fill="x", padx=10, pady=(10, 5))
            
            title_label = ctk.CTkLabel(
                header_frame,
                text="📋 Clipboard History",
                font=ctk.CTkFont(size=24, weight="bold")
            )
            title_label.pack(side="left", padx=15, pady=10)
            
            stats_label = ctk.CTkLabel(
                header_frame,
                text=f"{len(self.history_data)} items",
                font=ctk.CTkFont(size=14)
            )
            stats_label.pack(side="right", padx=15, pady=10)
        else:
            header_frame = ttk.Frame(self.window)
            header_frame.pack(fill="x", padx=10, pady=(10, 5))
            
            title_label = ttk.Label(
                header_frame,
                text="📋 Clipboard History",
                font=("Arial", 18, "bold")
            )
            title_label.pack(side="left", padx=15, pady=10)
            
            stats_label = ttk.Label(
                header_frame,
                text=f"{len(self.history_data)} items"
            )
            stats_label.pack(side="right", padx=15, pady=10)
    
    def create_toolbar(self) -> None:
        """Create the search and filter toolbar."""
        if CUSTOMTKINTER_AVAILABLE:
            toolbar_frame = ctk.CTkFrame(self.window)
            toolbar_frame.pack(fill="x", padx=10, pady=5)
            
            # Search
            search_label = ctk.CTkLabel(toolbar_frame, text="🔍 Search:")
            search_label.pack(side="left", padx=(15, 5), pady=10)
            
            search_entry = ctk.CTkEntry(
                toolbar_frame,
                textvariable=self.search_var,
                placeholder_text="Search clipboard history...",
                width=300
            )
            search_entry.pack(side="left", padx=5, pady=10)
            search_entry.bind("<KeyRelease>", self.on_search_changed)
            
            # Filter
            filter_label = ctk.CTkLabel(toolbar_frame, text="🏷️ Filter:")
            filter_label.pack(side="left", padx=(20, 5), pady=10)
            
            filter_combo = ctk.CTkComboBox(
                toolbar_frame,
                variable=self.filter_var,
                values=["All", "URL", "Text", "Number", "Image", "Code", "Email"],
                command=self.on_filter_changed,
                width=120
            )
            filter_combo.pack(side="left", padx=5, pady=10)
            
            # Clear button
            clear_btn = ctk.CTkButton(
                toolbar_frame,
                text="Clear",
                command=self.clear_search,
                width=80
            )
            clear_btn.pack(side="right", padx=15, pady=10)
        else:
            toolbar_frame = ttk.Frame(self.window)
            toolbar_frame.pack(fill="x", padx=10, pady=5)
            
            # Search
            ttk.Label(toolbar_frame, text="Search:").pack(side="left", padx=(15, 5), pady=10)
            search_entry = ttk.Entry(toolbar_frame, textvariable=self.search_var, width=40)
            search_entry.pack(side="left", padx=5, pady=10)
            search_entry.bind("<KeyRelease>", self.on_search_changed)
            
            # Filter
            ttk.Label(toolbar_frame, text="Filter:").pack(side="left", padx=(20, 5), pady=10)
            filter_combo = ttk.Combobox(
                toolbar_frame,
                textvariable=self.filter_var,
                values=["All", "URL", "Text", "Number", "Image", "Code", "Email"],
                state="readonly",
                width=15
            )
            filter_combo.pack(side="left", padx=5, pady=10)
            filter_combo.bind("<<ComboboxSelected>>", self.on_filter_changed)
            
            # Clear button
            ttk.Button(toolbar_frame, text="Clear", command=self.clear_search).pack(side="right", padx=15, pady=10)
    
    def create_content_area(self) -> None:
        """Create the main content area with history list."""
        content_frame = ttk.Frame(self.window)
        content_frame.pack(fill="both", expand=True, padx=10, pady=5)
        
        # Create treeview for history items
        columns = ("Time", "Type", "Content", "Enriched")
        self.tree = ttk.Treeview(content_frame, columns=columns, show="headings", height=20)
        
        # Configure columns
        self.tree.heading("Time", text="⏰ Time")
        self.tree.heading("Type", text="🏷️ Type") 
        self.tree.heading("Content", text="📝 Original Content")
        self.tree.heading("Enriched", text="✨ Enhanced Content")
        
        self.tree.column("Time", width=120, minwidth=100)
        self.tree.column("Type", width=80, minwidth=60)
        self.tree.column("Content", width=300, minwidth=200)
        self.tree.column("Enriched", width=400, minwidth=200)
        
        # Scrollbars
        v_scrollbar = ttk.Scrollbar(content_frame, orient="vertical", command=self.tree.yview)
        h_scrollbar = ttk.Scrollbar(content_frame, orient="horizontal", command=self.tree.xview)
        self.tree.configure(yscrollcommand=v_scrollbar.set, xscrollcommand=h_scrollbar.set)
        
        # Pack treeview and scrollbars
        self.tree.pack(side="left", fill="both", expand=True)
        v_scrollbar.pack(side="right", fill="y")
        h_scrollbar.pack(side="bottom", fill="x")
        
        # Bind double-click event
        self.tree.bind("<Double-1>", self.on_item_double_click)
        self.tree.bind("<Button-3>", self.on_item_right_click)  # Right-click context menu
    
    def create_status_bar(self) -> None:
        """Create the status bar."""
        if CUSTOMTKINTER_AVAILABLE:
            status_frame = ctk.CTkFrame(self.window)
            status_frame.pack(fill="x", padx=10, pady=(5, 10))
            
            self.status_label = ctk.CTkLabel(
                status_frame,
                text="Ready",
                font=ctk.CTkFont(size=12)
            )
            self.status_label.pack(side="left", padx=15, pady=5)
        else:
            status_frame = ttk.Frame(self.window)
            status_frame.pack(fill="x", padx=10, pady=(5, 10))
            
            self.status_label = ttk.Label(status_frame, text="Ready")
            self.status_label.pack(side="left", padx=15, pady=5)
    
    def populate_history(self) -> None:
        """Populate the history tree with data."""
        # Clear existing items
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Add filtered data
        for entry in self.filtered_data:
            time_str = entry.get('timestamp', '')[:8]  # Just time part
            content_type = entry.get('type', 'unknown').title()
            original = self._truncate_text(entry.get('original_content', ''), 50)
            enriched = self._truncate_text(entry.get('enriched_content', ''), 60)
            
            self.tree.insert("", "end", values=(time_str, content_type, original, enriched))
        
        # Update status
        count = len(self.filtered_data)
        total = len(self.history_data)
        self.status_label.configure(text=f"Showing {count} of {total} items")
    
    def _truncate_text(self, text: str, max_length: int) -> str:
        """Truncate text to specified length."""
        if len(text) <= max_length:
            return text
        return text[:max_length-3] + "..."
    
    def on_search_changed(self, event=None) -> None:
        """Handle search text changes."""
        self.apply_filters()
    
    def on_filter_changed(self, event=None) -> None:
        """Handle filter changes."""
        self.apply_filters()
    
    def apply_filters(self) -> None:
        """Apply search and filter criteria."""
        search_text = self.search_var.get().lower()
        filter_type = self.filter_var.get()
        
        self.filtered_data = []
        
        for entry in self.history_data:
            # Apply type filter
            if filter_type != "All" and entry.get('type', '').lower() != filter_type.lower():
                continue
            
            # Apply search filter
            if search_text:
                searchable_text = (
                    entry.get('original_content', '') + " " +
                    entry.get('enriched_content', '') + " " +
                    entry.get('type', '')
                ).lower()
                
                if search_text not in searchable_text:
                    continue
            
            self.filtered_data.append(entry)
        
        self.populate_history()
    
    def clear_search(self) -> None:
        """Clear search and filters."""
        self.search_var.set("")
        self.filter_var.set("All")
        self.apply_filters()
    
    def on_item_double_click(self, event) -> None:
        """Handle double-click on history item."""
        selection = self.tree.selection()
        if not selection:
            return
        
        item = self.tree.item(selection[0])
        values = item['values']
        
        if len(values) >= 3:
            # Copy original content to clipboard
            original_content = values[2]
            try:
                import pyperclip
                pyperclip.copy(original_content)
                self.status_label.configure(text="Copied to clipboard!")
                self.window.after(3000, lambda: self.status_label.configure(text="Ready"))
            except Exception as e:
                messagebox.showerror("Error", f"Failed to copy to clipboard: {e}")
    
    def on_item_right_click(self, event) -> None:
        """Handle right-click context menu."""
        # TODO: Implement context menu with actions like:
        # - Copy original
        # - Copy enriched
        # - View details
        # - Delete from history
        pass
    
    def center_window(self) -> None:
        """Center the window on screen."""
        self.window.update_idletasks()
        width = self.window.winfo_width()
        height = self.window.winfo_height()
        x = (self.window.winfo_screenwidth() // 2) - (width // 2)
        y = (self.window.winfo_screenheight() // 2) - (height // 2)
        self.window.geometry(f"{width}x{height}+{x}+{y}")
    
    def show(self) -> None:
        """Show the clipboard history window."""
        self.create_window()
        self.load_history_data()
        self.populate_history()
        self.window.focus_set()
        self.window.lift()
        
        # Keep window open
        self.window.wait_window()


if __name__ == "__main__":
    # Test the clipboard history window
    root = tk.Tk()
    root.withdraw()  # Hide the root window
    
    history_window = ClipboardHistoryWindow()
    history_window.show()