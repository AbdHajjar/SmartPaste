# SmartPaste Shared Components

This directory contains shared code, configurations, and resources used across all SmartPaste platforms (Desktop, Mobile, Python Library).

## 📁 Structure

```
shared/
├── config/              # Shared configuration files
│   ├── handlers.yaml    # Content handler configurations
│   ├── automation.yaml  # Automation rule templates
│   └── defaults.yaml    # Default settings
├── schemas/             # Data schemas and validation
│   ├── content.json     # Content structure schema
│   ├── handlers.json    # Handler interface schema
│   └── sync.json        # Sync protocol schema
├── assets/              # Shared assets
│   ├── icons/           # Application icons
│   ├── images/          # Shared images
│   └── fonts/           # Custom fonts
├── docs/                # Shared documentation
│   ├── api.md           # API documentation
│   ├── protocols.md     # Communication protocols
│   └── schemas.md       # Schema documentation
├── scripts/             # Build and deployment scripts
│   ├── build.sh         # Cross-platform build script
│   ├── deploy.sh        # Deployment automation
│   └── test.sh          # Cross-platform testing
└── types/               # TypeScript/Interface definitions
    ├── content.ts       # Content type definitions
    ├── handlers.ts      # Handler interface definitions
    └── sync.ts          # Sync protocol types
```

## 🔧 Configuration Management

### Handler Configuration
```yaml
# shared/config/handlers.yaml
handlers:
  url:
    enabled: true
    timeout: 10
    max_retries: 3
    extract_summary: true
    extract_keywords: true
  
  text:
    enabled: true
    language_detection: true
    summarization: true
    max_length: 1000
  
  number:
    enabled: true
    conversions:
      - temperature
      - length
      - weight
      - volume
```

### Automation Rules
```yaml
# shared/config/automation.yaml
rules:
  auto_summarize:
    name: "Auto Summarize Long Text"
    condition: "content_type == 'text' and content_length > 500"
    action: "generate_summary"
    enabled: true
    
  url_metadata:
    name: "Extract URL Metadata"
    condition: "content_type == 'url'"
    action: "extract_metadata"
    enabled: true
```

## 📊 Data Schemas

### Content Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SmartPaste Content",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique content identifier"
    },
    "content": {
      "type": "string",
      "description": "Original content"
    },
    "type": {
      "type": "string",
      "enum": ["text", "url", "image", "number", "code", "email", "math"]
    },
    "timestamp": {
      "type": "integer",
      "description": "Unix timestamp"
    },
    "processed": {
      "type": "boolean",
      "description": "Processing status"
    },
    "result": {
      "type": "object",
      "description": "Processing result"
    }
  },
  "required": ["id", "content", "type", "timestamp"]
}
```

### Handler Interface
```typescript
// shared/types/handlers.ts
export interface ContentHandler {
  name: string;
  version: string;
  enabled: boolean;
  
  canHandle(content: string): boolean;
  process(content: string, options?: ProcessingOptions): Promise<ProcessingResult>;
  configure(config: HandlerConfig): void;
}

export interface ProcessingResult {
  original_content: string;
  enriched_content: string;
  metadata: Record<string, any>;
  confidence: number;
  processing_time: number;
}
```

## 🔄 Sync Protocol

### Message Format
```typescript
// shared/types/sync.ts
export interface SyncMessage {
  type: 'content_update' | 'settings_change' | 'handler_result';
  timestamp: number;
  device_id: string;
  payload: any;
  signature?: string;
}

export interface ContentUpdate {
  content_id: string;
  content: string;
  content_type: string;
  timestamp: number;
  processed: boolean;
  result?: ProcessingResult;
}
```

### Communication Protocol
```json
{
  "protocol": "smartpaste-sync",
  "version": "1.0",
  "endpoints": {
    "websocket": "wss://sync.smartpaste.ai/ws",
    "rest": "https://api.smartpaste.ai/v1",
    "desktop": "ws://localhost:8080"
  },
  "authentication": {
    "type": "jwt",
    "refresh": true,
    "biometric": true
  }
}
```

## 🎨 Brand Assets

### Icons
- **App Icons**: Platform-specific application icons
- **Tray Icons**: System tray/status bar icons
- **Content Icons**: Icons for different content types
- **Action Icons**: Icons for actions and operations

### Color Palette
```css
:root {
  --primary-color: #2563eb;
  --primary-dark: #1d4ed8;
  --primary-light: #60a5fa;
  
  --secondary-color: #10b981;
  --secondary-dark: #059669;
  --secondary-light: #6ee7b7;
  
  --neutral-50: #f9fafb;
  --neutral-100: #f3f4f6;
  --neutral-900: #111827;
  
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}
```

### Typography
```css
.typography {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Headings */
  --font-h1: 2.25rem;
  --font-h2: 1.875rem;
  --font-h3: 1.5rem;
  --font-h4: 1.25rem;
  
  /* Body */
  --font-body: 1rem;
  --font-small: 0.875rem;
  --font-xs: 0.75rem;
}
```

## 🚀 Build Scripts

### Cross-Platform Build
```bash
#!/bin/bash
# shared/scripts/build.sh

echo "Building SmartPaste for all platforms..."

# Python Library
echo "Building Python library..."
cd python-lib
python setup.py sdist bdist_wheel
cd ..

# Desktop Application  
echo "Building desktop application..."
cd desktop
npm run build
cd ..

# Mobile Application
echo "Building mobile application..."
cd mobile
npm run build:android
npm run build:ios
cd ..

echo "Build complete!"
```

### Deployment Script
```bash
#!/bin/bash
# shared/scripts/deploy.sh

echo "Deploying SmartPaste..."

# Deploy Python package to PyPI
cd python-lib
twine upload dist/*
cd ..

# Deploy desktop releases to GitHub
cd desktop
gh release upload v1.0.0 dist/*
cd ..

# Deploy mobile apps to stores
# (This would integrate with App Store Connect and Google Play Console)

echo "Deployment complete!"
```

## 🧪 Testing

### Cross-Platform Test Suite
```bash
#!/bin/bash
# shared/scripts/test.sh

echo "Running cross-platform tests..."

# Test Python library
cd python-lib
python -m pytest tests/
cd ..

# Test desktop application
cd desktop
npm test
cd ..

# Test mobile application
cd mobile
npm test
cd ..

echo "All tests completed!"
```

### Integration Tests
```python
# shared/tests/integration_test.py
import pytest
from smartpaste import SmartPasteApp

def test_cross_platform_compatibility():
    """Test that core functionality works across platforms"""
    app = SmartPasteApp()
    
    # Test URL handling
    url_result = app.process_content("https://example.com")
    assert url_result['handler_type'] == 'url'
    
    # Test text handling
    text_result = app.process_content("Hello world!")
    assert text_result['handler_type'] == 'text'
```

## 📚 Documentation

### API Documentation
- **REST API**: Complete API reference
- **WebSocket Protocol**: Real-time communication
- **Handler Interface**: Custom handler development
- **Sync Protocol**: Cross-device synchronization

### Development Guides
- **Platform Setup**: Environment setup for each platform
- **Contributing**: Guidelines for contributors
- **Architecture**: System architecture overview
- **Deployment**: Release and deployment processes

## 🔧 Utilities

### Configuration Validator
```python
# shared/utils/config_validator.py
import yaml
import jsonschema

def validate_config(config_path, schema_path):
    """Validate configuration against schema"""
    with open(config_path) as f:
        config = yaml.safe_load(f)
    
    with open(schema_path) as f:
        schema = json.load(f)
    
    jsonschema.validate(config, schema)
    return True
```

### Asset Optimizer
```javascript
// shared/utils/asset_optimizer.js
const sharp = require('sharp');
const fs = require('fs');

async function optimizeIcons() {
  const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];
  
  for (const size of sizes) {
    await sharp('assets/icons/source.svg')
      .resize(size, size)
      .png()
      .toFile(`assets/icons/icon-${size}.png`);
  }
}
```

## 🤝 Contributing

When contributing to shared components:

1. **Test Across Platforms**: Ensure changes work on all platforms
2. **Update Documentation**: Keep schemas and docs current
3. **Version Compatibility**: Maintain backward compatibility
4. **Security Review**: All shared code gets security review

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.