/**
 * Sync Provider Implementations
 * Concrete implementations for different sync backends
 */

import { SyncProvider, SyncItem, CloudProviderConfig, LocalProviderConfig, CustomProviderConfig } from './SyncCore';

// Base Error Handler for type safety
const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

// Simple Local Sync Provider (working implementation)
export class LocalSyncProvider implements SyncProvider {
  private items: Map<string, SyncItem> = new Map();
  
  async initialize(): Promise<void> {
    // Already initialized with Map
  }
  
  async syncItem(item: SyncItem): Promise<void> {
    this.items.set(item.id, item);
  }
  
  async pullChanges(since: number): Promise<SyncItem[]> {
    return Array.from(this.items.values())
      .filter(item => item.timestamp > since)
      .sort((a, b) => a.timestamp - b.timestamp);
  }
  
  async cleanup(): Promise<void> {
    this.items.clear();
  }
}

// Stub implementations for cloud providers (to be implemented when dependencies are available)

export class FirebaseSyncProvider implements SyncProvider {
  constructor(config: CloudProviderConfig) {
    console.warn('FirebaseSyncProvider is not yet implemented. Please install firebase dependencies.');
  }
  
  async initialize(): Promise<void> {
    throw new Error('FirebaseSyncProvider requires firebase dependencies to be installed');
  }
  
  async syncItem(item: SyncItem): Promise<void> {
    throw new Error('FirebaseSyncProvider not implemented');
  }
  
  async pullChanges(since: number): Promise<SyncItem[]> {
    throw new Error('FirebaseSyncProvider not implemented');
  }
  
  async cleanup(): Promise<void> {
    // No-op
  }
}

export class AWSSyncProvider implements SyncProvider {
  constructor(config: CloudProviderConfig) {
    console.warn('AWSSyncProvider is not yet implemented. Please install aws-sdk dependencies.');
  }
  
  async initialize(): Promise<void> {
    throw new Error('AWSSyncProvider requires aws-sdk dependencies to be installed');
  }
  
  async syncItem(item: SyncItem): Promise<void> {
    throw new Error('AWSSyncProvider not implemented');
  }
  
  async pullChanges(since: number): Promise<SyncItem[]> {
    throw new Error('AWSSyncProvider not implemented');
  }
  
  async cleanup(): Promise<void> {
    // No-op
  }
}

export class AzureSyncProvider implements SyncProvider {
  constructor(config: CloudProviderConfig) {
    console.warn('AzureSyncProvider is not yet implemented. Please install @azure/cosmos dependencies.');
  }
  
  async initialize(): Promise<void> {
    throw new Error('AzureSyncProvider requires @azure/cosmos dependencies to be installed');
  }
  
  async syncItem(item: SyncItem): Promise<void> {
    throw new Error('AzureSyncProvider not implemented');
  }
  
  async pullChanges(since: number): Promise<SyncItem[]> {
    throw new Error('AzureSyncProvider not implemented');
  }
  
  async cleanup(): Promise<void> {
    // No-op
  }
}

export class LocalNetworkSyncProvider implements SyncProvider {
  constructor(config: LocalProviderConfig) {
    console.warn('LocalNetworkSyncProvider is not yet implemented. Please install network dependencies.');
  }
  
  async initialize(): Promise<void> {
    throw new Error('LocalNetworkSyncProvider requires network dependencies to be installed');
  }
  
  async syncItem(item: SyncItem): Promise<void> {
    throw new Error('LocalNetworkSyncProvider not implemented');
  }
  
  async pullChanges(since: number): Promise<SyncItem[]> {
    throw new Error('LocalNetworkSyncProvider not implemented');
  }
  
  async cleanup(): Promise<void> {
    // No-op
  }
}

// Custom Sync Provider with proper error handling
export class CustomSyncProvider implements SyncProvider {
  private config: CustomProviderConfig;
  
  constructor(config: CustomProviderConfig) {
    this.config = config;
  }
  
  async initialize(): Promise<void> {
    try {
      // Test connection to custom endpoint
      const response = await fetch(`${this.config.endpoint}/health`, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      });
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Custom provider initialization failed: ${getErrorMessage(error)}`);
    }
  }
  
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers
    };
    
    if (this.config.authMethod === 'bearer_token' && this.config.credentials?.token) {
      headers['Authorization'] = `Bearer ${this.config.credentials.token}`;
    } else if (this.config.authMethod === 'api_key' && this.config.credentials?.apiKey) {
      headers['X-API-Key'] = this.config.credentials.apiKey;
    }
    
    return headers;
  }
  
  async syncItem(item: SyncItem): Promise<void> {
    try {
      const response = await fetch(`${this.config.endpoint}/sync`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(item),
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Custom sync failed: ${getErrorMessage(error)}`);
    }
  }
  
  async pullChanges(since: number): Promise<SyncItem[]> {
    try {
      const response = await fetch(`${this.config.endpoint}/changes?since=${since}`, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Custom pull failed: ${getErrorMessage(error)}`);
    }
  }
  
  async cleanup(): Promise<void> {
    // Custom cleanup logic
  }
}