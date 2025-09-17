const { app, BrowserWindow, Tray, Menu, ipcMain, globalShortcut, clipboard, Notification } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const Store = require('electron-store');

console.log('SmartPaste Desktop starting...');
console.log('App path:', app.getAppPath());
console.log('Node version:', process.version);

// Initialize configuration store
const store = new Store({
  defaults: {
    monitoring: true,
    notifications: true,
    autoStart: true,
    syncEnabled: false,
    hotkeys: {
      history: 'CommandOrControl+Shift+V',
      settings: 'CommandOrControl+Shift+S',
      process: 'CommandOrControl+Shift+P'
    }
  }
});

class SmartPasteDesktop {
  constructor() {
    console.log('SmartPasteDesktop constructor called');
    this.mainWindow = null;
    this.tray = null;
    this.settingsWindow = null;
    this.historyWindow = null;
    this.pythonProcess = null;
    this.pythonRestartCount = 0;
    this.lastClipboard = '';
    this.clipboardHistory = [];
    this.isMonitoring = false;
    console.log('SmartPasteDesktop constructor completed');
  }

  async initialize() {
    console.log('Initialize method called');
    
    try {
      console.log('Creating tray...');
      this.createTray();
      console.log('Tray created successfully');
      
      console.log('Setting up clipboard monitoring...');
      this.setupClipboardMonitoring();
      console.log('Clipboard monitoring setup complete');
      
      console.log('Registering global shortcuts...');
      this.registerGlobalShortcuts();
      console.log('Global shortcuts registered');
      
      console.log('Starting Python backend...');
      this.startPythonBackend();
      console.log('Python backend started');
      
      console.log('Showing main window...');
      this.showClipboardHistory();
      console.log('Main window shown');
      
      // Hide dock icon on macOS
      if (process.platform === 'darwin') {
        app.dock.hide();
      }
      
      console.log('SmartPaste initialization complete!');
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }

  createTray() {
    const iconPath = path.join(__dirname, '../assets', 'tray-icon.png');
    
    // Try to create tray with icon, fallback to template if icon doesn't exist
    try {
      this.tray = new Tray(iconPath);
    } catch (error) {
      console.log('Icon not found, using template icon');
      // Create a simple template icon as fallback
      this.tray = new Tray(require('electron').nativeImage.createEmpty());
    }
    
    this.updateTrayMenu();
    
    this.tray.setToolTip('SmartPaste - Intelligent Clipboard Assistant');
    
    // Left click to show quick menu
    this.tray.on('click', () => {
      this.showQuickMenu();
    });
  }

  updateTrayMenu() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'SmartPaste',
        type: 'normal',
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Open Dashboard',
        type: 'normal',
        click: () => this.showClipboardHistory()
      },
      {
        label: this.isMonitoring ? 'Pause Monitoring' : 'Start Monitoring',
        type: 'normal',
        click: () => this.toggleMonitoring()
      },
      {
        label: 'Clipboard History',
        type: 'normal',
        accelerator: store.get('hotkeys.history'),
        click: () => this.showClipboardHistory()
      },
      {
        label: 'Process Current Clipboard',
        type: 'normal',
        accelerator: store.get('hotkeys.process'),
        click: () => this.processCurrentClipboard()
      },
      { type: 'separator' },
      {
        label: 'Settings',
        type: 'normal',
        accelerator: store.get('hotkeys.settings'),
        click: () => this.showSettings()
      },
      {
        label: 'About',
        type: 'normal',
        click: () => this.showAbout()
      },
      { type: 'separator' },
      {
        label: 'Quit SmartPaste',
        type: 'normal',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => this.quit()
      }
    ]);
    
    this.tray.setContextMenu(contextMenu);
  }

  setupClipboardMonitoring() {
    // Clear existing interval
    if (this.clipboardInterval) {
      clearInterval(this.clipboardInterval);
      this.clipboardInterval = null;
    }
    
    this.isMonitoring = store.get('monitoring', true);
    
    if (this.isMonitoring) {
      console.log('Starting clipboard monitoring...');
      this.clipboardInterval = setInterval(() => {
        const currentClipboard = clipboard.readText();
        
        if (currentClipboard && currentClipboard !== this.lastClipboard) {
          this.lastClipboard = currentClipboard;
          this.handleNewClipboardContent(currentClipboard);
        }
      }, 500);
      
      // Try to set active icon, fallback silently
      try {
        this.tray.setImage(path.join(__dirname, '../assets', 'tray-icon-active.png'));
      } catch (error) {
        // Ignore icon errors
      }
    } else {
      console.log('Clipboard monitoring stopped');
      try {
        this.tray.setImage(path.join(__dirname, '../assets', 'tray-icon.png'));
      } catch (error) {
        // Ignore icon errors
      }
    }
    
    this.updateTrayMenu();
  }

  async handleNewClipboardContent(content) {
    try {
      // Add to history
      this.clipboardHistory.unshift({
        content,
        timestamp: Date.now(),
        processed: false
      });
      
      // Keep only last 100 items
      if (this.clipboardHistory.length > 100) {
        this.clipboardHistory = this.clipboardHistory.slice(0, 100);
      }
      
      // Process with Python backend
      if (this.pythonProcess) {
        this.sendToPythonBackend(content);
      }
      
      // Show notification if enabled
      if (store.get('notifications', true)) {
        try {
          new Notification({
            title: 'SmartPaste',
            body: 'Processing clipboard content...',
            silent: true
          }).show();
        } catch (error) {
          // Ignore notification errors
        }
      }
      
    } catch (error) {
      console.error('Error handling clipboard content:', error);
    }
  }

  startPythonBackend() {
    try {
      // Start Python SmartPaste core in CLI mode
      this.pythonProcess = spawn('python', ['-m', 'smartpaste', '--cli', '--verbose'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: path.join(__dirname, '../../')  // Use the main smartpaste directory
      });
      
      this.pythonProcess.stdout.on('data', (data) => {
        console.log('Python output:', data.toString());
        // For now, just log the output since CLI mode doesn't return JSON
      });
      
      this.pythonProcess.stderr.on('data', (data) => {
        console.log('Python log:', data.toString());
      });
      
      this.pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
        // Only restart if unexpected exit and not too many retries
        if (code !== 0 && !this.pythonRestartCount) {
          this.pythonRestartCount = 0;
        }
        if (code !== 0 && this.pythonRestartCount < 3) {
          this.pythonRestartCount++;
          console.log(`Restarting Python backend (attempt ${this.pythonRestartCount})`);
          setTimeout(() => this.startPythonBackend(), 5000);
        }
      });
      
    } catch (error) {
      console.error('Error starting Python backend:', error);
      // Continue without Python backend for now
    }
  }

  sendToPythonBackend(content) {
    if (this.pythonProcess && this.pythonProcess.stdin.writable) {
      const message = JSON.stringify({ content, timestamp: Date.now() }) + '\n';
      this.pythonProcess.stdin.write(message);
    }
  }

  handlePythonResult(result) {
    // Update clipboard history with processed result
    const historyItem = this.clipboardHistory.find(item => 
      item.content === result.original_content
    );
    
    if (historyItem) {
      historyItem.processed = true;
      historyItem.result = result;
    }
    
    // Send to renderer processes
    if (this.historyWindow) {
      this.historyWindow.webContents.send('clipboard-processed', result);
    }
    
    // Show notification if enabled
    if (store.get('notifications', true) && result.enriched_content) {
      try {
        new Notification({
          title: 'SmartPaste - Content Processed',
          body: `${result.handler_type}: ${result.enriched_content.substring(0, 100)}...`
        }).show();
      } catch (error) {
        // Ignore notification errors
      }
    }
  }

  registerGlobalShortcuts() {
    const hotkeys = store.get('hotkeys');
    
    // Register global shortcuts
    globalShortcut.register(hotkeys.history, () => {
      this.showClipboardHistory();
    });
    
    globalShortcut.register(hotkeys.settings, () => {
      this.showSettings();
    });
    
    globalShortcut.register(hotkeys.process, () => {
      this.processCurrentClipboard();
    });
  }

  toggleMonitoring() {
    this.isMonitoring = !this.isMonitoring;
    store.set('monitoring', this.isMonitoring);
    this.setupClipboardMonitoring();
    
    // Notify all windows about the change
    if (this.historyWindow) {
      this.historyWindow.webContents.send('monitoring-status-changed', this.isMonitoring);
    }
    
    console.log(`Monitoring ${this.isMonitoring ? 'started' : 'stopped'}`);
  }

  processCurrentClipboard() {
    const currentClipboard = clipboard.readText();
    if (currentClipboard) {
      this.handleNewClipboardContent(currentClipboard);
    }
  }

  showClipboardHistory() {
    if (this.historyWindow) {
      this.historyWindow.focus();
      this.historyWindow.show();
      return;
    }
    
    this.historyWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: false
      },
      title: 'SmartPaste - Dashboard',
      show: true,
      center: true,
      minimizable: true,
      maximizable: true,
      resizable: true,
      alwaysOnTop: false,
      skipTaskbar: false
    });
    
    this.historyWindow.loadFile(path.join(__dirname, 'renderer', 'main-window.html'));
    
    this.historyWindow.once('ready-to-show', () => {
      this.historyWindow.show();
      this.historyWindow.focus();
      this.historyWindow.moveTop();
      // Send history data to renderer
      this.historyWindow.webContents.send('clipboard-history', this.clipboardHistory);
    });
    
    // Minimize to tray instead of closing
    this.historyWindow.on('close', (event) => {
      if (!app.isQuiting) {
        event.preventDefault();
        this.historyWindow.hide();
      }
    });
    
    this.historyWindow.on('closed', () => {
      this.historyWindow = null;
    });
  }

  showSettings() {
    if (this.settingsWindow) {
      this.settingsWindow.focus();
      return;
    }
    
    this.settingsWindow = new BrowserWindow({
      width: 600,
      height: 500,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      title: 'SmartPaste - Settings'
    });
    
    this.settingsWindow.loadFile(path.join(__dirname, 'renderer', 'settings.html'));
    
    this.settingsWindow.on('closed', () => {
      this.settingsWindow = null;
    });
  }

  showAbout() {
    const aboutWindow = new BrowserWindow({
      width: 400,
      height: 300,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      title: 'About SmartPaste',
      resizable: false
    });
    
    aboutWindow.loadFile(path.join(__dirname, 'renderer', 'about.html'));
  }

  showQuickMenu() {
    // Show quick access menu near tray icon
    const quickMenu = Menu.buildFromTemplate([
      {
        label: `Items: ${this.clipboardHistory.length}`,
        enabled: false
      },
      { type: 'separator' },
      ...this.clipboardHistory.slice(0, 5).map((item, index) => ({
        label: item.content.substring(0, 50) + (item.content.length > 50 ? '...' : ''),
        click: () => {
          clipboard.writeText(item.content);
        }
      })),
      { type: 'separator' },
      {
        label: 'Show All...',
        click: () => this.showClipboardHistory()
      }
    ]);
    
    this.tray.popUpContextMenu(quickMenu);
  }

  quit() {
    // Set quitting flag
    app.isQuiting = true;
    
    // Clear clipboard monitoring
    if (this.clipboardInterval) {
      clearInterval(this.clipboardInterval);
      this.clipboardInterval = null;
    }
    
    // Clean up
    if (this.pythonProcess) {
      this.pythonProcess.kill();
    }
    
    // Unregister shortcuts only if app is ready
    if (app.isReady()) {
      globalShortcut.unregisterAll();
    }
    
    app.quit();
  }
}

// IPC handlers
ipcMain.handle('get-settings', () => {
  return store.store;
});

ipcMain.handle('save-settings', (event, settings) => {
  for (const [key, value] of Object.entries(settings)) {
    store.set(key, value);
  }
  return true;
});

ipcMain.handle('get-clipboard-history', () => {
  return app.smartpaste ? app.smartpaste.clipboardHistory : [];
});

ipcMain.handle('process-current-clipboard', () => {
  if (app.smartpaste) {
    app.smartpaste.processCurrentClipboard();
  }
  return true;
});

ipcMain.handle('toggle-monitoring', () => {
  if (app.smartpaste) {
    app.smartpaste.toggleMonitoring();
    return app.smartpaste.isMonitoring;
  }
  return false;
});

ipcMain.handle('get-monitoring-status', () => {
  return app.smartpaste ? app.smartpaste.isMonitoring : false;
});

ipcMain.on('restart-app', () => {
  app.relaunch();
  app.exit();
});

// Application setup
console.log('Creating SmartPasteDesktop instance...');
const smartpaste = new SmartPasteDesktop();
app.smartpaste = smartpaste;

console.log('Starting app initialization...');

// Direct initialization approach
(async () => {
  try {
    await app.whenReady();
    console.log('App ready - initializing SmartPaste...');
    await smartpaste.initialize();
    console.log('SmartPaste initialization complete');
  } catch (error) {
    console.error('Error during app initialization:', error);
  }
})();

app.on('window-all-closed', (event) => {
  // Keep app running in background
  event.preventDefault();
});

app.on('before-quit', () => {
  app.isQuiting = true;
  smartpaste.quit();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Exit directly to avoid quit event loop
  process.exit(0);
} else {
  app.on('second-instance', () => {
    // Show main window if someone tries to run another instance
    smartpaste.showClipboardHistory();
  });
}