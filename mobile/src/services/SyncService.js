/**
 * SmartPaste Mobile Sync Service
 * Handles synchronization between devices and cloud storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';

class SyncService {
  constructor() {
    this.isInitialized = false;
    this.syncQueue = [];
    this.isOnline = false;
    this.syncInterval = null;
    this.settings = null;
  }

  async initialize(settings) {
    if (this.isInitialized) return;

    this.settings = settings;
    
    // Listen for network changes
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected;
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    });

    // Load pending sync items
    await this.loadSyncQueue();
    
    // Start periodic sync if enabled
    if (settings.enableSync) {
      this.startPeriodicSync();
    }

    this.isInitialized = true;
  }

  async loadSyncQueue() {
    try {
      const stored = await AsyncStorage.getItem('sync_queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }

  async saveSyncQueue() {
    try {
      await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    const interval = (this.settings?.syncInterval || 300) * 1000; // Convert to milliseconds
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncAllData();
      }
    }, interval);
  }

  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncClipboardItem(item) {
    if (!this.settings?.enableSync) return;

    const syncItem = {
      id: `clipboard_${item.id}`,
      type: 'clipboard_item',
      action: 'create',
      data: item,
      timestamp: Date.now(),
      deviceId: await this.getDeviceId(),
      retryCount: 0
    };

    this.syncQueue.push(syncItem);
    await this.saveSyncQueue();

    if (this.isOnline) {
      await this.processSyncQueue();
    }
  }

  async syncSettings(settings) {
    if (!this.settings?.enableSync) return;

    const syncItem = {
      id: 'settings',
      type: 'settings',
      action: 'update',
      data: settings,
      timestamp: Date.now(),
      deviceId: await this.getDeviceId(),
      retryCount: 0
    };

    this.syncQueue.push(syncItem);
    await this.saveSyncQueue();

    if (this.isOnline) {
      await this.processSyncQueue();
    }
  }

  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    const itemsToProcess = [...this.syncQueue];
    const successfulItems = [];

    for (const item of itemsToProcess) {
      try {
        const success = await this.syncItem(item);
        if (success) {
          successfulItems.push(item);
        } else {
          // Increment retry count
          item.retryCount = (item.retryCount || 0) + 1;
          
          // Remove from queue if max retries exceeded
          if (item.retryCount > 3) {
            console.warn('Max retries exceeded for sync item:', item.id);
            successfulItems.push(item); // Remove from queue
          }
        }
      } catch (error) {
        console.error('Error syncing item:', item.id, error);
        item.retryCount = (item.retryCount || 0) + 1;
        
        if (item.retryCount > 3) {
          successfulItems.push(item); // Remove from queue
        }
      }
    }

    // Remove successfully processed items from queue
    this.syncQueue = this.syncQueue.filter(item => 
      !successfulItems.some(success => success.id === item.id)
    );
    
    await this.saveSyncQueue();
  }

  async syncItem(item) {
    const provider = this.settings?.syncProvider || 'cloud';
    
    switch (provider) {
      case 'cloud':
        return await this.syncToCloud(item);
      case 'local':
        return await this.syncToLocalNetwork(item);
      case 'custom':
        return await this.syncToCustomEndpoint(item);
      default:
        console.warn('Unknown sync provider:', provider);
        return false;
    }
  }

  async syncToCloud(item) {
    // Mock cloud sync implementation
    // In production, this would integrate with your cloud service
    
    const endpoint = 'https://api.smartpaste.app/sync';
    const deviceId = await this.getDeviceId();
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': deviceId,
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify(item),
        timeout: 10000
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Cloud sync successful:', item.id);
        return true;
      } else {
        console.error('Cloud sync failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Cloud sync error:', error);
      return false;
    }
  }

  async syncToLocalNetwork(item) {
    // Mock local network sync implementation
    // In production, this would discover and sync with local SmartPaste instances
    
    try {
      const localPeers = await this.discoverLocalPeers();
      
      for (const peer of localPeers) {
        try {
          const response = await fetch(`http://${peer.ip}:${peer.port}/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Device-ID': await this.getDeviceId()
            },
            body: JSON.stringify(item),
            timeout: 5000
          });

          if (response.ok) {
            console.log('Local sync successful to peer:', peer.ip);
          }
        } catch (error) {
          console.error('Local sync error to peer:', peer.ip, error);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Local network sync error:', error);
      return false;
    }
  }

  async syncToCustomEndpoint(item) {
    const customEndpoint = this.settings?.customSyncEndpoint;
    if (!customEndpoint) {
      console.error('Custom sync endpoint not configured');
      return false;
    }

    try {
      const response = await fetch(customEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': await this.getDeviceId()
        },
        body: JSON.stringify(item),
        timeout: 10000
      });

      return response.ok;
    } catch (error) {
      console.error('Custom endpoint sync error:', error);
      return false;
    }
  }

  async syncAllData() {
    if (!this.settings?.enableSync || !this.isOnline) return;

    try {
      // Sync clipboard history
      const clipboardHistory = await AsyncStorage.getItem('clipboard_history');
      if (clipboardHistory) {
        const items = JSON.parse(clipboardHistory);
        for (const item of items.slice(0, 10)) { // Sync last 10 items
          await this.syncClipboardItem(item);
        }
      }

      // Sync settings
      const settings = await AsyncStorage.getItem('app_settings');
      if (settings) {
        await this.syncSettings(JSON.parse(settings));
      }

      console.log('Full sync completed');
    } catch (error) {
      console.error('Full sync error:', error);
    }
  }

  async getDeviceId() {
    try {
      let deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = 'mobile_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        await AsyncStorage.setItem('device_id', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return 'mobile_unknown';
    }
  }

  async getAuthToken() {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async discoverLocalPeers() {
    // Mock implementation for local peer discovery
    // In production, this would use mDNS/Bonjour or similar
    return [];
  }

  async pullFromCloud() {
    if (!this.settings?.enableSync || !this.isOnline) return null;

    const endpoint = 'https://api.smartpaste.app/sync/pull';
    const deviceId = await this.getDeviceId();
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'X-Device-ID': deviceId,
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        timeout: 10000
      });

      if (response.ok) {
        const data = await response.json();
        await this.mergeSyncedData(data);
        return data;
      }
    } catch (error) {
      console.error('Pull from cloud error:', error);
    }
    
    return null;
  }

  async mergeSyncedData(data) {
    // Merge clipboard items
    if (data.clipboardItems) {
      const existingHistory = await AsyncStorage.getItem('clipboard_history');
      const existing = existingHistory ? JSON.parse(existingHistory) : [];
      
      // Simple merge strategy: add new items that don't exist
      const existingIds = new Set(existing.map(item => item.id));
      const newItems = data.clipboardItems.filter(item => !existingIds.has(item.id));
      
      if (newItems.length > 0) {
        const merged = [...newItems, ...existing].slice(0, 100);
        await AsyncStorage.setItem('clipboard_history', JSON.stringify(merged));
      }
    }

    // Merge settings (prioritize local changes, but update missing keys)
    if (data.settings) {
      const existingSettings = await AsyncStorage.getItem('app_settings');
      if (existingSettings) {
        const existing = JSON.parse(existingSettings);
        const merged = { ...data.settings, ...existing }; // Local settings override
        await AsyncStorage.setItem('app_settings', JSON.stringify(merged));
      }
    }
  }

  updateSettings(newSettings) {
    this.settings = newSettings;
    
    if (newSettings.enableSync) {
      this.startPeriodicSync();
    } else {
      this.stopPeriodicSync();
    }
  }
}

export default new SyncService();