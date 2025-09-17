const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // IPC methods for main process communication
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  send: (channel, data) => ipcRenderer.send(channel, data),
  
  // Event listeners
  on: (channel, func) => {
    const validChannels = [
      'clipboard-history',
      'clipboard-processed', 
      'settings-updated',
      'monitoring-status-changed'
    ];
    if (validChannels.includes(channel)) {
      // Remove the event as an argument since we don't want to expose it
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// For debugging
console.log('Preload script loaded successfully');