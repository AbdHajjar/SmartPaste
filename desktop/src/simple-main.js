const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
const path = require('path');

console.log('Simple Electron App starting...');

let mainWindow;
let isMonitoring = true;
let settings = {
  monitoring: true,
  notifications: true,
  autoStart: true
};
let clipboardHistory = [];
let lastClipboardContent = '';
let clipboardInterval = null;

function createWindow() {
  console.log('Creating main window...');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: 'SmartPaste - Dashboard',
    show: true,
    center: true
  });

  console.log('Loading HTML file...');
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'main-window.html'));
  
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  console.log('Window creation complete');
  
  // Start clipboard monitoring after window is ready
  setTimeout(() => {
    startClipboardMonitoring();
  }, 1000);
}

// Clipboard monitoring functions
function startClipboardMonitoring() {
  if (isMonitoring && !clipboardInterval) {
    console.log('Starting clipboard monitoring...');
    lastClipboardContent = clipboard.readText();
    
    clipboardInterval = setInterval(() => {
      if (isMonitoring) {
        checkClipboard();
      }
    }, 1000); // Check every second
  }
}

function stopClipboardMonitoring() {
  if (clipboardInterval) {
    console.log('Stopping clipboard monitoring...');
    clearInterval(clipboardInterval);
    clipboardInterval = null;
  }
}

function checkClipboard() {
  try {
    const currentContent = clipboard.readText();
    
    if (currentContent && currentContent !== lastClipboardContent && currentContent.trim().length > 0) {
      console.log('New clipboard content detected:', currentContent.substring(0, 50) + '...');
      
      // Add to history
      const historyItem = {
        id: Date.now(),
        content: currentContent,
        timestamp: new Date().toISOString(),
        type: 'text',
        processed: false
      };
      
      clipboardHistory.unshift(historyItem);
      
      // Keep only last 100 items
      if (clipboardHistory.length > 100) {
        clipboardHistory = clipboardHistory.slice(0, 100);
      }
      
      lastClipboardContent = currentContent;
      
      // Notify renderer process
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('clipboard-history', clipboardHistory);
        mainWindow.webContents.send('clipboard-processed', historyItem);
      }
    }
  } catch (error) {
    console.error('Error checking clipboard:', error);
  }
}

// IPC Handlers
ipcMain.handle('get-monitoring-status', () => {
  console.log('Getting monitoring status:', isMonitoring);
  return isMonitoring;
});

ipcMain.handle('toggle-monitoring', () => {
  isMonitoring = !isMonitoring;
  console.log('Toggling monitoring to:', isMonitoring);
  
  if (isMonitoring) {
    startClipboardMonitoring();
  } else {
    stopClipboardMonitoring();
  }
  
  // Notify renderer process
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('monitoring-status-changed', isMonitoring);
  }
  
  return isMonitoring;
});

ipcMain.handle('get-settings', () => {
  console.log('Getting settings');
  return settings;
});

ipcMain.handle('save-settings', (event, newSettings) => {
  console.log('Saving settings:', newSettings);
  settings = { ...settings, ...newSettings };
  
  // Update monitoring if setting changed
  if (typeof newSettings.monitoring !== 'undefined') {
    isMonitoring = newSettings.monitoring;
    if (isMonitoring) {
      startClipboardMonitoring();
    } else {
      stopClipboardMonitoring();
    }
  }
  
  return true;
});

ipcMain.handle('get-clipboard-history', () => {
  console.log('Getting clipboard history, items:', clipboardHistory.length);
  return clipboardHistory;
});

ipcMain.handle('process-current-clipboard', () => {
  console.log('Processing current clipboard');
  const currentContent = clipboard.readText();
  
  if (currentContent) {
    // Force process current clipboard content
    const historyItem = {
      id: Date.now(),
      content: currentContent,
      timestamp: new Date().toISOString(),
      type: 'text',
      processed: true
    };
    
    // Add to history if not already there
    const exists = clipboardHistory.find(item => item.content === currentContent);
    if (!exists) {
      clipboardHistory.unshift(historyItem);
      
      // Notify renderer process
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('clipboard-history', clipboardHistory);
        mainWindow.webContents.send('clipboard-processed', historyItem);
      }
    }
    
    return { success: true, message: 'Current clipboard processed', item: historyItem };
  }
  
  return { success: false, message: 'No clipboard content found' };
});

app.whenReady().then(() => {
  console.log('App is ready!');
  createWindow();
}).catch(error => {
  console.error('Error in app.whenReady():', error);
});

app.on('window-all-closed', () => {
  stopClipboardMonitoring();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  stopClipboardMonitoring();
});

console.log('Simple Electron setup complete');