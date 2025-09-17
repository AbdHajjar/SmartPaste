# Cross-Platform Sync Architecture

This document outlines the synchronization system that enables data sharing between desktop, mobile, and library instances of SmartPaste.

## Overview

The SmartPaste sync system provides real-time synchronization of:
- Clipboard history
- User settings/preferences
- Processing results cache
- Custom handler configurations
- Automation rules and workflows

## Architecture

### Components

1. **Sync Core**: Common synchronization logic shared across platforms
2. **Cloud Provider**: Firebase/AWS/Custom backend for data storage
3. **Local Network**: P2P sync for devices on same network
4. **Conflict Resolution**: Automatic merging and conflict handling
5. **Security**: End-to-end encryption and secure authentication

### Data Flow

```
Desktop App ←→ Sync Core ←→ Cloud Provider ←→ Sync Core ←→ Mobile App
     ↕                                                      ↕
Library API ←→ Sync Core ←→ Local Network ←→ Sync Core ←→ Other Devices
```

## Sync Providers

### 1. Cloud Provider (Default)

**Features:**
- Real-time sync across internet
- Automatic backups
- Cross-device access
- Scalable storage

**Implementation:**
- Firebase Realtime Database for live sync
- Firebase Auth for user management
- Firebase Storage for large files
- End-to-end encryption

### 2. Local Network Provider

**Features:**
- Fast sync on same network
- No internet required
- Privacy-focused
- Low latency

**Implementation:**
- mDNS/Bonjour for device discovery
- HTTP/WebSocket for data transfer
- Local authentication
- Automatic fallback to cloud

### 3. Custom Provider

**Features:**
- Self-hosted solutions
- Custom protocols
- Enterprise integration
- Full control

**Implementation:**
- Plugin architecture
- Configurable endpoints
- Custom authentication
- API compatibility

## Data Models

### Sync Item

```typescript
interface SyncItem {
  id: string;
  type: 'clipboard' | 'settings' | 'cache' | 'config';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  deviceId: string;
  userId?: string;
  version: number;
  checksum: string;
}
```

### Device Info

```typescript
interface DeviceInfo {
  id: string;
  name: string;
  platform: 'desktop' | 'mobile' | 'library';
  version: string;
  lastSeen: number;
  capabilities: string[];
  syncEnabled: boolean;
}
```

### Sync State

```typescript
interface SyncState {
  lastSync: number;
  pendingItems: SyncItem[];
  conflicts: ConflictItem[];
  deviceStates: Record<string, DeviceState>;
  syncProvider: string;
  enabled: boolean;
}
```

## Conflict Resolution

### Strategies

1. **Last Writer Wins**: Most recent timestamp takes precedence
2. **Device Priority**: Certain devices (e.g., desktop) have higher priority
3. **User Choice**: Present conflicts to user for manual resolution
4. **Merge Strategy**: Intelligent merging for compatible changes

### Implementation

```typescript
class ConflictResolver {
  resolve(local: SyncItem, remote: SyncItem): SyncItem {
    // Automatic resolution based on strategy
    if (this.strategy === 'last-writer-wins') {
      return local.timestamp > remote.timestamp ? local : remote;
    }
    
    // Merge compatible changes
    if (this.canMerge(local, remote)) {
      return this.merge(local, remote);
    }
    
    // Queue for user resolution
    this.queueConflict(local, remote);
    return local; // Keep local until resolved
  }
}
```

## Security

### Encryption

- **Algorithm**: AES-256-GCM for data encryption
- **Key Management**: PBKDF2 for key derivation from user password
- **Transport**: TLS 1.3 for all network communication
- **Storage**: Encrypted at rest using provider-specific encryption

### Authentication

- **OAuth 2.0**: Google, Apple, Microsoft integration
- **Email/Password**: Traditional authentication
- **Device Tokens**: Secure device identification
- **2FA Support**: TOTP and SMS verification

### Privacy

- **Data Minimization**: Only sync essential data
- **User Control**: Granular sync preferences
- **Data Retention**: Configurable retention policies
- **Right to Delete**: Complete data removal option

## Performance

### Optimization Strategies

1. **Delta Sync**: Only sync changes, not full data
2. **Compression**: gzip compression for large payloads
3. **Batching**: Group multiple changes into single requests
4. **Priority Queue**: Process important items first
5. **Background Sync**: Non-blocking synchronization

### Bandwidth Management

- **Adaptive Sync**: Adjust frequency based on connection quality
- **Size Limits**: Maximum size per sync item
- **Throttling**: Rate limiting to prevent abuse
- **Offline Queue**: Store changes for later sync when offline

## Platform Integration

### Desktop (Electron)

```javascript
class DesktopSyncManager {
  constructor() {
    this.syncCore = new SyncCore({
      platform: 'desktop',
      storage: new FileSystemStorage(),
      network: new ElectronNetworkAdapter()
    });
  }
  
  async start() {
    await this.syncCore.initialize();
    this.setupEventListeners();
    this.startPeriodicSync();
  }
}
```

### Mobile (React Native)

```javascript
class MobileSyncManager {
  constructor() {
    this.syncCore = new SyncCore({
      platform: 'mobile',
      storage: new AsyncStorageAdapter(),
      network: new ReactNativeNetworkAdapter()
    });
  }
  
  async start() {
    await this.syncCore.initialize();
    this.setupBackgroundSync();
    this.handleAppStateChanges();
  }
}
```

### Library (Python)

```python
class LibrarySyncManager:
    def __init__(self):
        self.sync_core = SyncCore(
            platform='library',
            storage=FileSystemStorage(),
            network=PythonNetworkAdapter()
        )
    
    async def start(self):
        await self.sync_core.initialize()
        self.setup_event_handlers()
        self.start_background_task()
```

## Configuration

### Global Settings

```yaml
sync:
  enabled: true
  provider: "cloud"  # cloud | local | custom
  auto_sync: true
  sync_interval: 300  # seconds
  max_history_items: 1000
  encryption_enabled: true
  
providers:
  cloud:
    service: "firebase"
    project_id: "smartpaste-sync"
    enable_offline: true
    
  local:
    discovery_timeout: 5000
    broadcast_interval: 30000
    max_peers: 10
    
  custom:
    endpoint: "https://api.example.com/sync"
    auth_method: "bearer_token"
    timeout: 10000

conflict_resolution:
  strategy: "last_writer_wins"  # last_writer_wins | device_priority | user_choice | merge
  auto_resolve: true
  queue_conflicts: true
```

### Device-Specific Settings

```yaml
device:
  sync_clipboard: true
  sync_settings: true
  sync_cache: false
  sync_configs: true
  
  priority: 1  # 1=highest, 10=lowest
  max_payload_size: "10MB"
  compress_data: true
  
mobile_specific:
  sync_on_cellular: false
  background_sync: true
  sync_only_on_wifi: true
  
desktop_specific:
  sync_on_startup: true
  continuous_sync: true
  serve_local_network: true
```

## Monitoring & Analytics

### Metrics

- Sync frequency and latency
- Conflict resolution rates
- Data transfer volumes
- Error rates and types
- Device connectivity patterns

### Logging

```typescript
interface SyncLog {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  event: string;
  deviceId: string;
  provider: string;
  details: any;
}
```

### Health Checks

- Provider connectivity
- Authentication status
- Storage availability
- Network quality
- Sync queue status

## Development & Testing

### Testing Strategy

1. **Unit Tests**: Individual sync components
2. **Integration Tests**: Multi-device scenarios
3. **Performance Tests**: Load and stress testing
4. **Security Tests**: Encryption and authentication
5. **Network Tests**: Various connectivity conditions

### Development Tools

- **Sync Simulator**: Test multi-device scenarios
- **Conflict Generator**: Create test conflicts
- **Network Simulator**: Test various network conditions
- **Debug Dashboard**: Real-time sync monitoring

## Future Enhancements

### Planned Features

1. **Selective Sync**: Choose specific data types to sync
2. **Sync Groups**: Share data with specific user groups
3. **Version History**: Track changes over time
4. **Advanced Encryption**: Zero-knowledge encryption
5. **Mesh Networking**: Direct device-to-device sync

### Extensibility

- **Plugin System**: Custom sync providers
- **Webhook Support**: External system integration
- **API Gateway**: Third-party app integration
- **Event System**: Custom sync triggers

## Deployment

### Cloud Infrastructure

- **Firebase**: Primary cloud provider
- **AWS/Azure**: Alternative cloud options
- **CDN**: Global content delivery
- **Load Balancing**: High availability
- **Auto Scaling**: Handle traffic spikes

### Self-Hosted Options

- **Docker**: Containerized deployment
- **Kubernetes**: Orchestrated scaling
- **Database**: PostgreSQL/MongoDB options
- **Redis**: Caching and pub/sub
- **NGINX**: Reverse proxy and load balancing