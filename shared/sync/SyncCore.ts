/**
 * Cross-Platform Sync Core
 * Universal synchronization logic shared across all platforms
 */

export interface SyncItem {
  id: string;
  type: 'clipboard' | 'settings' | 'cache' | 'config' | 'automation';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  deviceId: string;
  userId?: string;
  version: number;
  checksum: string;
  priority: number;
}

export interface DeviceInfo {
  id: string;
  name: string;
  platform: 'desktop' | 'mobile' | 'library';
  version: string;
  lastSeen: number;
  capabilities: string[];
  syncEnabled: boolean;
  priority: number;
}

export interface SyncState {
  lastSync: number;
  pendingItems: SyncItem[];
  conflicts: ConflictItem[];
  deviceStates: Record<string, DeviceState>;
  syncProvider: string;
  enabled: boolean;
  isOnline: boolean;
  isSyncing: boolean;
}

export interface ConflictItem {
  id: string;
  local: SyncItem;
  remote: SyncItem;
  strategy: 'manual' | 'auto';
  resolved: boolean;
  resolution?: SyncItem;
  timestamp: number;
}

export interface DeviceState {
  lastSeen: number;
  syncVersion: number;
  pendingAcks: string[];
  conflicts: number;
}

export interface SyncConfig {
  enabled: boolean;
  provider: 'cloud' | 'local' | 'custom';
  autoSync: boolean;
  syncInterval: number;
  maxHistoryItems: number;
  encryptionEnabled: boolean;
  conflictStrategy: 'last_writer_wins' | 'device_priority' | 'user_choice' | 'merge';
  providers: {
    cloud: CloudProviderConfig;
    local: LocalProviderConfig;
    custom: CustomProviderConfig;
  };
  filters: SyncFilter[];
}

export interface SyncFilter {
  type: string;
  enabled: boolean;
  maxSize?: number;
  excludePatterns?: string[];
  includePatterns?: string[];
}

export interface CloudProviderConfig {
  service: 'firebase' | 'aws' | 'azure';
  projectId?: string;
  region?: string;
  enableOffline: boolean;
  authMethod: 'oauth' | 'api_key' | 'token';
  credentials?: any;
}

export interface LocalProviderConfig {
  discoveryTimeout: number;
  broadcastInterval: number;
  maxPeers: number;
  port: number;
  enableEncryption: boolean;
}

export interface CustomProviderConfig {
  endpoint: string;
  authMethod: 'bearer_token' | 'api_key' | 'oauth';
  timeout: number;
  headers?: Record<string, string>;
  credentials?: any;
}

export class SyncCore {
  private config: SyncConfig;
  private state: SyncState;
  private providers: Map<string, SyncProvider>;
  private conflictResolver: ConflictResolver;
  private encryption: EncryptionService;
  private storage: StorageAdapter;
  private network: NetworkAdapter;
  private eventEmitter: EventEmitter;
  private syncTimer?: any;
  
  constructor(options: {
    config: SyncConfig;
    storage: StorageAdapter;
    network: NetworkAdapter;
    platform: string;
  }) {
    this.config = options.config;
    this.storage = options.storage;
    this.network = options.network;
    
    this.state = {
      lastSync: 0,
      pendingItems: [],
      conflicts: [],
      deviceStates: {},
      syncProvider: this.config.provider,
      enabled: this.config.enabled,
      isOnline: false,
      isSyncing: false
    };
    
    this.providers = new Map();
    this.conflictResolver = new ConflictResolver(this.config.conflictStrategy);
    this.encryption = new EncryptionService(this.config.encryptionEnabled);
    this.eventEmitter = new EventEmitter();
    
    this.initializeProviders();
  }
  
  async initialize(): Promise<void> {
    try {
      // Load saved state
      await this.loadState();
      
      // Initialize providers
      for (const [name, provider] of this.providers) {
        await provider.initialize();
      }
      
      // Setup network monitoring
      this.network.onConnectionChange((isOnline) => {
        this.state.isOnline = isOnline;
        if (isOnline) {
          this.processPendingItems();
        }
      });
      
      // Start periodic sync if enabled
      if (this.config.autoSync) {
        this.startPeriodicSync();
      }
      
      this.emit('initialized');
    } catch (error) {
      this.emit('error', { type: 'initialization', error });
      throw error;
    }
  }
  
  private initializeProviders(): void {
    // Cloud provider
    if (this.config.providers.cloud) {
      const cloudProvider = this.createCloudProvider(this.config.providers.cloud);
      this.providers.set('cloud', cloudProvider);
    }
    
    // Local network provider
    if (this.config.providers.local) {
      const localProvider = this.createLocalProvider(this.config.providers.local);
      this.providers.set('local', localProvider);
    }
    
    // Custom provider
    if (this.config.providers.custom) {
      const customProvider = this.createCustomProvider(this.config.providers.custom);
      this.providers.set('custom', customProvider);
    }
  }
  
  async syncItem(item: Omit<SyncItem, 'id' | 'timestamp' | 'version' | 'checksum'>): Promise<void> {
    try {
      // Create full sync item
      const syncItem: SyncItem = {
        ...item,
        id: this.generateId(),
        timestamp: Date.now(),
        version: 1,
        checksum: this.calculateChecksum(item.data),
        priority: item.priority || 1
      };
      
      // Apply filters
      if (!this.shouldSync(syncItem)) {
        return;
      }
      
      // Encrypt if enabled
      if (this.config.encryptionEnabled) {
        syncItem.data = await this.encryption.encrypt(syncItem.data);
      }
      
      // Add to pending items
      this.state.pendingItems.push(syncItem);
      await this.saveState();
      
      // Try immediate sync if online
      if (this.state.isOnline && !this.state.isSyncing) {
        await this.processPendingItems();
      }
      
      this.emit('item_queued', syncItem);
    } catch (error) {
      this.emit('error', { type: 'sync_item', error, item });
      throw error;
    }
  }
  
  private async processPendingItems(): Promise<void> {
    if (this.state.isSyncing || this.state.pendingItems.length === 0) {
      return;
    }
    
    this.state.isSyncing = true;
    this.emit('sync_started');
    
    try {
      const provider = this.providers.get(this.config.provider);
      if (!provider) {
        throw new Error(`Provider not found: ${this.config.provider}`);
      }
      
      // Sort by priority and timestamp
      this.state.pendingItems.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.timestamp - b.timestamp;
      });
      
      const successfulItems: string[] = [];
      
      for (const item of this.state.pendingItems) {
        try {
          await provider.syncItem(item);
          successfulItems.push(item.id);
          this.emit('item_synced', item);
        } catch (error) {
          this.emit('error', { type: 'item_sync', error, item });
          
          // Retry logic
          if (this.shouldRetry(item)) {
            item.version++;
          } else {
            successfulItems.push(item.id); // Remove failed item
          }
        }
      }
      
      // Remove successful items
      this.state.pendingItems = this.state.pendingItems.filter(
        item => !successfulItems.includes(item.id)
      );
      
      // Update last sync time
      this.state.lastSync = Date.now();
      await this.saveState();
      
      this.emit('sync_completed', { 
        synced: successfulItems.length,
        pending: this.state.pendingItems.length 
      });
      
    } catch (error) {
      this.emit('error', { type: 'sync_process', error });
    } finally {
      this.state.isSyncing = false;
    }
  }
  
  async pullChanges(): Promise<SyncItem[]> {
    try {
      const provider = this.providers.get(this.config.provider);
      if (!provider) {
        throw new Error(`Provider not found: ${this.config.provider}`);
      }
      
      const changes = await provider.pullChanges(this.state.lastSync);
      const processedChanges: SyncItem[] = [];
      
      for (const change of changes) {
        // Decrypt if needed
        if (this.config.encryptionEnabled) {
          change.data = await this.encryption.decrypt(change.data);
        }
        
        // Check for conflicts
        const conflict = await this.detectConflict(change);
        if (conflict) {
          await this.handleConflict(conflict);
          continue;
        }
        
        // Apply change
        await this.applyChange(change);
        processedChanges.push(change);
        
        this.emit('change_applied', change);
      }
      
      // Update device states
      for (const change of changes) {
        this.updateDeviceState(change.deviceId, {
          lastSeen: change.timestamp,
          syncVersion: change.version
        });
      }
      
      await this.saveState();
      return processedChanges;
      
    } catch (error) {
      this.emit('error', { type: 'pull_changes', error });
      throw error;
    }
  }
  
  private async detectConflict(remoteItem: SyncItem): Promise<ConflictItem | null> {
    // Check for existing item with same ID but different data
    const existingItems = await this.storage.getItems({
      type: remoteItem.type,
      id: remoteItem.id
    });
    
    for (const localItem of existingItems) {
      if (localItem.checksum !== remoteItem.checksum && 
          Math.abs(localItem.timestamp - remoteItem.timestamp) < 5000) { // 5 second window
        return {
          id: this.generateId(),
          local: localItem,
          remote: remoteItem,
          strategy: this.config.conflictStrategy === 'user_choice' ? 'manual' : 'auto',
          resolved: false,
          timestamp: Date.now()
        };
      }
    }
    
    return null;
  }
  
  private async handleConflict(conflict: ConflictItem): Promise<void> {
    this.state.conflicts.push(conflict);
    
    if (conflict.strategy === 'auto') {
      const resolution = this.conflictResolver.resolve(conflict.local, conflict.remote);
      conflict.resolution = resolution;
      conflict.resolved = true;
      
      await this.applyChange(resolution);
      this.emit('conflict_resolved', conflict);
    } else {
      this.emit('conflict_detected', conflict);
    }
    
    await this.saveState();
  }
  
  async resolveConflict(conflictId: string, resolution: SyncItem): Promise<void> {
    const conflict = this.state.conflicts.find(c => c.id === conflictId);
    if (!conflict) {
      throw new Error('Conflict not found');
    }
    
    conflict.resolution = resolution;
    conflict.resolved = true;
    
    await this.applyChange(resolution);
    await this.saveState();
    
    this.emit('conflict_resolved', conflict);
  }
  
  private async applyChange(item: SyncItem): Promise<void> {
    switch (item.action) {
      case 'create':
      case 'update':
        await this.storage.setItem(item.type, item.id, item.data);
        break;
      case 'delete':
        await this.storage.deleteItem(item.type, item.id);
        break;
    }
  }
  
  private shouldSync(item: SyncItem): boolean {
    const filter = this.config.filters.find(f => f.type === item.type);
    if (!filter || !filter.enabled) {
      return false;
    }
    
    // Check size limit
    if (filter.maxSize) {
      const size = JSON.stringify(item.data).length;
      if (size > filter.maxSize) {
        return false;
      }
    }
    
    // Check include/exclude patterns
    const content = JSON.stringify(item.data);
    
    if (filter.excludePatterns) {
      for (const pattern of filter.excludePatterns) {
        if (content.includes(pattern)) {
          return false;
        }
      }
    }
    
    if (filter.includePatterns) {
      const hasMatch = filter.includePatterns.some(pattern => 
        content.includes(pattern)
      );
      if (!hasMatch) {
        return false;
      }
    }
    
    return true;
  }
  
  private shouldRetry(item: SyncItem): boolean {
    return item.version < 3; // Max 3 retries
  }
  
  private startPeriodicSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    this.syncTimer = setInterval(async () => {
      if (this.state.isOnline && !this.state.isSyncing) {
        await this.processPendingItems();
        await this.pullChanges();
      }
    }, this.config.syncInterval * 1000);
  }
  
  private stopPeriodicSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }
  }
  
  private async loadState(): Promise<void> {
    try {
      const savedState = await this.storage.get('sync_state');
      if (savedState) {
        this.state = { ...this.state, ...savedState };
      }
    } catch (error) {
      // Ignore load errors, use default state
    }
  }
  
  private async saveState(): Promise<void> {
    try {
      await this.storage.set('sync_state', this.state);
    } catch (error) {
      this.emit('error', { type: 'save_state', error });
    }
  }
  
  private updateDeviceState(deviceId: string, updates: Partial<DeviceState>): void {
    if (!this.state.deviceStates[deviceId]) {
      this.state.deviceStates[deviceId] = {
        lastSeen: 0,
        syncVersion: 0,
        pendingAcks: [],
        conflicts: 0
      };
    }
    
    Object.assign(this.state.deviceStates[deviceId], updates);
  }
  
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private calculateChecksum(data: any): string {
    // Simple checksum - in production use proper hash function
    return btoa(JSON.stringify(data)).slice(0, 16);
  }
  
  private createCloudProvider(config: CloudProviderConfig): SyncProvider {
    switch (config.service) {
      case 'firebase':
        return new FirebaseSyncProvider(config);
      case 'aws':
        return new AWSSyncProvider(config);
      case 'azure':
        return new AzureSyncProvider(config);
      default:
        throw new Error(`Unsupported cloud provider: ${config.service}`);
    }
  }
  
  private createLocalProvider(config: LocalProviderConfig): SyncProvider {
    return new LocalNetworkSyncProvider(config);
  }
  
  private createCustomProvider(config: CustomProviderConfig): SyncProvider {
    return new CustomSyncProvider(config);
  }
  
  // Public API methods
  async start(): Promise<void> {
    await this.initialize();
  }
  
  async stop(): Promise<void> {
    this.stopPeriodicSync();
    
    for (const [name, provider] of this.providers) {
      await provider.cleanup();
    }
    
    this.emit('stopped');
  }
  
  updateConfig(newConfig: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.autoSync !== undefined) {
      if (newConfig.autoSync) {
        this.startPeriodicSync();
      } else {
        this.stopPeriodicSync();
      }
    }
    
    this.emit('config_updated', this.config);
  }
  
  getState(): SyncState {
    return { ...this.state };
  }
  
  getConflicts(): ConflictItem[] {
    return this.state.conflicts.filter(c => !c.resolved);
  }
  
  getPendingItems(): SyncItem[] {
    return [...this.state.pendingItems];
  }
  
  // Event system
  on(event: string, listener: Function): void {
    this.eventEmitter.on(event, listener);
  }
  
  off(event: string, listener: Function): void {
    this.eventEmitter.off(event, listener);
  }
  
  private emit(event: string, data?: any): void {
    this.eventEmitter.emit(event, data);
  }
}

// Abstract interfaces for platform adapters
export interface StorageAdapter {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  getItems(filter: any): Promise<any[]>;
  setItem(type: string, id: string, data: any): Promise<void>;
  deleteItem(type: string, id: string): Promise<void>;
}

export interface NetworkAdapter {
  onConnectionChange(callback: (isOnline: boolean) => void): void;
  isOnline(): boolean;
}

export interface SyncProvider {
  initialize(): Promise<void>;
  syncItem(item: SyncItem): Promise<void>;
  pullChanges(since: number): Promise<SyncItem[]>;
  cleanup(): Promise<void>;
}

// Utility classes
export class ConflictResolver {
  constructor(private strategy: string) {}
  
  resolve(local: SyncItem, remote: SyncItem): SyncItem {
    switch (this.strategy) {
      case 'last_writer_wins':
        return local.timestamp > remote.timestamp ? local : remote;
      
      case 'device_priority':
        // Implementation would depend on device priority logic
        return local;
      
      case 'merge':
        return this.attemptMerge(local, remote);
      
      default:
        return local;
    }
  }
  
  private attemptMerge(local: SyncItem, remote: SyncItem): SyncItem {
    // Simple merge strategy - in production this would be more sophisticated
    if (typeof local.data === 'object' && typeof remote.data === 'object') {
      return {
        ...local,
        data: { ...remote.data, ...local.data },
        timestamp: Math.max(local.timestamp, remote.timestamp)
      };
    }
    
    return local.timestamp > remote.timestamp ? local : remote;
  }
}

export class EncryptionService {
  constructor(private enabled: boolean) {}
  
  async encrypt(data: any): Promise<any> {
    if (!this.enabled) return data;
    
    // Placeholder - implement actual encryption
    return btoa(JSON.stringify(data));
  }
  
  async decrypt(data: any): Promise<any> {
    if (!this.enabled) return data;
    
    // Placeholder - implement actual decryption
    try {
      return JSON.parse(atob(data));
    } catch {
      return data;
    }
  }
}

export class EventEmitter {
  private events: Map<string, Function[]> = new Map();
  
  on(event: string, listener: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
  }
  
  off(event: string, listener: Function): void {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  emit(event: string, data?: any): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }
}